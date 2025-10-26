"""Resume service for resume management operations."""

import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.database import get_db
from app.models.resume import Resume, ResumeVersion
from app.models.cover_letter import CoverLetter
from app.schemas.resume import ResumeCreate, ResumeUpdate
from app.core.exceptions import ResumeNotFoundError, ValidationError, UnauthorizedError
from app.services.ai_service import AIGeneratorClient
from app.services.storage_service import StorageService, get_storage_service


logger = logging.getLogger(__name__)


class ResumeService:
    """Service for resume operations."""
    
    def __init__(self, db: Optional[Session] = None, storage_service: Optional[StorageService] = None):
        """Initialize resume service."""
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
    
    def upload_resume(self, user_id: int, title: str, markdown: str) -> Resume:
        """Save master resume and create initial version."""
        db = self._get_db()
        
        try:
            # Create resume record
            resume = Resume(
                user_id=user_id,
                title=title,
                is_default=False  # Will be set explicitly if needed
            )
            
            db.add(resume)
            db.flush()  # Get the ID
            
            # Create initial version (v1)
            version = ResumeVersion(
                resume_id=resume.id,
                version="v1",
                markdown_content=markdown,
                is_original=True
            )
            
            db.add(version)
            db.commit()
            db.refresh(resume)
            
            # Save markdown to storage
            self._save_resume_to_storage(user_id, resume.id, "v1", markdown)
            
            logger.info(f"Created resume {title} for user {user_id} (ID: {resume.id})")
            return resume
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create resume for user {user_id}: {e}")
            raise ValidationError(f"Failed to create resume: {str(e)}")
        
    def get_resume(self, user_id: int, resume_id: int) -> Resume:
        """Return resume metadata."""
        db = self._get_db()
        
        try:
            resume = db.query(Resume).filter(
                and_(Resume.id == resume_id, Resume.user_id == user_id)
            ).first()
            
            if not resume:
                raise ResumeNotFoundError(resume_id)
            
            return resume
            
        except Exception as e:
            logger.error(f"Failed to get resume {resume_id} for user {user_id}: {e}")
            if isinstance(e, ResumeNotFoundError):
                raise
            raise ValidationError(f"Failed to retrieve resume: {str(e)}")
    
    def update_resume(self, user_id: int, resume_id: int, title: Optional[str] = None,
                     is_default: Optional[bool] = None) -> Resume:
        """Update resume metadata."""
        db = self._get_db()

        try:
            resume = db.query(Resume).filter(
                and_(Resume.id == resume_id, Resume.user_id == user_id)
            ).first()

            if not resume:
                raise ResumeNotFoundError(resume_id)

            if title is not None:
                resume.title = title
            if is_default is not None:
                resume.is_default = is_default

            db.commit()
            db.refresh(resume)

            logger.info(f"Updated resume {resume_id} for user {user_id}")
            return resume

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update resume {resume_id} for user {user_id}: {e}")
            if isinstance(e, ResumeNotFoundError):
                raise
            raise ValidationError(f"Failed to update resume: {str(e)}")
    
    def list_user_resumes(self, user_id: int) -> List[Resume]:
        """List all resumes for a user."""
        db = self._get_db()
        
        try:
            return db.query(Resume).filter(Resume.user_id == user_id).all()
        except Exception as e:
            logger.error(f"Failed to list resumes for user {user_id}: {e}")
            return []
    
    def preview_customization(self, user_id: int, resume_id: int, job_description: str, 
                             instructions: Optional[Dict[str, Any]] = None) -> str:
        """Generate customized resume WITHOUT saving to database (preview only)."""
        db = self._get_db()
        
        try:
            # Get the resume and verify ownership
            resume = self.get_resume(user_id, resume_id)
            
            # Get the latest version or original
            latest_version = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).order_by(ResumeVersion.created_at.desc()).first()
            
            if not latest_version:
                raise ValidationError("No resume version found")
            
            # Generate customized resume using AI (NO DATABASE SAVE)
            # Format instructions properly for the AI service
            formatted_instructions = None
            if instructions:
                if isinstance(instructions, str):
                    formatted_instructions = {'custom_instructions': instructions}
                elif isinstance(instructions, dict):
                    formatted_instructions = instructions
            
            customized_markdown = self.ai_client.rewrite_resume(
                latest_version.markdown_content, 
                job_description, 
                formatted_instructions
            )
            
            logger.info(f"Generated preview customization for resume {resume_id} (not saved)")
            return customized_markdown
            
        except Exception as e:
            logger.error(f"Failed to preview customization for resume {resume_id}: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to preview customization: {str(e)}")
    
    def save_customization(self, user_id: int, resume_id: int, customized_markdown: str,
                          job_description: str, instructions: Optional[Dict[str, Any]] = None) -> str:
        """Save a previewed customization to database as a new version."""
        db = self._get_db()
        
        try:
            # Verify ownership
            resume = self.get_resume(user_id, resume_id)
            
            # Generate new version number
            version_count = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).count()
            new_version = f"v{version_count + 1}"
            
            # Create new version record
            new_version_record = ResumeVersion(
                resume_id=resume_id,
                version=new_version,
                markdown_content=customized_markdown,
                job_description=job_description,
                is_original=False
            )
            
            db.add(new_version_record)
            db.commit()
            db.refresh(new_version_record)
            
            # Save to storage
            self._save_resume_to_storage(user_id, resume_id, new_version, customized_markdown)
            
            logger.info(f"Saved customized resume version {new_version} for resume {resume_id}")
            return customized_markdown
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save customization for resume {resume_id}: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to save customization: {str(e)}")
    
    def customize_resume(self, user_id: int, resume_id: int, job_description: str, 
                        instructions: Optional[Dict[str, Any]] = None) -> str:
        """Legacy method: Call AIGeneratorClient.rewrite_resume and create a new version record.
        
        Deprecated: Use preview_customization followed by save_customization instead.
        """
        db = self._get_db()
        
        try:
            # Get the resume and verify ownership
            resume = self.get_resume(user_id, resume_id)
            
            # Get the latest version or original
            latest_version = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).order_by(ResumeVersion.created_at.desc()).first()
            
            if not latest_version:
                raise ValidationError("No resume version found")
            
            # Generate customized resume using AI
            # Format instructions properly for the AI service
            formatted_instructions = None
            if instructions:
                if isinstance(instructions, str):
                    formatted_instructions = {'custom_instructions': instructions}
                elif isinstance(instructions, dict):
                    formatted_instructions = instructions
            
            customized_markdown = self.ai_client.rewrite_resume(
                latest_version.markdown_content, 
                job_description, 
                formatted_instructions
            )
            
            # Generate new version number
            version_count = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).count()
            new_version = f"v{version_count + 1}"
            
            # Create new version record
            new_version_record = ResumeVersion(
                resume_id=resume_id,
                version=new_version,
                markdown_content=customized_markdown,
                job_description=job_description,
                is_original=False
            )
            
            db.add(new_version_record)
            db.commit()
            db.refresh(new_version_record)
            
            # Save to storage
            self._save_resume_to_storage(user_id, resume_id, new_version, customized_markdown)
            
            logger.info(f"Created customized resume version {new_version} for resume {resume_id}")
            return customized_markdown
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to customize resume {resume_id}: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to customize resume: {str(e)}")
    
    def list_resume_versions(self, user_id: int, resume_id: int) -> List[ResumeVersion]:
        """Return available versions (v1, v1.1...)."""
        try:
            # Verify ownership
            self.get_resume(user_id, resume_id)
            
            db = self._get_db()
            return db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).order_by(ResumeVersion.created_at.desc()).all()
            
        except Exception as e:
            logger.error(f"Failed to list versions for resume {resume_id}: {e}")
            if isinstance(e, ResumeNotFoundError):
                raise
            return []
    
    def get_resume_version(self, user_id: int, resume_id: int, version_id: int) -> Optional[ResumeVersion]:
        """Get a specific resume version."""
        try:
            # Verify ownership
            self.get_resume(user_id, resume_id)
            
            db = self._get_db()
            return db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.id == version_id,
                    ResumeVersion.resume_id == resume_id
                )
            ).first()
            
        except Exception as e:
            logger.error(f"Failed to get resume version {version_id}: {e}")
            return None
    
    def update_resume_version(self, user_id: int, resume_id: int, version_id: int, 
                            markdown: str) -> Optional[ResumeVersion]:
        """Update a resume version's content."""
        db = self._get_db()
        
        try:
            # Verify ownership
            self.get_resume(user_id, resume_id)
            
            # Get the version
            version = db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.id == version_id,
                    ResumeVersion.resume_id == resume_id
                )
            ).first()
            
            if not version:
                return None
            
            # Update content
            version.markdown_content = markdown
            db.commit()
            db.refresh(version)
            
            # Save to storage
            self._save_resume_to_storage(user_id, resume_id, version.version, markdown)
            
            logger.info(f"Updated resume version {version_id}")
            return version
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update resume version {version_id}: {e}")
            return None
    
    def generate_cover_letter(self, user_id: int, company: str, position: str, 
                            job_description: str, resume_id: Optional[int] = None,
                            template: Optional[str] = None) -> CoverLetter:
        """Generate a cover letter using AI."""
        db = self._get_db()
        
        try:
            # Get resume summary if resume_id provided
            resume_summary = ""
            if resume_id:
                resume = self.get_resume(user_id, resume_id)
                latest_version = db.query(ResumeVersion).filter(
                    ResumeVersion.resume_id == resume_id
                ).order_by(ResumeVersion.created_at.desc()).first()
                
                if latest_version:
                    # Extract first few lines as summary
                    lines = latest_version.markdown_content.split('\n')
                    resume_summary = '\n'.join(lines[:10])  # First 10 lines
            
            # Generate cover letter
            cover_letter_content = self.ai_client.generate_cover_letter(
                template or "",
                job_description,
                resume_summary,
                company,
                position
            )
            
            # Save cover letter
            cover_letter = CoverLetter(
                user_id=user_id,
                title=f"Cover Letter - {company} - {position}",
                content=cover_letter_content,
                template_used=template
            )
            
            db.add(cover_letter)
            db.commit()
            db.refresh(cover_letter)
            
            logger.info(f"Generated cover letter for {company} - {position}")
            return cover_letter
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to generate cover letter: {e}")
            raise ValidationError(f"Failed to generate cover letter: {str(e)}")
    
    def _save_resume_to_storage(self, user_id: int, resume_id: int, version: str, markdown: str):
        """Save resume markdown to storage."""
        try:
            file_path = f"users/{user_id}/resumes/{resume_id}/versions/{version}/resume.md"
            self.storage_service.save(file_path, markdown)
        except Exception as e:
            logger.warning(f"Failed to save resume to storage: {e}")
    
    def check_resume_dependencies(
        self, 
        user_id: int, 
        resume_id: int
    ) -> Dict[str, Any]:
        """Check what applications depend on this resume.
        
        Returns detailed information about dependencies and deletion options.
        """
        from app.models.application import Application
        db = self._get_db()
        
        try:
            # Verify ownership
            resume = self.get_resume(user_id, resume_id)
            
            # Get all applications that reference this resume
            applications = db.query(Application).filter(
                Application.resume_id == resume_id
            ).all()
            
            result = {
                'can_delete': len(applications) == 0,
                'application_count': len(applications),
                'applications': [],
                'options': [],
                'message': ''
            }
            
            if len(applications) == 0:
                result['message'] = "Resume can be safely deleted. No applications depend on it."
                result['options'] = ['delete']
            else:
                result['message'] = (
                    f"Cannot delete resume. It is referenced by {len(applications)} application(s). "
                    "You must first delete the applications or reassign them to a different resume."
                )
                result['options'] = [
                    'delete_applications_and_resume',
                    'reassign_applications',
                    'cancel'
                ]
                
                # Include application details
                for app in applications:
                    result['applications'].append({
                        'id': app.id,
                        'company': app.company,
                        'position': app.position,
                        'status': app.status,
                        'applied_date': app.applied_date.isoformat() if app.applied_date else None,
                        'has_customized_version': app.customized_resume_version_id is not None
                    })
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to check resume dependencies: {e}")
            if isinstance(e, ResumeNotFoundError):
                raise
            raise ValidationError(f"Failed to check dependencies: {str(e)}")
    
    def check_version_dependencies(
        self, 
        user_id: int, 
        resume_id: int,
        version_id: int
    ) -> Dict[str, Any]:
        """Check what applications depend on this version."""
        from app.models.application import Application
        db = self._get_db()
        
        try:
            # Verify ownership and get version
            self.get_resume(user_id, resume_id)
            
            version = db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.id == version_id,
                    ResumeVersion.resume_id == resume_id
                )
            ).first()
            
            if not version:
                raise ValidationError("Version not found")
            
            # Check version count
            version_count = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).count()
            
            # Check applications that reference this version
            applications_original = db.query(Application).filter(
                Application.resume_version_id == version_id
            ).all()
            
            applications_customized = db.query(Application).filter(
                Application.customized_resume_version_id == version_id
            ).all()
            
            total_apps = len(applications_original) + len(applications_customized)
            
            result = {
                'can_delete': False,
                'application_count': total_apps,
                'applications': [],
                'is_original': version.is_original,
                'is_last_version': version_count <= 1,
                'message': ''
            }
            
            # Check deletion rules
            if version_count <= 1:
                result['message'] = "Cannot delete the only version of a resume."
            elif version.is_original and len(applications_original) > 0:
                result['message'] = (
                    f"Cannot delete original version. It is referenced by "
                    f"{len(applications_original)} application(s) as their original version."
                )
                for app in applications_original:
                    result['applications'].append({
                        'id': app.id,
                        'company': app.company,
                        'position': app.position,
                        'reference_type': 'original'
                    })
            elif len(applications_customized) > 0:
                result['message'] = (
                    f"Cannot delete version. It is used as a customized version by "
                    f"{len(applications_customized)} application(s)."
                )
                for app in applications_customized:
                    result['applications'].append({
                        'id': app.id,
                        'company': app.company,
                        'position': app.position,
                        'reference_type': 'customized'
                    })
            else:
                result['can_delete'] = True
                result['message'] = "Version can be safely deleted."
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to check version dependencies: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to check dependencies: {str(e)}")
    
    def delete_resume_with_applications(
        self, 
        user_id: int, 
        resume_id: int,
        force: bool = False
    ) -> Dict[str, Any]:
        """Delete resume and all dependent applications."""
        from app.services.application_service import ApplicationService
        from app.models.application import Application
        
        db = self._get_db()
        application_service = ApplicationService(db)
        
        try:
            # Verify ownership
            resume = self.get_resume(user_id, resume_id)
            
            # Check dependencies
            dependencies = self.check_resume_dependencies(user_id, resume_id)
            
            if not force and not dependencies['can_delete']:
                raise ValidationError(
                    f"Resume has {dependencies['application_count']} dependent application(s). "
                    "Use force=True to delete all applications and the resume."
                )
            
            result = {
                'success': False,
                'resume_deleted': False,
                'applications_deleted': 0,
                'versions_deleted': 0,
                'message': ''
            }
            
            # Delete all applications first
            applications = db.query(Application).filter(
                Application.resume_id == resume_id
            ).all()
            
            for app in applications:
                try:
                    delete_result = application_service.delete_application(
                        user_id, app.id, dry_run=False
                    )
                    if delete_result['success']:
                        result['applications_deleted'] += 1
                except Exception as e:
                    logger.warning(f"Failed to delete application {app.id}: {e}")
            
            # Count versions before deletion
            version_count = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).count()
            
            # Delete resume (cascade will handle versions)
            db.delete(resume)
            db.commit()
            
            result['success'] = True
            result['resume_deleted'] = True
            result['versions_deleted'] = version_count
            result['message'] = (
                f"Deleted resume '{resume.title}', "
                f"{result['applications_deleted']} application(s), "
                f"and {result['versions_deleted']} version(s)."
            )
            
            logger.info(result['message'])
            return result
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete resume with applications: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to delete resume: {str(e)}")
    
    def reassign_applications(
        self,
        user_id: int,
        from_resume_id: int,
        to_resume_id: int,
        to_version_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Reassign all applications from one resume to another."""
        from app.models.application import Application
        db = self._get_db()
        
        try:
            # Verify ownership of both resumes
            from_resume = self.get_resume(user_id, from_resume_id)
            to_resume = self.get_resume(user_id, to_resume_id)
            
            # Get target version
            if to_version_id:
                to_version = db.query(ResumeVersion).filter(
                    and_(
                        ResumeVersion.id == to_version_id,
                        ResumeVersion.resume_id == to_resume_id
                    )
                ).first()
                
                if not to_version:
                    raise ValidationError("Target version not found")
            else:
                # Use latest original version
                to_version = db.query(ResumeVersion).filter(
                    and_(
                        ResumeVersion.resume_id == to_resume_id,
                        ResumeVersion.is_original == True
                    )
                ).order_by(ResumeVersion.created_at.desc()).first()
                
                if not to_version:
                    raise ValidationError("No original version found in target resume")
            
            # Get all applications
            applications = db.query(Application).filter(
                Application.resume_id == from_resume_id
            ).all()
            
            # Reassign applications
            for app in applications:
                app.resume_id = to_resume_id
                app.resume_version_id = to_version.id
            
            db.commit()
            
            result = {
                'success': True,
                'applications_reassigned': len(applications),
                'message': (
                    f"Reassigned {len(applications)} application(s) from "
                    f"'{from_resume.title}' to '{to_resume.title}'"
                )
            }
            
            logger.info(result['message'])
            return result
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to reassign applications: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to reassign applications: {str(e)}")
    
    def delete_resume(self, user_id: int, resume_id: int) -> bool:
        """Delete a resume only if no applications depend on it.
        
        Raises ValidationError if applications exist.
        """
        db = self._get_db()
        
        try:
            # Check dependencies first
            dependencies = self.check_resume_dependencies(user_id, resume_id)
            
            if not dependencies['can_delete']:
                raise ValidationError(
                    f"Cannot delete resume. It is referenced by "
                    f"{dependencies['application_count']} application(s). "
                    "Delete those applications first, or use the force delete option."
                )
            
            # Verify ownership
            resume = self.get_resume(user_id, resume_id)
            
            # Delete from database (cascade will handle versions)
            db.delete(resume)
            db.commit()
            
            logger.info(f"Deleted resume {resume_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete resume {resume_id}: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            return False
    
    def delete_resume_version(self, user_id: int, resume_id: int, version_id: int) -> bool:
        """Delete a specific resume version with dependency checking."""
        db = self._get_db()
        
        try:
            # Check dependencies
            dependencies = self.check_version_dependencies(user_id, resume_id, version_id)
            
            if not dependencies['can_delete']:
                raise ValidationError(dependencies['message'])
            
            # Get the version to delete
            version = db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.id == version_id,
                    ResumeVersion.resume_id == resume_id
                )
            ).first()
            
            if not version:
                return False
            
            # Delete from database
            db.delete(version)
            db.commit()
            
            logger.info(f"Deleted resume version {version_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete resume version {version_id}: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            return False
    
    def customize_resume_for_application(self, user_id: int, resume_id: int, 
                                       original_version_id: int, job_description: str, 
                                       company: str, customized_markdown: Optional[str] = None,
                                       additional_instructions: Optional[str] = None) -> ResumeVersion:
        """Create a company-named customized resume version for an application.
        
        If customized_markdown is provided, it will be saved directly.
        Otherwise, AI will generate the customization.
        """
        db = self._get_db()
        
        try:
            # Get the resume and verify ownership
            resume = self.get_resume(user_id, resume_id)
            
            # Get the original version
            original_version = db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.id == original_version_id,
                    ResumeVersion.resume_id == resume_id
                )
            ).first()
            
            if not original_version:
                raise ValidationError("Original resume version not found")
            
            # Check if a customized version for this company already exists
            company_suffix = f" - {company}"
            existing_version = db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.resume_id == resume_id,
                    ResumeVersion.version.like(f"%{company_suffix}")
                )
            ).first()
            
            if existing_version:
                logger.info(f"Reusing existing version for company {company}: {existing_version.version}")
                return existing_version
            
            # Generate customized markdown if not provided
            if not customized_markdown:
                # Prepare customization instructions
                formatted_instructions = None
                if additional_instructions:
                    # Handle both string and dict types
                    if isinstance(additional_instructions, str):
                        formatted_instructions = {'custom_instructions': additional_instructions}
                    elif isinstance(additional_instructions, dict):
                        formatted_instructions = additional_instructions
                    else:
                        formatted_instructions = {'custom_instructions': str(additional_instructions)}
                
                # Generate customized resume using AI
                customized_markdown = self.ai_client.rewrite_resume(
                    original_version.markdown_content, 
                    job_description, 
                    formatted_instructions
                )
            
            # Generate new version name with company
            version_count = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).count()
            
            base_version = f"v{version_count + 1}"
            new_version_name = f"{base_version} - {company}"
            
            # Create new version record
            new_version_record = ResumeVersion(
                resume_id=resume_id,
                version=new_version_name,
                markdown_content=customized_markdown,
                job_description=job_description,
                is_original=False
            )
            
            db.add(new_version_record)
            db.commit()
            db.refresh(new_version_record)
            
            # Save to storage
            self._save_resume_to_storage(user_id, resume_id, new_version_name, customized_markdown)
            
            logger.info(f"Created company-specific resume version {new_version_name} for resume {resume_id}")
            return new_version_record
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to customize resume for application: {e}")
            if isinstance(e, (ResumeNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to customize resume: {str(e)}")
    
    def get_resume_for_download(self, user_id: int, resume_id: int, version_id: int) -> Optional[ResumeVersion]:
        """Get resume version for download in applications."""
        try:
            # Verify ownership
            self.get_resume(user_id, resume_id)
            
            db = self._get_db()
            version = db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.id == version_id,
                    ResumeVersion.resume_id == resume_id
                )
            ).first()
            
            return version
            
        except Exception as e:
            logger.error(f"Failed to get resume for download: {e}")
            return None
    
    def delete_application_resume_version(self, user_id: int, version_id: int) -> bool:
        """Delete a customized resume version when application is deleted."""
        db = self._get_db()
        
        try:
            # Get the version and check if it's a customized version
            version = db.query(ResumeVersion).join(Resume).filter(
                and_(
                    ResumeVersion.id == version_id,
                    Resume.user_id == user_id,
                    ResumeVersion.is_original == False  # Only delete non-original versions
                )
            ).first()
            
            if not version:
                logger.warning(f"Version {version_id} not found or is original - not deleting")
                return False
            
            # Delete the version
            db.delete(version)
            db.commit()
            
            logger.info(f"Deleted application resume version {version_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete application resume version {version_id}: {e}")
            return False
