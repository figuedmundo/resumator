"""Cover letter service for cover letter management operations."""

import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.database import get_db
from app.models.cover_letter import CoverLetter, CoverLetterVersion, CoverLetterTemplate
from app.core.exceptions import ValidationError, UnauthorizedError, CoverLetterNotFoundError
from app.services.ai_service import AIGeneratorClient
from app.services.storage_service import StorageService, get_storage_service


logger = logging.getLogger(__name__)


class CoverLetterService:
    """Service for cover letter operations matching Resume workflow."""
    
    def __init__(self, db: Optional[Session] = None, storage_service: Optional[StorageService] = None):
        """Initialize cover letter service."""
        self.db = db
        self.ai_client = AIGeneratorClient()
        if storage_service:
            self.storage_service = storage_service
        else:
            self.storage_service = get_storage_service()
    
    def _get_db(self) -> Session:
        """Get database session."""
        if self.db:
            return self.db
        return next(get_db())
    
    # ======================================
    # Master Cover Letter Operations
    # ======================================
    
    def create_cover_letter(self, user_id: int, title: str, content: Optional[str] = None, is_default: bool = False) -> CoverLetter:
        """Create a new master cover letter and its initial version."""
        db = self._get_db()
        
        try:
            # Create cover letter record
            cover_letter = CoverLetter(
                user_id=user_id,
                title=title,
                is_default=is_default
            )
            
            db.add(cover_letter)
            db.flush()  # Use flush to get the ID before committing

            # Create initial version if content is provided
            if content:
                self.create_version(
                    user_id=user_id,
                    cover_letter_id=cover_letter.id,
                    content=content,
                    is_original=True
                )
            
            db.commit()
            db.refresh(cover_letter)
            
            logger.info(f"Created cover letter '{title}' for user {user_id} (ID: {cover_letter.id})")
            return cover_letter
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create cover letter for user {user_id}: {e}")
            raise ValidationError(f"Failed to create cover letter: {str(e)}")

    def get_cover_letter(self, user_id: int, cover_letter_id: int) -> CoverLetter:
        """Get a cover letter by ID with ownership verification."""
        db = self._get_db()
        
        try:
            cover_letter = db.query(CoverLetter).filter(
                and_(
                    CoverLetter.id == cover_letter_id,
                    CoverLetter.user_id == user_id
                )
            ).first()
            
            if not cover_letter:
                raise CoverLetterNotFoundError(cover_letter_id)
            
            return cover_letter
            
        except Exception as e:
            logger.error(f"Failed to get cover letter {cover_letter_id}: {e}")
            if isinstance(e, (ValidationError, CoverLetterNotFoundError)):
                raise
            raise ValidationError(f"Failed to retrieve cover letter: {str(e)}")

    def list_user_cover_letters(self, user_id: int) -> List[CoverLetter]:
        """List all cover letters for a user."""
        db = self._get_db()
        
        try:
            results = db.query(
                CoverLetter,
                CoverLetterVersion.version
            ).outerjoin(
                CoverLetterVersion,
                and_(
                    CoverLetter.id == CoverLetterVersion.cover_letter_id,
                    CoverLetterVersion.is_original == True
                )
            ).filter(
                CoverLetter.user_id == user_id
            ).order_by(CoverLetter.created_at.desc()).all()

            cover_letters = []
            for cl, version in results:
                cl.version = version
                cover_letters.append(cl)
            return cover_letters
        except Exception as e:
            logger.error(f"Failed to list cover letters for user {user_id}: {e}")
            return []

    def update_cover_letter(self, user_id: int, cover_letter_id: int, 
                           title: Optional[str] = None, 
                           is_default: Optional[bool] = None) -> CoverLetter:
        """Update cover letter metadata."""
        db = self._get_db()
        
        try:
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            if title is not None:
                cover_letter.title = title
            if is_default is not None:
                cover_letter.is_default = is_default
            
            db.commit()
            db.refresh(cover_letter)
            
            logger.info(f"Updated cover letter {cover_letter_id} for user {user_id}")
            return cover_letter
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update cover letter {cover_letter_id}: {e}")
            if isinstance(e, (ValidationError, CoverLetterNotFoundError)):
                raise
            raise ValidationError(f"Failed to update cover letter: {str(e)}")

    # ======================================
    # Cover Letter Version Operations
    # ======================================
    
    def create_version(self, user_id: int, cover_letter_id: int, content: str, 
                      job_description: Optional[str] = None, 
                      is_original: bool = True) -> CoverLetterVersion:
        """Create a new version for a cover letter."""
        db = self._get_db()
        
        try:
            # Verify ownership
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            # Generate version number
            if is_original:
                version_name = "v1"
            else:
                version_count = db.query(CoverLetterVersion).filter(
                    CoverLetterVersion.cover_letter_id == cover_letter_id
                ).count()
                version_name = f"v{version_count + 1}"
            
            # Create version
            version = CoverLetterVersion(
                cover_letter_id=cover_letter_id,
                version=version_name,
                markdown_content=content,
                job_description=job_description,
                is_original=is_original
            )
            
            db.add(version)
            db.commit()
            db.refresh(version)
            
            # Save to storage
            self._save_to_storage(user_id, cover_letter_id, version_name, content)
            
            logger.info(f"Created version {version_name} for cover letter {cover_letter_id}")
            return version
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create cover letter version: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to create version: {str(e)}")
    
    def list_versions(self, user_id: int, cover_letter_id: int) -> List[CoverLetterVersion]:
        """List all versions for a cover letter."""
        try:
            # Verify ownership
            self.get_cover_letter(user_id, cover_letter_id)
            
            db = self._get_db()
            return db.query(CoverLetterVersion).filter(
                CoverLetterVersion.cover_letter_id == cover_letter_id
            ).order_by(CoverLetterVersion.created_at.desc()).all()
            
        except Exception as e:
            logger.error(f"Failed to list versions for cover letter {cover_letter_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            return []
    
    def get_version(self, user_id: int, cover_letter_id: int, version_id: int) -> Optional[CoverLetterVersion]:
        """Get a specific version."""
        try:
            # Verify ownership
            self.get_cover_letter(user_id, cover_letter_id)
            
            db = self._get_db()
            return db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.id == version_id,
                    CoverLetterVersion.cover_letter_id == cover_letter_id
                )
            ).first()
            
        except Exception as e:
            logger.error(f"Failed to get cover letter version {version_id}: {e}")
            return None
    
    def update_version(self, user_id: int, cover_letter_id: int, version_id: int, 
                      content: str) -> Optional[CoverLetterVersion]:
        """Update a version's content."""
        db = self._get_db()
        
        try:
            # Verify ownership
            self.get_cover_letter(user_id, cover_letter_id)
            
            # Get version
            version = db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.id == version_id,
                    CoverLetterVersion.cover_letter_id == cover_letter_id
                )
            ).first()
            
            if not version:
                raise ValidationError("Version not found")
            
            # Update content
            version.markdown_content = content
            db.commit()
            db.refresh(version)
            
            # Save to storage
            self._save_to_storage(user_id, cover_letter_id, version.version, content)
            
            logger.info(f"Updated cover letter version {version_id}")
            return version
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update version {version_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            return None
    
    def delete_version(self, user_id: int, cover_letter_id: int, version_id: int) -> bool:
        """Delete a specific version with dependency checking."""
        db = self._get_db()
        
        try:
            # Check dependencies
            dependencies = self.check_version_dependencies(user_id, cover_letter_id, version_id)
            
            if not dependencies['can_delete']:
                raise ValidationError(dependencies['message'])
            
            # Get version to delete
            version = db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.id == version_id,
                    CoverLetterVersion.cover_letter_id == cover_letter_id
                )
            ).first()
            
            if not version:
                return False
            
            # Delete
            db.delete(version)
            db.commit()
            
            logger.info(f"Deleted cover letter version {version_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete version {version_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            return False
    
    # ======================================
    # Content Generation
    # ======================================
    
    def generate_content(self, resume_content: str, job_description: str, 
                        company: str, position: str, 
                        template: Optional[str] = None, additional_instructions: Optional[str] = None) -> str:
        """Generate cover letter content using AI (preview only)."""
        try:
            content = self.ai_client.generate_cover_letter(
                template or "",
                job_description,
                resume_content,
                company,
                position,
                additional_instructions=additional_instructions
            )
            return content
        except Exception as e:
            logger.error(f"Failed to generate cover letter content: {e}")
            raise ValidationError(f"Failed to generate content: {str(e)}")
    
    def generate_and_save(self, user_id: int, title: str, resume_content: str, 
                         job_description: str, company: str, position: str,
                         template_id: Optional[int] = None,
                         base_cover_letter_content: Optional[str] = None,
                         additional_instructions: Optional[str] = None) -> CoverLetter:
        """Generate cover letter using AI and save as new cover letter with initial version."""
        try:
            # Get template name if provided
            template_content = base_cover_letter_content
            if not template_content and template_id:
                db = self._get_db()
                template = db.query(CoverLetterTemplate).filter(
                    CoverLetterTemplate.id == template_id
                ).first()
                if template:
                    template_content = template.content_template
            
            # Generate content
            content = self.generate_content(
                resume_content,
                job_description,
                company,
                position,
                template_content,
                additional_instructions=additional_instructions
            )
            
            # Create cover letter
            cover_letter = self.create_cover_letter(
                user_id=user_id,
                title=title,
                is_default=False
            )
            
            # Create initial version
            self.create_version(
                user_id=user_id,
                cover_letter_id=cover_letter.id,
                content=content,
                job_description=job_description,
                is_original=True
            )
            
            return cover_letter
            
        except Exception as e:
            logger.error(f"Failed to generate and save cover letter: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to generate cover letter: {str(e)}")
    
    def customize_for_application(self, user_id: int, cover_letter_id: int, 
                                 job_description: str, company: str,
                                 customized_content: Optional[str] = None,
                                 additional_instructions: Optional[str] = None) -> CoverLetterVersion:
        """Create a company-customized version of a cover letter.
        
        If customized_content is provided, it will be saved directly.
        Otherwise, AI will generate the customization.
        """
        db = self._get_db()
        
        try:
            # Verify ownership
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            # Get original version
            original_version = db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.cover_letter_id == cover_letter_id,
                    CoverLetterVersion.is_original == True
                )
            ).order_by(CoverLetterVersion.created_at.desc()).first()
            
            if not original_version:
                raise ValidationError("No original version found")
            
            # Define the expected version name for the customization
            version_name = f"v2 - {company}"

            # Check if this specific customized version already exists
            existing_version = db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.cover_letter_id == cover_letter_id,
                    CoverLetterVersion.version == version_name
                )
            ).first()
            
            if existing_version:
                logger.info(f"Reusing existing version for company {company}: {existing_version.version}")
                return existing_version
            
            # Generate customized content if not provided
            if not customized_content:
                customized_content = self.ai_client.generate_cover_letter(
                    "",
                    job_description,
                    "",
                    company,
                    "",
                    additional_instructions=additional_instructions
                )
            
            # Create customized version
            version = CoverLetterVersion(
                cover_letter_id=cover_letter_id,
                version=version_name,
                markdown_content=customized_content,
                job_description=job_description,
                is_original=False
            )
            
            db.add(version)
            db.commit()
            db.refresh(version)
            
            # Save to storage
            self._save_to_storage(user_id, cover_letter_id, version_name, customized_content)
            
            logger.info(f"Created company-specific version {version_name} for cover letter {cover_letter_id}")
            return version
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to customize cover letter: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to customize: {str(e)}")
    
    # ======================================
    # Dependency Checking
    # ======================================
    
    def check_dependencies(self, user_id: int, cover_letter_id: int) -> Dict[str, Any]:
        """Check what applications depend on this cover letter."""
        from app.models.application import Application
        db = self._get_db()
        
        try:
            # Verify ownership
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            # Get all applications using any version of this cover letter
            applications = db.query(Application).join(
                CoverLetterVersion,
                Application.cover_letter_version_id == CoverLetterVersion.id
            ).filter(
                CoverLetterVersion.cover_letter_id == cover_letter_id
            ).all()
            
            result = {
                'can_delete': len(applications) == 0,
                'application_count': len(applications),
                'applications': [],
                'message': ''
            }
            
            if len(applications) == 0:
                result['message'] = "Cover letter can be safely deleted. No applications depend on it."
            else:
                result['message'] = (
                    f"Cannot delete cover letter. It is referenced by {len(applications)} application(s). "
                    "Delete those applications first."
                )
                
                for app in applications:
                    result['applications'].append({
                        'id': app.id,
                        'company': app.company,
                        'position': app.position,
                        'status': app.status,
                        'applied_date': app.applied_date.isoformat() if app.applied_date else None
                    })
            
            return result
        except Exception as e:
            logger.error(f"Failed to check cover letter dependencies: {e}")
            if isinstance(e, (ValidationError, CoverLetterNotFoundError)):
                raise
            raise ValidationError(f"Failed to check dependencies: {str(e)}")

    def check_version_dependencies(self, user_id: int, cover_letter_id: int, 
                                   version_id: int) -> Dict[str, Any]:
        """Check what applications depend on this version."""
        from app.models.application import Application
        db = self._get_db()
        
        try:
            # Verify ownership and get version
            self.get_cover_letter(user_id, cover_letter_id)
            
            version = db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.id == version_id,
                    CoverLetterVersion.cover_letter_id == cover_letter_id
                )
            ).first()
            
            if not version:
                raise ValidationError("Version not found")
            
            # Check version count
            version_count = db.query(CoverLetterVersion).filter(
                CoverLetterVersion.cover_letter_id == cover_letter_id
            ).count()
            
            # Check applications using this version
            applications = db.query(Application).filter(
                Application.cover_letter_version_id == version_id
            ).all()
            
            result = {
                'can_delete': False,
                'application_count': len(applications),
                'applications': [],
                'is_original': version.is_original,
                'is_last_version': version_count <= 1,
                'message': ''
            }
            
            # Check deletion rules
            if version_count <= 1:
                result['message'] = "Cannot delete the only version of a cover letter."
            elif version.is_original and len(applications) > 0:
                result['message'] = (
                    f"Cannot delete original version. It is referenced by "
                    f"{len(applications)} application(s)."
                )
                for app in applications:
                    result['applications'].append({
                        'id': app.id,
                        'company': app.company,
                        'position': app.position
                    })
            elif len(applications) > 0:
                result['message'] = (
                    f"Cannot delete version. It is used by {len(applications)} application(s)."
                )
                for app in applications:
                    result['applications'].append({
                        'id': app.id,
                        'company': app.company,
                        'position': app.position
                    })
            else:
                result['can_delete'] = True
                result['message'] = "Version can be safely deleted."
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to check version dependencies: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to check dependencies: {str(e)}")
    
    # ======================================
    # Deletion Operations
    # ======================================
    
    def delete_cover_letter(self, user_id: int, cover_letter_id: int) -> bool:
        """Delete a cover letter only if no applications depend on it.
        
        Raises ValidationError if applications exist.
        """
        db = self._get_db()
        
        try:
            # Check dependencies
            dependencies = self.check_dependencies(user_id, cover_letter_id)
            
            if not dependencies['can_delete']:
                raise ValidationError(
                    f"Cannot delete cover letter. It is referenced by "
                    f"{dependencies['application_count']} application(s). "
                    "Delete those applications first."
                )
            
            # Verify ownership
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            # Delete (cascade will handle versions)
            db.delete(cover_letter)
            db.commit()
            
            logger.info(f"Deleted cover letter {cover_letter_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete cover letter {cover_letter_id}: {e}")
            if isinstance(e, (ValidationError, CoverLetterNotFoundError)):
                raise
            return False
    
    # ======================================
    # Template Operations
    # ======================================
    
    def list_templates(self, skip: int = 0, limit: int = 50) -> tuple[List[CoverLetterTemplate], int]:
        """Get all available templates."""
        db = self._get_db()
        
        try:
            total = db.query(CoverLetterTemplate).count()
            templates = db.query(CoverLetterTemplate).order_by(
                CoverLetterTemplate.created_at.desc()
            ).offset(skip).limit(limit).all()
            
            return templates, total
            
        except Exception as e:
            logger.error(f"Failed to list templates: {e}")
            return [], 0
    
    def get_template(self, template_id: int) -> CoverLetterTemplate:
        """Get a specific template."""
        db = self._get_db()
        
        try:
            template = db.query(CoverLetterTemplate).filter(
                CoverLetterTemplate.id == template_id
            ).first()
            
            if not template:
                raise ValidationError(f"Template {template_id} not found")
            
            return template
            
        except Exception as e:
            logger.error(f"Failed to get template {template_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to retrieve template: {str(e)}")
    
    # ======================================
    # Storage Operations
    # ======================================
    
    def _save_to_storage(self, user_id: int, cover_letter_id: int, version: str, content: str):
        """Save cover letter content to storage."""
        try:
            file_path = f"users/{user_id}/cover_letters/{cover_letter_id}/versions/{version}/content.md"
            self.storage_service.save(file_path, content)
        except Exception as e:
            logger.warning(f"Failed to save cover letter to storage: {e}")
