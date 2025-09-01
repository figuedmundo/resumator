"""Application service for job application tracking operations."""

import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.core.database import get_db
from app.models.application import Application, CoverLetter
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.core.exceptions import ApplicationNotFoundError, ValidationError, UnauthorizedError


logger = logging.getLogger(__name__)


class ApplicationService:
    """Service for application operations."""
    
    def __init__(self, db: Optional[Session] = None):
        """Initialize application service."""
        self.db = db
    
    def _get_db(self) -> Session:
        """Get database session."""
        if self.db:
            return self.db
        return next(get_db())
    
    def create_application(
        self, 
        user_id: int, 
        company: str, 
        position: str, 
        jd: str, 
        resume_version_id: int, 
        cover_letter_id: Optional[int] = None, 
        meta: Optional[Dict[str, Any]] = None
    ) -> Application:
        """Create an application record."""
        db = self._get_db()
        
        try:
            # Validate resume version belongs to user
            resume_version = db.query(ResumeVersion).join(Resume).filter(
                and_(
                    ResumeVersion.id == resume_version_id,
                    Resume.user_id == user_id
                )
            ).first()
            
            if not resume_version:
                raise ValidationError("Invalid resume version")
            
            # Validate cover letter belongs to user (if provided)
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
                applied_date=meta.get('applied_date') if meta else None or date.today(),
                status=meta.get('status') if meta else "Applied",
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
        """Get application by ID."""
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
    
    def list_user_applications(
        self, 
        user_id: int, 
        status: Optional[str] = None,
        company: Optional[str] = None,
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[Application], int]:
        """List applications for a user with optional filters and pagination."""
        db = self._get_db()
        
        try:
            query = db.query(Application).filter(Application.user_id == user_id)
            
            if status:
                query = query.filter(Application.status == status)
            
            if company:
                query = query.filter(Application.company.ilike(f"%{company}%"))
            
            # Get total count
            total = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            applications = query.order_by(desc(Application.applied_date)).offset(offset).limit(per_page).all()
            
            return applications, total
            
        except Exception as e:
            logger.error(f"Failed to list applications for user {user_id}: {e}")
            return [], 0
    
    def update_status(self, user_id: int, application_id: int, status: str, notes: Optional[str] = None):
        """Update application status: Applied, Interviewing, Rejected, Offer."""
        db = self._get_db()
        
        valid_statuses = ["Applied", "Interviewing", "Rejected", "Offer", "Withdrawn"]
        
        try:
            if status not in valid_statuses:
                raise ValidationError(f"Invalid status. Valid options: {', '.join(valid_statuses)}")
            
            # Get and verify ownership
            application = self.get_application(user_id, application_id)
            
            # Update status
            application.status = status
            if notes:
                application.notes = notes
            
            db.commit()
            db.refresh(application)
            
            logger.info(f"Updated application {application_id} status to {status}")
            return application
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update application status: {e}")
            if isinstance(e, (ApplicationNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to update application status: {str(e)}")
    
    def update_application(
        self, 
        user_id: int, 
        application_id: int, 
        application_update
    ) -> Application:
        """Update application details."""
        db = self._get_db()
        
        try:
            # Get and verify ownership
            application = self.get_application(user_id, application_id)
            
            # Update allowed fields
            update_data = application_update.dict(exclude_unset=True)
            
            for field, value in update_data.items():
                if hasattr(application, field):
                    if field == 'status':
                        valid_statuses = ["Applied", "Interviewing", "Rejected", "Offer", "Withdrawn"]
                        if value not in valid_statuses:
                            raise ValidationError(f"Invalid status: {value}")
                    
                    setattr(application, field, value)
            
            db.commit()
            db.refresh(application)
            
            logger.info(f"Updated application {application_id}")
            return application
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update application: {e}")
            if isinstance(e, (ApplicationNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to update application: {str(e)}")
    
    def delete_application(self, user_id: int, application_id: int) -> bool:
        """Delete an application."""
        db = self._get_db()
        
        try:
            # Get and verify ownership
            application = self.get_application(user_id, application_id)
            
            # Delete application
            db.delete(application)
            db.commit()
            
            logger.info(f"Deleted application {application_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete application {application_id}: {e}")
            return False
    
    def get_application_stats(self, user_id: int) -> Dict[str, Any]:
        """Get application statistics for a user."""
        db = self._get_db()
        
        try:
            total = db.query(Application).filter(Application.user_id == user_id).count()
            
            stats = {}
            statuses = ["Applied", "Interviewing", "Rejected", "Offer", "Withdrawn"]
            
            for status in statuses:
                count = db.query(Application).filter(
                    and_(Application.user_id == user_id, Application.status == status)
                ).count()
                stats[status.lower()] = count
            
            # Recent activity (last 30 days)
            from datetime import timedelta
            recent_date = date.today() - timedelta(days=30)
            recent = db.query(Application).filter(
                and_(
                    Application.user_id == user_id,
                    Application.applied_date >= recent_date
                )
            ).count()
            
            return {
                "total": total,
                "applied": stats.get('applied', 0),
                "interviewing": stats.get('interviewing', 0),
                "rejected": stats.get('rejected', 0),
                "offers": stats.get('offer', 0),
                "by_status": stats,
                "recent_month": recent
            }
            
        except Exception as e:
            logger.error(f"Failed to get application stats for user {user_id}: {e}")
            return {"total": 0, "by_status": {}, "recent_month": 0}
    
    def search_applications(
        self, 
        user_id: int, 
        query: str, 
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[Application], int]:
        """Search applications by company, position, or job description."""
        db = self._get_db()
        
        try:
            search_pattern = f"%{query}%"
            
            query_obj = db.query(Application).filter(
                and_(
                    Application.user_id == user_id,
                    (
                        Application.company.ilike(search_pattern) |
                        Application.position.ilike(search_pattern) |
                        Application.job_description.ilike(search_pattern) |
                        Application.notes.ilike(search_pattern)
                    )
                )
            )
            
            total = query_obj.count()
            offset = (page - 1) * per_page
            applications = query_obj.order_by(desc(Application.applied_date)).offset(offset).limit(per_page).all()
            
            return applications, total
            
        except Exception as e:
            logger.error(f"Failed to search applications: {e}")
            return [], 0
    
    def get_recent_applications(self, user_id: int, limit: int = 10) -> List[Application]:
        """Get recent applications for a user."""
        db = self._get_db()
        
        try:
            return db.query(Application).filter(
                Application.user_id == user_id
            ).order_by(desc(Application.applied_date)).limit(limit).all()
            
        except Exception as e:
            logger.error(f"Failed to get recent applications: {e}")
            return []
    
    def get_applications_by_company(self, user_id: int, company: str) -> List[Application]:
        """Get all applications for a specific company."""
        db = self._get_db()
        
        try:
            return db.query(Application).filter(
                and_(
                    Application.user_id == user_id,
                    Application.company.ilike(f"%{company}%")
                )
            ).order_by(desc(Application.applied_date)).all()
            
        except Exception as e:
            logger.error(f"Failed to get applications for company {company}: {e}")
            return []
