"""User management API endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.api.deps import get_current_active_user, get_user_service
from app.core.exceptions import ValidationError


logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information."""
    return UserResponse.from_orm(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    """Update current user information."""
    try:
        updated_user = user_service.update_user(current_user.id, user_update)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse.from_orm(updated_user)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )


@router.delete("/me")
async def delete_current_user(
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    """Delete current user account and all associated data."""
    try:
        success = user_service.delete_user_data(current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "User account deleted successfully"}
        
    except Exception as e:
        logger.error(f"Failed to delete user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user account"
        )


@router.post("/me/deactivate")
async def deactivate_current_user(
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    """Deactivate current user account."""
    try:
        success = user_service.deactivate_user(current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "User account deactivated successfully"}
        
    except Exception as e:
        logger.error(f"Failed to deactivate user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user account"
        )


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed user profile information."""
    # You can extend this to include additional profile data
    return UserResponse.from_orm(current_user)


@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user statistics (resumes, applications, etc.)."""
    try:
        from app.services.application_service import ApplicationService
        
        # Get application stats
        app_service = ApplicationService(db)
        app_stats = app_service.get_application_stats(current_user.id)
        
        # Get resume count
        from app.models.resume import Resume
        resume_count = db.query(Resume).filter(Resume.user_id == current_user.id).count()
        
        return {
            "user_id": current_user.id,
            "username": current_user.username,
            "member_since": current_user.created_at,
            "resumes": resume_count,
            "applications": {
                "total": app_stats.total,
                "applied": app_stats.applied,
                "interviewing": app_stats.interviewing,
                "rejected": app_stats.rejected,
                "offers": app_stats.offers
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get user stats for {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )
