"""Application tracking API endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse, 
    ApplicationListResponse, ApplicationStats
)
from app.services.application_service import ApplicationService
from app.api.deps import get_current_active_user, get_application_service
from app.core.exceptions import ApplicationNotFoundError, ValidationError, UnauthorizedError


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    application_create: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Create a new job application."""
    try:
        application = application_service.create_application(
            user_id=current_user.id,
            application_data=application_create
        )
        return ApplicationResponse.from_orm(application)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create application for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create application"
        )


@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """List all applications for the current user with pagination."""
    try:
        applications, total = application_service.list_user_applications(
            user_id=current_user.id,
            status=status_filter,
            page=page,
            per_page=per_page
        )
        
        return ApplicationListResponse(
            applications=[ApplicationResponse.from_orm(app) for app in applications],
            total=total,
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Failed to list applications for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list applications"
        )


@router.get("/stats", response_model=ApplicationStats)
async def get_application_stats(
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Get application statistics for the current user."""
    try:
        stats = application_service.get_application_stats(current_user.id)
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get application stats for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get application statistics"
        )


@router.get("/search", response_model=ApplicationListResponse)
async def search_applications(
    q: str = Query(..., description="Search query for company or position"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Search applications by company or position."""
    try:
        applications, total = application_service.search_applications(
            user_id=current_user.id,
            query=q,
            page=page,
            per_page=per_page
        )
        
        return ApplicationListResponse(
            applications=[ApplicationResponse.from_orm(app) for app in applications],
            total=total,
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Failed to search applications for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search applications"
        )


@router.get("/recent", response_model=List[ApplicationResponse])
async def get_recent_applications(
    limit: int = Query(10, ge=1, le=50, description="Number of recent applications"),
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Get recent applications for the current user."""
    try:
        applications = application_service.get_recent_applications(
            user_id=current_user.id,
            limit=limit
        )
        
        return [ApplicationResponse.from_orm(app) for app in applications]
        
    except Exception as e:
        logger.error(f"Failed to get recent applications for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recent applications"
        )


@router.get("/company/{company}", response_model=List[ApplicationResponse])
async def get_applications_by_company(
    company: str,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Get all applications for a specific company."""
    try:
        applications = application_service.get_applications_by_company(
            user_id=current_user.id,
            company=company
        )
        
        return [ApplicationResponse.from_orm(app) for app in applications]
        
    except Exception as e:
        logger.error(f"Failed to get applications for company {company}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get applications for company"
        )


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Get a specific application with all details."""
    try:
        application = application_service.get_application(
            user_id=current_user.id,
            application_id=application_id
        )
        return ApplicationResponse.from_orm(application)
        
    except ApplicationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get application"
        )


@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Update an application."""
    try:
        application = application_service.update_application(
            user_id=current_user.id,
            application_id=application_id,
            application_update=application_update
        )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return ApplicationResponse.from_orm(application)
        
    except ApplicationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application"
        )


@router.patch("/{application_id}/status")
async def update_application_status(
    application_id: int,
    status_update: dict,  # Should contain 'status' field
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Update application status."""
    try:
        if 'status' not in status_update:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status is required"
            )
        
        application_service.update_status(
            application_id=application_id,
            status=status_update['status'],
            user_id=current_user.id
        )
        
        return {"message": "Application status updated successfully"}
        
    except ApplicationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update application status {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application status"
        )


@router.get("/{application_id}/deletion-preview")
async def get_application_deletion_preview(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Get a preview of what will be deleted when deleting an application.
    
    This endpoint helps users understand the impact of deletion before proceeding.
    """
    try:
        preview = application_service.get_application_deletion_preview(
            user_id=current_user.id,
            application_id=application_id
        )
        
        return preview
        
    except ApplicationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get deletion preview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get deletion preview"
        )


@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    dry_run: bool = Query(False, description="Preview deletion without executing"),
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Delete an application with proper cascade deletion of customized resume.
    
    Deletion Rules:
    - Deletes the application
    - Deletes customized resume version (if not used by other applications)
    - Preserves original resume and original resume version
    - Preserves cover letter (may be used by other applications)
    
    Use dry_run=true to preview what will be deleted.
    """
    try:
        result = application_service.delete_application(
            user_id=current_user.id,
            application_id=application_id,
            dry_run=dry_run
        )
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return {
            "message": result['message'],
            "details": {
                "application_deleted": result['application_deleted'],
                "customized_version_deleted": result['customized_version_deleted'],
                "customized_version_id": result['customized_version_id'],
                "original_resume_preserved": result['original_resume_preserved'],
                "original_version_preserved": result['original_version_preserved']
            },
            "warnings": result['warnings'] if result['warnings'] else None
        }
        
    except ApplicationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to delete application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application"
        )


@router.get("/{application_id}/resume/download")
async def download_application_resume(
    application_id: int,
    template: str = Query("modern", description="PDF template to use"),
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Download the resume used for a specific application as PDF."""
    from app.services.resume_service import ResumeService
    from app.services.pdf_service import pdf_service
    from fastapi.responses import StreamingResponse
    import io
    
    try:
        # Get the application
        application = application_service.get_application(
            user_id=current_user.id,
            application_id=application_id
        )
        
        resume_service = ResumeService()
        
        # Determine which version to download (customized if available, otherwise original)
        version_id = application.customized_resume_version_id or application.resume_version_id
        
        version = resume_service.get_resume_for_download(
            user_id=current_user.id,
            resume_id=application.resume_id,
            version_id=version_id
        )
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume version not found"
            )
        
        # Generate PDF
        pdf_bytes = pdf_service.generate_resume_pdf(
            version.markdown_content, template
        )
        
        # Create filename
        version_name = version.version.replace(" ", "_")
        filename = f"resume_{application.company}_{version_name}_{template}.pdf"
        
        # Create streaming response
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except ApplicationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to download resume for application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download resume"
        )


@router.get("/status/options", response_model=dict)
async def get_status_options():
    """Get available application status options."""
    try:
        statuses = [
            {"value": "Applied", "label": "Applied", "color": "blue"},
            {"value": "Interviewing", "label": "Interviewing", "color": "yellow"},
            {"value": "Rejected", "label": "Rejected", "color": "red"},
            {"value": "Offer", "label": "Offer", "color": "green"},
            {"value": "Withdrawn", "label": "Withdrawn", "color": "gray"}
        ]
        
        return {"statuses": statuses}
        
    except Exception as e:
        logger.error(f"Failed to get status options: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get status options"
        )


# Bulk operations
@router.post("/bulk/status")
async def bulk_update_status(
    request: dict,  # Should contain 'application_ids' and 'status'
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Update status for multiple applications."""
    try:
        if 'application_ids' not in request or 'status' not in request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="application_ids and status are required"
            )
        
        application_ids = request['application_ids']
        new_status = request['status']
        
        if not isinstance(application_ids, list) or not application_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="application_ids must be a non-empty list"
            )
        
        updated_count = 0
        errors = []
        
        for app_id in application_ids:
            try:
                application_service.update_status(
                    application_id=app_id,
                    status=new_status,
                    user_id=current_user.id
                )
                updated_count += 1
                
            except (ApplicationNotFoundError, ValidationError) as e:
                errors.append(f"Application {app_id}: {str(e)}")
                continue
        
        return {
            "message": f"Updated {updated_count} applications",
            "updated_count": updated_count,
            "errors": errors if errors else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to bulk update application status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk update application status"
        )


@router.delete("/bulk")
async def bulk_delete_applications(
    request: dict,  # Should contain 'application_ids' and optional 'dry_run'
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Delete multiple applications with cascade deletion.
    
    Request body:
    {
        "application_ids": [1, 2, 3],
        "dry_run": false  // Optional, default false
    }
    """
    try:
        if 'application_ids' not in request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="application_ids is required"
            )
        
        application_ids = request['application_ids']
        dry_run = request.get('dry_run', False)
        
        if not isinstance(application_ids, list) or not application_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="application_ids must be a non-empty list"
            )
        
        summary = application_service.bulk_delete_applications(
            user_id=current_user.id,
            application_ids=application_ids,
            dry_run=dry_run
        )
        
        return {
            "message": (
                f"{'Would delete' if dry_run else 'Deleted'} {summary['deleted']} "
                f"application(s) out of {summary['total']}. "
                f"Also {'would delete' if dry_run else 'deleted'} "
                f"{summary['customized_versions_deleted']} customized version(s)."
            ),
            "summary": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to bulk delete applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk delete applications"
        )

@router.get("/{application_id}/cover-letter/download")
async def download_application_cover_letter(
    application_id: int,
    template: str = Query("modern", description="PDF template to use"),
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Download the cover letter used for a specific application as PDF."""
    from app.services.pdf_service import pdf_service
    from fastapi.responses import StreamingResponse
    import io
    
    try:
        # Get the application
        application = application_service.get_application(
            user_id=current_user.id,
            application_id=application_id
        )
        
        # Check if application has a cover letter
        if not application.cover_letter_version_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No cover letter attached to this application"
            )
        
        # Get cover letter content
        cover_letter_data = application_service.get_application_cover_letter(
            user_id=current_user.id,
            application_id=application_id
        )
        
        if not cover_letter_data or not cover_letter_data.get('content'):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter content not found"
            )
        
        # Generate PDF
        pdf_bytes = pdf_service.generate_cover_letter_pdf(
            content=cover_letter_data['content'],
            company=application.company,
            position=application.position,
            title=cover_letter_data.get('title')
        )
        
        # Create filename
        company_safe = application.company.replace(" ", "_").replace("/", "_")
        filename = f"cover_letter_{company_safe}.pdf"
        
        # Create streaming response
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except ApplicationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download cover letter for application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download cover letter"
        )


@router.post("/{application_id}/cover-letter", response_model=ApplicationResponse)
async def attach_cover_letter(
    application_id: int,
    cover_letter_version_id: int,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Attach a cover letter to an application."""
    try:
        application = application_service.attach_cover_letter(
            user_id=current_user.id,
            application_id=application_id,
            cover_letter_version_id=cover_letter_version_id
        )
        return ApplicationResponse.from_orm(application)
    except (ApplicationNotFoundError, ValidationError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to attach cover letter to application {application_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to attach cover letter")

@router.put("/{application_id}/cover-letter", response_model=ApplicationResponse)
async def customize_cover_letter(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Customize the cover letter for an application."""
    try:
        application = application_service.customize_cover_letter_for_application(
            user_id=current_user.id,
            application_id=application_id
        )
        return ApplicationResponse.from_orm(application)
    except (ApplicationNotFoundError, ValidationError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to customize cover letter for application {application_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to customize cover letter")

@router.delete("/{application_id}/cover-letter", response_model=ApplicationResponse)
async def remove_cover_letter(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Remove the cover letter from an application."""
    try:
        application = application_service.remove_cover_letter_from_application(
            user_id=current_user.id,
            application_id=application_id
        )
        return ApplicationResponse.from_orm(application)
    except ApplicationNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to remove cover letter from application {application_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to remove cover letter")