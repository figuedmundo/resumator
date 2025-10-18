"""Application service for job application tracking operations."""

import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import date, datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc
from app.core.database import get_db
from app.models.application import Application
from app.models.cover_letter import CoverLetter, CoverLetterVersion
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
        application_data: "ApplicationCreate"
    ) -> Application:
        """Create an application record with optional AI customization."""
        from app.services.resume_service import ResumeService
        from app.schemas.application import ApplicationCreate

        db = self._get_db()
        resume_service = ResumeService(db)
        
        try:
            # Validate original resume version belongs to user
            original_version = db.query(ResumeVersion).join(Resume).filter(
                and_(
                    ResumeVersion.id == application_data.resume_version_id,
                    Resume.user_id == user_id
                )
            ).first()
            
            if not original_version:
                raise ValidationError("Invalid original resume version")
            
            # Validate cover letter version belongs to user (if provided)
            if application_data.cover_letter_version_id:
                cover_letter_version = db.query(CoverLetterVersion).join(CoverLetter).filter(
                    and_(
                        CoverLetterVersion.id == application_data.cover_letter_version_id,
                        CoverLetter.user_id == user_id
                    )
                ).first()
                
                if not cover_letter_version:
                    raise ValidationError("Invalid cover letter version")
            
            # Determine which resume version to use
            customized_version_id = None
            if application_data.customize_resume:
                customized_version = resume_service.customize_resume_for_application(
                    user_id=user_id,
                    resume_id=application_data.resume_id,
                    original_version_id=application_data.resume_version_id,
                    job_description=application_data.job_description,
                    company=application_data.company,
                    additional_instructions=application_data.additional_instructions
                )
                customized_version_id = customized_version.id
            
            # Create application
            application = Application(
                user_id=user_id,
                resume_id=application_data.resume_id,
                resume_version_id=application_data.resume_version_id,
                customized_resume_version_id=customized_version_id,
                cover_letter_id=application_data.cover_letter_id,
                cover_letter_version_id=application_data.cover_letter_version_id,
                company=application_data.company,
                position=application_data.position,
                job_description=application_data.job_description,
                additional_instructions=application_data.additional_instructions,
                applied_date=application_data.applied_date or date.today(),
                status=application_data.status or "Applied",
                notes=application_data.notes or ""
            )
            
            db.add(application)
            db.commit()
            db.refresh(application)
            
            logger.info(f"Created application for {application_data.company} - {application_data.position} (ID: {application.id})")
            return application
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create application: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to create application: {str(e)}")
    
    def get_application(self, user_id: int, application_id: int) -> Application:
        """Get application by ID with all relations."""
        db = self._get_db()
        
        try:
            application = db.query(Application).options(
                joinedload(Application.cover_letter_version)
            ).filter(
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
            query = db.query(Application).options(
                joinedload(Application.cover_letter_version)
            ).filter(Application.user_id == user_id)
            
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
    
    
    def delete_application(
        self, 
        user_id: int, 
        application_id: int,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """Delete an application with proper cascade deletion of customized versions.
        
        Cascade Deletion Rules:
        1. Delete customized resume version (if exists and not used by other applications)
        2. Delete customized cover letter version (if exists and not used by other applications)
        3. Preserve original resume and cover letter versions
        
        Args:
            user_id: User ID for ownership verification
            application_id: Application ID to delete
            dry_run: If True, return what would be deleted without actually deleting
            
        Returns:
            Dict with deletion summary
        """
        from app.services.resume_service import ResumeService
        from app.services.cover_letter_service import CoverLetterService
        
        db = self._get_db()
        resume_service = ResumeService(db)
        cover_letter_service = CoverLetterService(db)
        
        try:
            # Get and verify ownership
            application = self.get_application(user_id, application_id)
            
            result = {
                'success': False,
                'application_deleted': False,
                'customized_resume_version_deleted': False,
                'customized_cover_letter_version_deleted': False,
                'message': '',
                'warnings': []
            }
            
            # Check for customized resume version to delete
            customized_resume_version_id = application.customized_resume_version_id
            can_delete_custom_resume = False
            if customized_resume_version_id:
                other_apps_count = db.query(Application).filter(
                    Application.id != application_id,
                    Application.customized_resume_version_id == customized_resume_version_id
                ).count()
                if other_apps_count == 0:
                    can_delete_custom_resume = True
            
            # Check for customized cover letter version to delete
            customized_cl_version_id = None
            can_delete_custom_cl = False
            if application.cover_letter_version and not application.cover_letter_version.is_original:
                customized_cl_version_id = application.cover_letter_version_id
                other_apps_count = db.query(Application).filter(
                    Application.id != application_id,
                    Application.cover_letter_version_id == customized_cl_version_id
                ).count()
                if other_apps_count == 0:
                    can_delete_custom_cl = True

            if dry_run:
                result['success'] = True
                result['message'] = "Dry run completed. No data was deleted."
                if can_delete_custom_resume:
                    result['message'] += f" Would delete customized resume version ID {customized_resume_version_id}."
                if can_delete_custom_cl:
                    result['message'] += f" Would delete customized cover letter version ID {customized_cl_version_id}."
                return result
            
            # Delete customized versions if safe
            if can_delete_custom_resume:
                resume_service.delete_application_resume_version(user_id, customized_resume_version_id)
                result['customized_resume_version_deleted'] = True

            if can_delete_custom_cl:
                cover_letter_service.delete_version(user_id, customized_cl_version_id)
                result['customized_cover_letter_version_deleted'] = True

            # Delete the application
            db.delete(application)
            db.commit()
            
            result['success'] = True
            result['application_deleted'] = True
            result['message'] = f"Application for {application.company} - {application.position} deleted successfully."
            
            logger.info(f"Deleted application {application_id}. Details: {result}")
            
            return result
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete application {application_id}: {e}")
            raise ValidationError(f"Failed to delete application: {str(e)}")
    
    def bulk_delete_applications(
        self, 
        user_id: int, 
        application_ids: List[int],
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """Delete multiple applications with cascade deletion.
        
        Returns summary of deletion results.
        """
        summary = {
            'total': len(application_ids),
            'deleted': 0,
            'failed': 0,
            'customized_versions_deleted': 0,
            'results': [],
            'errors': []
        }
        
        for app_id in application_ids:
            try:
                result = self.delete_application(user_id, app_id, dry_run=dry_run)
                
                if result['success']:
                    summary['deleted'] += 1
                    if result['customized_version_deleted']:
                        summary['customized_versions_deleted'] += 1
                else:
                    summary['failed'] += 1
                
                summary['results'].append({
                    'application_id': app_id,
                    'result': result
                })
                
            except Exception as e:
                summary['failed'] += 1
                summary['errors'].append(f"Application {app_id}: {str(e)}")
                summary['results'].append({
                    'application_id': app_id,
                    'result': {'success': False, 'message': str(e)}
                })
        
        return summary
    
    def get_application_deletion_preview(
        self, 
        user_id: int, 
        application_id: int
    ) -> Dict[str, Any]:
        """Get a preview of what will be deleted.
        
        Returns detailed information about what will be deleted and preserved.
        """
        db = self._get_db()
        
        try:
            application = self.get_application(user_id, application_id)
            
            preview = {
                'application': {
                    'id': application.id,
                    'company': application.company,
                    'position': application.position,
                    'applied_date': application.applied_date.isoformat() if application.applied_date else None
                },
                'will_delete': {},
                'will_preserve': {},
                'warnings': []
            }
            
            # Check customized resume version
            if application.customized_resume_version_id:
                customized_version = db.query(ResumeVersion).filter(
                    ResumeVersion.id == application.customized_resume_version_id
                ).first()
                
                if customized_version:
                    other_apps = db.query(Application).filter(
                        Application.id != application_id,
                        Application.customized_resume_version_id == customized_version.id
                    ).count()
                    
                    if other_apps > 0:
                        preview['warnings'].append(
                            f"Customized resume version '{customized_version.version}' is used by "
                            f"{other_apps} other application(s) and will NOT be deleted."
                        )
                    else:
                        preview['will_delete']['customized_resume_version'] = {
                            'id': customized_version.id,
                            'version': customized_version.version
                        }

            # Check customized cover letter version
            if application.cover_letter_version and not application.cover_letter_version.is_original:
                customized_cl_version = application.cover_letter_version
                other_apps = db.query(Application).filter(
                    Application.id != application_id,
                    Application.cover_letter_version_id == customized_cl_version.id
                ).count()

                if other_apps > 0:
                    preview['warnings'].append(
                        f"Customized cover letter version '{customized_cl_version.version}' is used by "
                        f"{other_apps} other application(s) and will NOT be deleted."
                    )
                else:
                    preview['will_delete']['customized_cover_letter_version'] = {
                        'id': customized_cl_version.id,
                        'version': customized_cl_version.version
                    }

            return preview
            
        except Exception as e:
            logger.error(f"Failed to get deletion preview for application {application_id}: {e}")
            raise ValidationError(f"Failed to get deletion preview: {str(e)}")
    
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
    
    def attach_cover_letter(self, user_id: int, application_id: int, cover_letter_version_id: int) -> Application:
        """Attach a cover letter version to an application."""
        db = self._get_db()
        try:
            application = self.get_application(user_id, application_id)
            
            # Validate cover letter version belongs to user
            cover_letter_version = db.query(CoverLetterVersion).join(CoverLetter).filter(
                and_(
                    CoverLetterVersion.id == cover_letter_version_id,
                    CoverLetter.user_id == user_id
                )
            ).first()

            if not cover_letter_version:
                raise ValidationError("Invalid cover letter version")

            application.cover_letter_version_id = cover_letter_version_id
            db.commit()
            db.refresh(application)
            logger.info(f"Attached cover letter version {cover_letter_version_id} to application {application_id}")
            return application
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to attach cover letter to application {application_id}: {e}")
            if isinstance(e, (ApplicationNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to attach cover letter: {str(e)}")

    def customize_cover_letter_for_application(self, user_id: int, application_id: int, job_description: Optional[str] = None) -> Application:
        """Customize a cover letter for a specific application."""
        from app.services.cover_letter_service import CoverLetterService

        db = self._get_db()
        cover_letter_service = CoverLetterService(db)
        try:
            application = self.get_application(user_id, application_id)
            if not application.cover_letter_version_id:
                raise ValidationError("Application does not have a cover letter to customize.")

            # Get the original cover letter version
            original_version = db.query(CoverLetterVersion).filter(
                CoverLetterVersion.id == application.cover_letter_version_id
            ).first()

            if not original_version:
                raise ValidationError("Original cover letter version not found.")

            # Create a new customized version
            customized_version = cover_letter_service.customize_cover_letter_for_application(
                user_id=user_id,
                cover_letter_id=original_version.cover_letter_id,
                original_version_id=original_version.id,
                job_description=job_description or application.job_description,
                company=application.company,
                position=application.position
            )

            # Update the application to point to the new customized version
            application.cover_letter_version_id = customized_version.id
            application.cover_letter_customized_at = datetime.utcnow()
            db.commit()
            db.refresh(application)
            logger.info(f"Customized cover letter for application {application_id}. New version: {customized_version.id}")
            return application
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to customize cover letter for application {application_id}: {e}")
            if isinstance(e, (ApplicationNotFoundError, ValidationError)):
                raise
            raise ValidationError(f"Failed to customize cover letter: {str(e)}")

    def remove_cover_letter_from_application(self, user_id: int, application_id: int) -> Application:
        """Remove the cover letter from an application."""
        db = self._get_db()
        try:
            application = self.get_application(user_id, application_id)
            application.cover_letter_version_id = None
            application.cover_letter_customized_at = None
            db.commit()
            db.refresh(application)
            logger.info(f"Removed cover letter from application {application_id}")
            return application
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to remove cover letter from application {application_id}: {e}")
            if isinstance(e, ApplicationNotFoundError):
                raise
            raise ValidationError(f"Failed to remove cover letter: {str(e)}")