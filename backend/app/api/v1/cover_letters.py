"""Cover letter management API endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.cover_letter import (
    CoverLetterCreate, CoverLetterUpdate, CoverLetterResponse, 
    CoverLetterTemplateResponse, CoverLetterGenerateRequest, 
    CoverLetterGenerateResponse, CoverLetterCustomizeRequest,
    CoverLetterListResponse
)
from app.services.cover_letter_service import CoverLetterService
from app.services.resume_service import ResumeService
from app.api.deps import get_current_active_user
from app.core.exceptions import ValidationError


logger = logging.getLogger(__name__)
router = APIRouter()


def get_cover_letter_service(db: Session = Depends(get_db)) -> CoverLetterService:
    """Dependency for cover letter service."""
    return CoverLetterService(db)


def get_resume_service_dep(db: Session = Depends(get_db)) -> ResumeService:
    """Dependency for resume service."""
    return ResumeService(db)


# Template endpoints

@router.get("/templates", response_model=List[CoverLetterTemplateResponse])
async def list_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Get all available cover letter templates."""
    try:
        templates, _ = cover_letter_service.get_templates(skip, limit)
        return [CoverLetterTemplateResponse.from_orm(t) for t in templates]
        
    except Exception as e:
        logger.error(f"Failed to list templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list templates"
        )


@router.get("/templates/{template_id}", response_model=CoverLetterTemplateResponse)
async def get_template(
    template_id: int,
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Get a specific cover letter template."""
    try:
        template = cover_letter_service.get_template(template_id)
        return CoverLetterTemplateResponse.from_orm(template)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get template {template_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )


# Cover letter endpoints

@router.post("", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
async def create_cover_letter(
    request: CoverLetterCreate,
    current_user: User = Depends(get_current_active_user),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Create a new cover letter."""
    try:
        cover_letter = cover_letter_service.create_cover_letter(
            user_id=current_user.id,
            title=request.title,
            content=request.content,
            template_id=request.template_id
        )
        
        return CoverLetterResponse.from_orm(cover_letter)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create cover letter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create cover letter"
        )


@router.post("/generate", response_model=CoverLetterGenerateResponse, 
            status_code=status.HTTP_201_CREATED)
async def generate_cover_letter(
    request: CoverLetterGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service),
    resume_service: ResumeService = Depends(get_resume_service_dep)
):
    """Generate a new cover letter from resume and job description.
    
    This endpoint generates AI-powered cover letter content based on:
    - The user's resume (if resume_id provided)
    - Job description and company/position details
    - Optional template for formatting guidance
    """
    try:
        # Get resume content if provided
        resume_content = ""
        if request.resume_id:
            resume = resume_service.get_resume(current_user.id, request.resume_id)
            versions = resume_service.list_resume_versions(current_user.id, request.resume_id)
            
            if versions:
                # Use latest version
                latest_version = versions[0]
                resume_content = latest_version.markdown_content
            else:
                raise ValidationError("No resume versions found")
        else:
            raise ValidationError("resume_id is required for cover letter generation")
        
        # Generate and save cover letter
        cover_letter = cover_letter_service.generate_and_save_cover_letter(
            user_id=current_user.id,
            company=request.company,
            position=request.position,
            job_description=request.job_description,
            resume_content=resume_content,
            template_id=request.template_id
        )
        
        response = CoverLetterGenerateResponse.from_orm(cover_letter)
        
        # Add template name if available
        if cover_letter.template_id:
            template = cover_letter_service.get_template(cover_letter.template_id)
            response.template_name = template.name
        
        return response
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to generate cover letter: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to generate cover letter"
        )


@router.get("", response_model=CoverLetterListResponse)
async def list_cover_letters(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """List all cover letters for the current user with pagination."""
    try:
        cover_letters, total = cover_letter_service.get_user_cover_letters(
            current_user.id, skip, limit
        )
        
        page = (skip // limit) + 1
        
        return CoverLetterListResponse(
            cover_letters=[CoverLetterResponse.from_orm(cl) for cl in cover_letters],
            total=total,
            page=page,
            per_page=limit
        )
        
    except Exception as e:
        logger.error(f"Failed to list cover letters for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list cover letters"
        )


@router.get("/{cover_letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    cover_letter_id: int,
    current_user: User = Depends(get_current_active_user),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Get a specific cover letter."""
    try:
        cover_letter = cover_letter_service.get_cover_letter(
            current_user.id, cover_letter_id
        )
        
        return CoverLetterResponse.from_orm(cover_letter)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get cover letter {cover_letter_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get cover letter"
        )


@router.put("/{cover_letter_id}", response_model=CoverLetterResponse)
async def update_cover_letter(
    cover_letter_id: int,
    request: CoverLetterUpdate,
    current_user: User = Depends(get_current_active_user),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Update a cover letter."""
    try:
        cover_letter = cover_letter_service.update_cover_letter(
            user_id=current_user.id,
            cover_letter_id=cover_letter_id,
            title=request.title,
            content=request.content,
            template_id=request.template_id
        )
        
        return CoverLetterResponse.from_orm(cover_letter)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update cover letter {cover_letter_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cover letter"
        )


@router.delete("/{cover_letter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cover_letter(
    cover_letter_id: int,
    current_user: User = Depends(get_current_active_user),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Delete a cover letter."""
    try:
        success = cover_letter_service.delete_cover_letter(
            current_user.id, cover_letter_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter not found"
            )
        
        return None
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to delete cover letter {cover_letter_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete cover letter"
        )


@router.post("/{cover_letter_id}/customize")
async def customize_cover_letter(
    cover_letter_id: int,
    request: CoverLetterCustomizeRequest,
    current_user: User = Depends(get_current_active_user),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Customize an existing cover letter with additional instructions.
    
    This endpoint allows you to refine a cover letter with specific instructions.
    Returns the customized content without saving to database.
    To save, use the PUT endpoint after reviewing the customization.
    """
    try:
        customized_content = cover_letter_service.customize_cover_letter(
            current_user.id,
            cover_letter_id,
            request.additional_instructions
        )
        
        return {
            "id": cover_letter_id,
            "customized_content": customized_content,
            "preview": True,
            "message": "Preview generated. Use PUT endpoint to save changes."
        }
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to customize cover letter {cover_letter_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to customize cover letter"
        )
