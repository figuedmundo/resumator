"""Application service for job application tracking."""

import logging
from typing import Optional, List, Dict, Any
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.core.database import get_db
from app.models.application import Application, CoverLetter
from app.models.resume import Resume, ResumeVersion
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationStats
from app.core.exceptions import ApplicationNotFoundError, ValidationError, UnauthorizedError


logger = logging.getLogger(__name__)


class ApplicationService:
    """Service for job application operations."""
    
    def __init__(self, db: Optional[Session] = None):
        """Initialize application service."""
        self.db = db
    
    def _get_db(self) -> Session:
        """Get database session."""
        if self.db:
            return self.db
        return next(get_db())
    
    def create_application(self, user_id: int, company: str, position: str, jd: str, 
                          resume_version_id: int, cover_letter_id: Optional[int] = None,
                          meta: Optional[Dict[str, Any]] = None) -> Application:
        """Create an application record."""
        db = self._get_db()
        
        try:
            # Verify resume version belongs to user
            resume_version = db.query(ResumeVersion).join(Resume).filter(
                and_(
                    ResumeVersion.id == resume_version_id,
                    Resume.user_id == user_id
                )
            ).first()
            
            if not resume_version:
                raise ValidationError("Invalid resume version")
            
            # Verify cover letter belongs to user (if provided)
            if cover_letter_id:
                cover_letter = db.query(CoverLetter).filter(
                    and_(
                        CoverLetter.id == cover_letter_id,
                        CoverLetter.user_id == user_id
                    )
                ).first()
                
                if not cover_letter:
                    raise ValidationError("Invalid cover letter")
            
            # Create application
            application = Application(
                user_id=user_id,
                resume_id=resume_version.resume_id,
                resume_version_id=resume_version_id,
                cover_letter_id=cover_letter_id,
                company=company,
                position=position,
                job_description=jd,
                status="Applied",
                applied_date=date.today(),
                notes=meta.get('notes', '') if meta else ''
            )
            
            db.add(application)
            db.commit()
            db.refresh(application)
            
            logger.info(f"Created application for {company} - {position} (ID: {application.id})")
            return application
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create application: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to create application: {str(e)}")
    
    def get_application(self, user_id: int, application_id: int) -> Application:
        """Get an application by ID."""
        db = self._get_db()
        
        try:
            application = db.query(Application).filter(
                and_(
                    Application.id == application_id,
                    Application.user_id == user_id
                )
            ).first()
            
            if not application:
                raise ApplicationNotFoundError(application_id)
            
            return application
            
        except Exception as e:
            logger.error(f"Failed to get application {application_id}: {e}")
            if isinstance(e, ApplicationNotFoundError):
                raise
            raise ValidationError(f"Failed to retrieve application: {str(e)}")
    
    def list_user_applications(self, user_id: int, status: Optional[str] = None,
                              page: int = 1, per_page: int = 20) -> tuple:
        """List applications for a user with pagination."""
        db = self._get_db()
        
        try:
            query = db.query(Application).filter(Application.user_id == user_id)
            
            if status:
                query = query.filter(Application.status == status)
            
            # Get total count
            total = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            applications = query.order_by(
                Application.created_at.desc()
            ).offset(offset).limit(per_page).all()
            
            return applications, total
            
        except Exception as e:
            logger.error(f"Failed to list applications for user {user_id}: {e}")
            return [], 0
    
    def update_status(self, application_id: int, status: str, user_id: Optional[int] = None):
        """Update application status: Applied, Interviewing, Rejected, Offer."""
        db = self._get_db()
        
        try:
            query = db.query(Application).filter(Application.id == application_id)
            
            if user_id:
                query = query.filter(Application.user_id == user_id)
            
            application = query.first()
            
            if not application:
                raise ApplicationNotFoundError(application_id)
            
            # Validate status
            valid_statuses = ["Applied", "Interviewing", "Rejected", "Offer", "Withdrawn"]
            if status not in valid_statuses:
                raise ValidationError(f"Invalid status. Must be one of: {valid_statuses}")
            
            application.status = status
            db.commit()
            db.refresh(application)
            
            logger.info(f"Updated application {application_id} status to {status}")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update application status: {e}")
            if isinstance(e, (ApplicationNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to update application status: {str(e)}")
    
    def update_application(self, user_id: int, application_id: int, 
                          application_update: ApplicationUpdate) -> Optional[Application]:
        """Update application details."""
        db = self._get_db()
        
        try:
            application = self.get_application(user_id, application_id)
            
            # Update fields
            update_data = application_update.dict(exclude_unset=True)
            
            for field, value in update_data.items():
                if hasattr(application, field):
                    setattr(application, field, value)
            
            db.commit()
            db.refresh(application)
            
            logger.info(f"Updated application {application_id}")
            return application
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update application {application_id}: {e}")
            if isinstance(e, (ApplicationNotFoundError, ValidationError)):
                raise
            return None
    
    def delete_application(self, user_id: int, application_id: int) -> bool:
        """Delete an application."""
        db = self._get_db()
        
        try:
            application = self.get_application(user_id, application_id)
            
            db.delete(application)
            db.commit()
            
            logger.info(f"Deleted application {application_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete application {application_id}: {e}")
            return False
    
    def get_application_stats(self, user_id: int) -> ApplicationStats:
        """Get application statistics for a user."""
        db = self._get_db()
        
        try:
            # Get total applications
            total = db.query(Application).filter(Application.user_id == user_id).count()
            
            # Get status counts
            status_counts = db.query(
                Application.status,
                func.count(Application.id)
            ).filter(
                Application.user_id == user_id
            ).group_by(Application.status).all()
            
            # Convert to dict
            counts = {status: count for status, count in status_counts}
            
            return ApplicationStats(
                total=total,
                applied=counts.get("Applied", 0),
                interviewing=counts.get("Interviewing", 0),
                rejected=counts.get("Rejected", 0),
                offers=counts.get("Offer", 0)
            )
            
        except Exception as e:
            logger.error(f"Failed to get application stats for user {user_id}: {e}")
            return ApplicationStats(
                total=0,
                applied=0,
                interviewing=0,
                rejected=0,
                offers=0
            )
    
    def search_applications(self, user_id: int, query: str, 
                          page: int = 1, per_page: int = 20) -> tuple:
        """Search applications by company or position."""
        db = self._get_db()
        
        try:
            base_query = db.query(Application).filter(Application.user_id == user_id)
            
            # Search in company and position fields
            search_query = base_query.filter(
                (Application.company.ilike(f"%{query}%")) |
                (Application.position.ilike(f"%{query}%"))
            )
            
            # Get total count
            total = search_query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            applications = search_query.order_by(
                Application.created_at.desc()
            ).offset(offset).limit(per_page).all()
            
            return applications, total
            
        except Exception as e:
            logger.error(f"Failed to search applications for user {user_id}: {e}")
            return [], 0
    
    def get_applications_by_company(self, user_id: int, company: str) -> List[Application]:
        """Get all applications for a specific company."""
        db = self._get_db()
        
        try:
            return db.query(Application).filter(
                and_(
                    Application.user_id == user_id,
                    Application.company.ilike(f"%{company}%")
                )
            ).order_by(Application.created_at.desc()).all()
            
        except Exception as e:
            logger.error(f"Failed to get applications for company {company}: {e}")
            return []
    
    def get_recent_applications(self, user_id: int, limit: int = 10) -> List[Application]:
        """Get recent applications for a user."""
        db = self._get_db()
        
        try:
            return db.query(Application).filter(
                Application.user_id == user_id
            ).order_by(
                Application.created_at.desc()
            ).limit(limit).all()
            
        except Exception as e:
            logger.error(f"Failed to get recent applications for user {user_id}: {e}")
            return []
