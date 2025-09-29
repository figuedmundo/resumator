"""Resume service for resume management operations."""

import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.core.database import get_db
from app.models.resume import Resume, ResumeVersion
from app.models.application import CoverLetter
from app.schemas.resume import ResumeCreate, ResumeUpdate
from app.core.exceptions import ResumeNotFoundError, ValidationError, UnauthorizedError
from app.services.ai_service import AIGeneratorClient
from app.services.storage_service import storage


logger = logging.getLogger(__name__)


class ResumeService:
    """Service for resume operations."""
    
    def __init__(self, db: Optional[Session] = None):
        """Initialize resume service."""
        self.db = db
        self.ai_client = AIGeneratorClient()
    
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
    
    def customize_resume(self, user_id: int, resume_id: int, job_description: str, 
                        instructions: Optional[Dict[str, Any]] = None) -> str:
        """Call AIGeneratorClient.rewrite_resume and create a new version record; return new markdown."""
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
            customized_markdown = self.ai_client.rewrite_resume(
                latest_version.markdown_content, 
                job_description, 
                instructions
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
            storage.save(file_path, markdown)
        except Exception as e:
            logger.warning(f"Failed to save resume to storage: {e}")
    
    def delete_resume(self, user_id: int, resume_id: int) -> bool:
        """Delete a resume and all its versions."""
        db = self._get_db()
        
        try:
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
            if isinstance(e, ResumeNotFoundError):
                raise
            return False
    
    def delete_resume_version(self, user_id: int, resume_id: int, version_id: int) -> bool:
        """Delete a specific resume version."""
        db = self._get_db()
        
        try:
            # Verify ownership
            self.get_resume(user_id, resume_id)
            
            # Cannot delete the original version if it's the only one
            version_count = db.query(ResumeVersion).filter(
                ResumeVersion.resume_id == resume_id
            ).count()
            
            if version_count <= 1:
                raise ValidationError("Cannot delete the only version of a resume")
            
            # Get the version to delete
            version = db.query(ResumeVersion).filter(
                and_(
                    ResumeVersion.id == version_id,
                    ResumeVersion.resume_id == resume_id
                )
            ).first()
            
            if not version:
                return False
            
            # Cannot delete original version if other versions exist
            if version.is_original and version_count > 1:
                raise ValidationError("Cannot delete the original version while other versions exist")
            
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
                                       company: str, additional_instructions: Optional[str] = None) -> ResumeVersion:
        """Create a company-named customized resume version for an application."""
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
            
            # Prepare customization instructions
            instructions = {}
            if additional_instructions:
                instructions['custom_instructions'] = additional_instructions
            
            # Generate customized resume using AI
            customized_markdown = self.ai_client.rewrite_resume(
                original_version.markdown_content, 
                job_description, 
                instructions
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
