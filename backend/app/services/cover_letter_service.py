"""Cover letter service for cover letter management operations."""

import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.core.database import get_db
from app.models.cover_letter import CoverLetter, CoverLetterTemplate
from app.core.exceptions import ValidationError, UnauthorizedError
from app.services.ai_service import AIGeneratorClient


logger = logging.getLogger(__name__)


class CoverLetterService:
    """Service for cover letter operations."""
    
    def __init__(self, db: Optional[Session] = None):
        """Initialize cover letter service."""
        self.db = db
        self.ai_client = AIGeneratorClient()
    
    def _get_db(self) -> Session:
        """Get database session."""
        if self.db:
            return self.db
        return next(get_db())
    
    def create_cover_letter(self, user_id: int, title: str, content: str, 
                           template_id: Optional[int] = None) -> CoverLetter:
        """Create a new cover letter."""
        db = self._get_db()
        
        try:
            # Validate template if provided
            if template_id:
                template = db.query(CoverLetterTemplate).filter(
                    CoverLetterTemplate.id == template_id
                ).first()
                
                if not template:
                    raise ValidationError(f"Template {template_id} not found")
            
            # Create cover letter
            cover_letter = CoverLetter(
                user_id=user_id,
                title=title,
                content=content,
                template_id=template_id
            )
            
            db.add(cover_letter)
            db.commit()
            db.refresh(cover_letter)
            
            logger.info(f"Created cover letter '{title}' for user {user_id} (ID: {cover_letter.id})")
            return cover_letter
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create cover letter for user {user_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to create cover letter: {str(e)}")
    
    def get_cover_letter(self, user_id: int, cover_letter_id: int) -> CoverLetter:
        """Get a specific cover letter."""
        db = self._get_db()
        
        try:
            cover_letter = db.query(CoverLetter).filter(
                and_(
                    CoverLetter.id == cover_letter_id,
                    CoverLetter.user_id == user_id
                )
            ).first()
            
            if not cover_letter:
                raise ValidationError(f"Cover letter {cover_letter_id} not found")
            
            return cover_letter
            
        except Exception as e:
            logger.error(f"Failed to get cover letter {cover_letter_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to retrieve cover letter: {str(e)}")
    
    def get_user_cover_letters(self, user_id: int, skip: int = 0, 
                              limit: int = 10) -> tuple[List[CoverLetter], int]:
        """Get all cover letters for a user with pagination."""
        db = self._get_db()
        
        try:
            # Get total count
            total = db.query(CoverLetter).filter(
                CoverLetter.user_id == user_id
            ).count()
            
            # Get paginated results
            cover_letters = db.query(CoverLetter).filter(
                CoverLetter.user_id == user_id
            ).order_by(CoverLetter.created_at.desc()).offset(skip).limit(limit).all()
            
            return cover_letters, total
            
        except Exception as e:
            logger.error(f"Failed to list cover letters for user {user_id}: {e}")
            return [], 0
    
    def update_cover_letter(self, user_id: int, cover_letter_id: int, 
                           title: Optional[str] = None, content: Optional[str] = None,
                           template_id: Optional[int] = None) -> CoverLetter:
        """Update a cover letter."""
        db = self._get_db()
        
        try:
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            # Validate template if provided
            if template_id is not None:
                if template_id == 0:
                    # Allow setting to None
                    cover_letter.template_id = None
                else:
                    template = db.query(CoverLetterTemplate).filter(
                        CoverLetterTemplate.id == template_id
                    ).first()
                    
                    if not template:
                        raise ValidationError(f"Template {template_id} not found")
                    
                    cover_letter.template_id = template_id
            
            if title is not None:
                cover_letter.title = title
            
            if content is not None:
                cover_letter.content = content
            
            db.commit()
            db.refresh(cover_letter)
            
            logger.info(f"Updated cover letter {cover_letter_id} for user {user_id}")
            return cover_letter
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update cover letter {cover_letter_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to update cover letter: {str(e)}")
    
    def delete_cover_letter(self, user_id: int, cover_letter_id: int) -> bool:
        """Delete a cover letter."""
        db = self._get_db()
        
        try:
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            db.delete(cover_letter)
            db.commit()
            
            logger.info(f"Deleted cover letter {cover_letter_id} for user {user_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete cover letter {cover_letter_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            return False
    
    def get_templates(self, skip: int = 0, limit: int = 50) -> tuple[List[CoverLetterTemplate], int]:
        """Get all available cover letter templates."""
        db = self._get_db()
        
        try:
            # Get total count
            total = db.query(CoverLetterTemplate).count()
            
            # Get paginated results
            templates = db.query(CoverLetterTemplate).order_by(
                CoverLetterTemplate.created_at.desc()
            ).offset(skip).limit(limit).all()
            
            return templates, total
            
        except Exception as e:
            logger.error(f"Failed to list cover letter templates: {e}")
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
    
    def generate_cover_letter_content(self, resume_content: str, job_description: str, 
                                     company: str, position: str, 
                                     template: Optional[str] = None) -> str:
        """Generate cover letter content using AI."""
        try:
            # Use AI service to generate cover letter
            cover_letter_content = self.ai_client.generate_cover_letter(
                template or "",
                job_description,
                resume_content,
                company,
                position
            )
            
            return cover_letter_content
            
        except Exception as e:
            logger.error(f"Failed to generate cover letter content: {e}")
            raise ValidationError(f"Failed to generate cover letter: {str(e)}")
    
    def generate_and_save_cover_letter(self, user_id: int, company: str, position: str, 
                                      job_description: str, resume_content: str,
                                      template_id: Optional[int] = None) -> CoverLetter:
        """Generate a cover letter using AI and save it to the database."""
        try:
            # Get template if provided
            template_name = None
            if template_id:
                template = self.get_template(template_id)
                template_name = template.name
            
            # Generate content
            content = self.generate_cover_letter_content(
                resume_content,
                job_description,
                company,
                position,
                template_name
            )
            
            # Create title
            title = f"Cover Letter - {company} - {position}"
            
            # Save to database
            cover_letter = self.create_cover_letter(
                user_id=user_id,
                title=title,
                content=content,
                template_id=template_id
            )
            
            return cover_letter
            
        except Exception as e:
            logger.error(f"Failed to generate and save cover letter: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to generate cover letter: {str(e)}")
    
    def customize_cover_letter(self, user_id: int, cover_letter_id: int, 
                              additional_instructions: Optional[str] = None) -> str:
        """Customize an existing cover letter with additional instructions.
        
        Returns the customized content (does not save to database).
        """
        try:
            cover_letter = self.get_cover_letter(user_id, cover_letter_id)
            
            if not additional_instructions:
                return cover_letter.content
            
            # Use AI to customize
            # This would require additional AI service method
            # For now, return original with note
            logger.info(f"Customizing cover letter {cover_letter_id} with additional instructions")
            
            return cover_letter.content
            
        except Exception as e:
            logger.error(f"Failed to customize cover letter: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to customize cover letter: {str(e)}")
