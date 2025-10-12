"""Application service for job application tracking operations."""

import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.core.database import get_db
from app.models.application import Application
from app.models.cover_letter import CoverLetter
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
    
    def create_application_with_customization(
        self,
        user_id: int,
        company: str,
        position: str,
        job_description: str,
        resume_id: int,
        original_version_id: int,
        customize_resume: bool = False,
        additional_instructions: Optional[str] = None,
        cover_letter_id: Optional[int] = None,
        generate_cover_letter: bool = False,
        cover_letter_template_id: Optional[int] = None,
        meta: Optional[Dict[str, Any]] = None
    ) -> Application:
        """Create an application record with optional AI customization."""
        from app.services.resume_service import ResumeService
        
        db = self._get_db()
        resume_service = ResumeService(db)
        
        try:
            # Validate original resume version belongs to user
            original_version = db.query(ResumeVersion).join(Resume).filter(
                and_(
                    ResumeVersion.id == original_version_id,
                    Resume.user_id == user_id
                )
            ).first()
            
            if not original_version:
                raise ValidationError("Invalid original resume version")
            
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
            
            # Determine which version to use
            version_to_use = original_version
            customized_version_id = None
            
            if customize_resume:
                # Create customized version
                customized_version = resume_service.customize_resume_for_application(
                    user_id=user_id,
                    resume_id=resume_id,
                    original_version_id=original_version_id,
                    job_description=job_description,
                    company=company,
                    additional_instructions=additional_instructions
                )
                version_to_use = customized_version
                customized_version_id = customized_version.id
            
            # Generate cover letter if requested
            generated_cover_letter_id = cover_letter_id
            if generate_cover_letter:
                from app.services.cover_letter_service import CoverLetterService
                cover_letter_service = CoverLetterService(db)
                
                try:
                    # Get resume content for AI generation
                    resume_content = version_to_use.markdown_content if version_to_use else ""
                    
                    # Generate and save cover letter
                    generated_cl = cover_letter_service.generate_and_save_cover_letter(
                        user_id=user_id,
                        company=company,
                        position=position,
                        job_description=job_description,
                        resume_content=resume_content,
                        template_id=cover_letter_template_id
                    )
                    
                    generated_cover_letter_id = generated_cl.id
                    logger.info(f"Generated cover letter {generated_cover_letter_id} for application")
                    
                except Exception as e:
                    logger.warning(f"Failed to generate cover letter: {e}")
                    # Continue with application creation without cover letter
            
            # Create application
            application = Application(
                user_id=user_id,
                resume_id=resume_id,
                resume_version_id=original_version_id,  # Always reference original
                customized_resume_version_id=customized_version_id,  # Reference customized if created
                cover_letter_id=generated_cover_letter_id,
                company=company,
                position=position,
                job_description=job_description,
                additional_instructions=additional_instructions,
                applied_date=meta.get('applied_date') if meta else date.today(),
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
    
    def create_application(
        self, 
        user_id: int, 
        company: str, 
        position: str, 
        jd: str, 
        resume_version_id: int, 
        cover_letter_id: Optional[int] = None,
        generate_cover_letter: bool = False,
        cover_letter_template_id: Optional[int] = None,
        meta: Optional[Dict[str, Any]] = None
    ) -> Application:
        """Create an application record (legacy method for backward compatibility)."""
        db = self._get_db()
        
        try:
            # Get the resume_id from the resume_version_id
            version = db.query(ResumeVersion).filter(
                ResumeVersion.id == resume_version_id
            ).first()
            
            if not version:
                raise ValidationError("Resume version not found")
            
            resume_id = version.resume_id
            
            # Now call the full method with proper parameters
            return self.create_application_with_customization(
                user_id=user_id,
                company=company,
                position=position,
                job_description=jd,
                resume_id=resume_id,  # Now properly derived
                original_version_id=resume_version_id,
                customize_resume=False,
                cover_letter_id=cover_letter_id,
                generate_cover_letter=generate_cover_letter,
                cover_letter_template_id=cover_letter_template_id,
                meta=meta
            )
            
        except Exception as e:
            logger.error(f"Failed to create application: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to create application: {str(e)}")
    
    def delete_application(
        self, 
        user_id: int, 
        application_id: int,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """Delete an application with proper cascade deletion of customized resume.
        
        Cascade Deletion Rules:
        1. Delete customized resume version (if exists and not used by other applications)
        2. Preserve original resume and original resume version
        3. Preserve cover letter (may be used by other applications)
        
        Args:
            user_id: User ID for ownership verification
            application_id: Application ID to delete
            dry_run: If True, return what would be deleted without actually deleting
            
        Returns:
            Dict with deletion summary
        """
        from app.services.resume_service import ResumeService
        
        db = self._get_db()
        resume_service = ResumeService(db)
        
        try:
            # Get and verify ownership
            application = self.get_application(user_id, application_id)
            
            result = {
                'success': False,
                'application_deleted': False,
                'customized_version_deleted': False,
                'customized_version_id': None,
                'original_resume_preserved': True,
                'original_version_preserved': True,
                'message': '',
                'warnings': []
            }
            
            # Check if there's a customized version to delete
            customized_version_id = application.customized_resume_version_id
            can_delete_customized = False
            
            if customized_version_id:
                # Check if other applications use this customized version
                other_apps_count = db.query(Application).filter(
                    and_(
                        Application.id != application_id,
                        Application.customized_resume_version_id == customized_version_id
                    )
                ).count()
                
                if other_apps_count > 0:
                    result['warnings'].append(
                        f"Customized resume version (ID: {customized_version_id}) is used by "
                        f"{other_apps_count} other application(s) and will be preserved."
                    )
                else:
                    can_delete_customized = True
                    result['customized_version_id'] = customized_version_id
            
            if dry_run:
                # Return what would be deleted without actually deleting
                result['success'] = True
                result['message'] = "Dry run completed. No data was deleted."
                if can_delete_customized:
                    result['message'] += f" Would delete customized version ID {customized_version_id}."
                return result
            
            # Step 1: Delete customized resume version if safe to do so
            if can_delete_customized:
                try:
                    deleted = resume_service.delete_application_resume_version(
                        user_id, customized_version_id
                    )
                    if deleted:
                        result['customized_version_deleted'] = True
                        logger.info(f"Deleted customized resume version {customized_version_id}")
                except Exception as e:
                    logger.warning(f"Failed to delete customized version {customized_version_id}: {e}")
                    result['warnings'].append(
                        f"Could not delete customized resume version: {str(e)}"
                    )
            
            # Step 2: Delete the application
            db.delete(application)
            db.commit()
            
            result['success'] = True
            result['application_deleted'] = True
            result['message'] = f"Application for {application.company} - {application.position} deleted successfully."
            
            if result['customized_version_deleted']:
                result['message'] += " Customized resume version was also deleted."
            
            logger.info(
                f"Deleted application {application_id}. "
                f"Customized version deleted: {result['customized_version_deleted']}"
            )
            
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
            
            # Check customized version
            if application.customized_resume_version_id:
                customized_version = db.query(ResumeVersion).filter(
                    ResumeVersion.id == application.customized_resume_version_id
                ).first()
                
                if customized_version:
                    # Check if used by other applications
                    other_apps = db.query(Application).filter(
                        and_(
                            Application.id != application_id,
                            Application.customized_resume_version_id == customized_version.id
                        )
                    ).count()
                    
                    if other_apps > 0:
                        preview['warnings'].append(
                            f"Customized version '{customized_version.version}' is used by "
                            f"{other_apps} other application(s) and will NOT be deleted."
                        )
                        preview['will_preserve']['customized_version'] = {
                            'id': customized_version.id,
                            'version': customized_version.version,
                            'reason': f'Used by {other_apps} other application(s)'
                        }
                    else:
                        preview['will_delete']['customized_resume_version'] = {
                            'id': customized_version.id,
                            'version': customized_version.version,
                            'created_at': customized_version.created_at.isoformat()
                        }
            
            # Original resume will always be preserved
            original_resume = db.query(Resume).filter(
                Resume.id == application.resume_id
            ).first()
            
            if original_resume:
                preview['will_preserve']['original_resume'] = {
                    'id': original_resume.id,
                    'title': original_resume.title
                }
            
            # Original version will always be preserved
            original_version = db.query(ResumeVersion).filter(
                ResumeVersion.id == application.resume_version_id
            ).first()
            
            if original_version:
                preview['will_preserve']['original_version'] = {
                    'id': original_version.id,
                    'version': original_version.version
                }
            
            # Cover letter preserved
            if application.cover_letter_id:
                cover_letter = db.query(CoverLetter).filter(
                    CoverLetter.id == application.cover_letter_id
                ).first()
                
                if cover_letter:
                    preview['will_preserve']['cover_letter'] = {
                        'id': cover_letter.id,
                        'title': cover_letter.title
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
    
    def get_enhanced_application(self, user_id: int, application_id: int) -> Dict[str, Any]:
        """Get application with enhanced details including resume information."""
        db = self._get_db()
        
        try:
            application = self.get_application(user_id, application_id)
            
            # Get resume details
            resume = db.query(Resume).filter(Resume.id == application.resume_id).first()
            original_version = db.query(ResumeVersion).filter(
                ResumeVersion.id == application.resume_version_id
            ).first()
            
            customized_version = None
            if application.customized_resume_version_id:
                customized_version = db.query(ResumeVersion).filter(
                    ResumeVersion.id == application.customized_resume_version_id
                ).first()
            
            # Build enhanced response
            result = {
                **application.__dict__,
                'resume_title': resume.title if resume else None,
                'resume_version_name': original_version.version if original_version else None,
                'customized_version_name': customized_version.version if customized_version else None,
                'can_download_resume': True
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get enhanced application {application_id}: {e}")
            if isinstance(e, ApplicationNotFoundError):
                raise
            raise ValidationError(f"Failed to retrieve enhanced application: {str(e)}")
    
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
    
    def get_application_cover_letter(self, user_id: int, application_id: int) -> Optional[Dict[str, Any]]:
        """Get the cover letter associated with an application.
        
        Returns the cover letter details if found, None otherwise.
        """
        from app.models.cover_letter import CoverLetter
        
        db = self._get_db()
        
        try:
            # Verify application ownership
            application = self.get_application(user_id, application_id)
            
            if not application.cover_letter_id:
                return None
            
            # Get cover letter
            cover_letter = db.query(CoverLetter).filter(
                and_(
                    CoverLetter.id == application.cover_letter_id,
                    CoverLetter.user_id == user_id
                )
            ).first()
            
            if not cover_letter:
                return None
            
            return {
                'id': cover_letter.id,
                'title': cover_letter.title,
                'content': cover_letter.content,
                'template_id': cover_letter.template_id,
                'created_at': cover_letter.created_at.isoformat() if cover_letter.created_at else None,
                'updated_at': cover_letter.updated_at.isoformat() if cover_letter.updated_at else None
            }
            
        except Exception as e:
            logger.error(f"Failed to get cover letter for application {application_id}: {e}")
            return None
