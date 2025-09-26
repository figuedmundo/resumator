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
            company=application_create.company,
            position=application_create.position,
            jd=application_create.job_description or "",
            resume_version_id=application_create.resume_version_id,
            cover_letter_id=application_create.cover_letter_id,
            meta={
                'notes': application_create.notes,
                'applied_date': application_create.applied_date,
                'status': application_create.status
            }
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
    """Get a specific application."""
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


@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Delete an application."""
    try:
        success = application_service.delete_application(
            user_id=current_user.id,
            application_id=application_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return {"message": "Application deleted successfully"}
        
    except Exception as e:
        logger.error(f"Failed to delete application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application"
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
    request: dict,  # Should contain 'application_ids'
    current_user: User = Depends(get_current_active_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """Delete multiple applications."""
    try:
        if 'application_ids' not in request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="application_ids is required"
            )
        
        application_ids = request['application_ids']
        
        if not isinstance(application_ids, list) or not application_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="application_ids must be a non-empty list"
            )
        
        deleted_count = 0
        errors = []
        
        for app_id in application_ids:
            try:
                success = application_service.delete_application(
                    user_id=current_user.id,
                    application_id=app_id
                )
                if success:
                    deleted_count += 1
                else:
                    errors.append(f"Application {app_id}: Not found")
                    
            except Exception as e:
                errors.append(f"Application {app_id}: {str(e)}")
                continue
        
        return {
            "message": f"Deleted {deleted_count} applications",
            "deleted_count": deleted_count,
            "errors": errors if errors else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to bulk delete applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk delete applications"
        )
