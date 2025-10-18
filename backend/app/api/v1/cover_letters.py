"""Cover letter management API endpoints - Refactored to match Resume pattern."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.cover_letter import (
    CoverLetterCreate, CoverLetterUpdate, CoverLetterResponse, 
    CoverLetterTemplateResponse, CoverLetterGenerateRequest, 
    CoverLetterVersionResponse, CoverLetterVersionCreate,
    CoverLetterListResponse, CoverLetterDetailResponse
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


# ======================================
# Template Endpoints
# ======================================

@router.get("/templates", response_model=List[CoverLetterTemplateResponse])
async def list_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    cover_letter_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Get all available cover letter templates."""
    try:
        templates, _ = cover_letter_service.list_templates(skip, limit)
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get template {template_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )


# ======================================
# Cover Letter Master Record Endpoints
# ======================================

@router.post("", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
async def create_cover_letter(
    request: CoverLetterCreate,
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Create a new master cover letter and its initial version."""
    try:
        cover_letter = service.create_cover_letter(
            user_id=current_user.id,
            title=request.title,
            content=request.content,
            is_default=request.is_default or False
        )
        return CoverLetterResponse.from_orm(cover_letter)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create cover letter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create cover letter"
        )


@router.get("", response_model=List[CoverLetterResponse])
async def list_cover_letters(
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """List all cover letters for the current user."""
    try:
        cover_letters = service.list_user_cover_letters(current_user.id)
        return [CoverLetterResponse.from_orm(cl) for cl in cover_letters]
    except Exception as e:
        logger.error(f"Failed to list cover letters for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list cover letters"
        )


@router.get("/{cover_letter_id}", response_model=CoverLetterDetailResponse)
async def get_cover_letter(
    cover_letter_id: int,
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Get a specific cover letter with all its versions."""
    try:
        cover_letter = service.get_cover_letter(current_user.id, cover_letter_id)
        versions = service.list_versions(current_user.id, cover_letter_id)
        
        response = CoverLetterDetailResponse.from_orm(cover_letter)
        response.versions = [CoverLetterVersionResponse.from_orm(v) for v in versions]
        return response
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
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
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Update cover letter metadata (title, is_default)."""
    try:
        cover_letter = service.update_cover_letter(
            user_id=current_user.id,
            cover_letter_id=cover_letter_id,
            title=request.title,
            is_default=request.is_default
        )
        return CoverLetterResponse.from_orm(cover_letter)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
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
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Delete a cover letter (only if no applications reference it)."""
    try:
        service.delete_cover_letter(current_user.id, cover_letter_id)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to delete cover letter {cover_letter_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete cover letter"
        )


# ======================================
# Cover Letter Version Endpoints
# ======================================

@router.post("/{cover_letter_id}/versions", response_model=CoverLetterVersionResponse, 
            status_code=status.HTTP_201_CREATED)
async def create_version(
    cover_letter_id: int,
    request: CoverLetterVersionCreate,
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Create a new version for a cover letter."""
    try:
        version = service.create_version(
            user_id=current_user.id,
            cover_letter_id=cover_letter_id,
            content=request.content,
            job_description=request.job_description,
            is_original=request.is_original or True
        )
        return CoverLetterVersionResponse.from_orm(version)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create version: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create version"
        )


@router.get("/{cover_letter_id}/versions", response_model=List[CoverLetterVersionResponse])
async def list_versions(
    cover_letter_id: int,
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """List all versions for a cover letter."""
    try:
        versions = service.list_versions(current_user.id, cover_letter_id)
        return [CoverLetterVersionResponse.from_orm(v) for v in versions]
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to list versions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list versions"
        )


@router.get("/{cover_letter_id}/versions/{version_id}", response_model=CoverLetterVersionResponse)
async def get_version(
    cover_letter_id: int,
    version_id: int,
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Get a specific version."""
    try:
        version = service.get_version(current_user.id, cover_letter_id, version_id)
        if not version:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")
        return CoverLetterVersionResponse.from_orm(version)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get version {version_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get version"
        )


@router.put("/{cover_letter_id}/versions/{version_id}", response_model=CoverLetterVersionResponse)
async def update_version(
    cover_letter_id: int,
    version_id: int,
    request: CoverLetterVersionCreate,
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Update a version's content."""
    try:
        version = service.update_version(
            user_id=current_user.id,
            cover_letter_id=cover_letter_id,
            version_id=version_id,
            content=request.content
        )
        if not version:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")
        return CoverLetterVersionResponse.from_orm(version)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to update version {version_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update version"
        )


@router.delete("/{cover_letter_id}/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_version(
    cover_letter_id: int,
    version_id: int,
    current_user: User = Depends(get_current_active_user),
    service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Delete a version (only if no applications reference it)."""
    try:
        service.delete_version(current_user.id, cover_letter_id, version_id)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to delete version {version_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete version"
        )


# ======================================
# Generation Endpoints
# ======================================

@router.post("/generate", response_model=CoverLetterDetailResponse, 
            status_code=status.HTTP_201_CREATED)
async def generate_cover_letter(
    request: CoverLetterGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    cl_service: CoverLetterService = Depends(get_cover_letter_service),
    resume_service: ResumeService = Depends(get_resume_service_dep)
):
    """Generate and save a new cover letter using AI.
    
    Requires:
    - resume_id: To extract content for personalization
    - job_description: The job posting
    - company: Company name for version naming
    - position: Position title
    - title: Name for this cover letter
    
    Optional:
    - template_id: Template to guide generation
    """
    try:
        # Get resume content
        if not request.resume_id:
            raise ValidationError("resume_id is required")
        
        resume = resume_service.get_resume(current_user.id, request.resume_id)
        versions = resume_service.list_resume_versions(current_user.id, request.resume_id)
        
        if not versions:
            raise ValidationError("No resume versions found")
        
        resume_content = versions[0].markdown_content
        
        # Generate and save
        cover_letter = cl_service.generate_and_save(
            user_id=current_user.id,
            title=request.title,
            resume_content=resume_content,
            job_description=request.job_description,
            company=request.company,
            position=request.position,
            template_id=request.template_id,
            base_cover_letter_content=request.base_cover_letter_content
        )
        
        # Get versions
        versions_list = cl_service.list_versions(current_user.id, cover_letter.id)
        
        response = CoverLetterDetailResponse.from_orm(cover_letter)
        response.versions = [CoverLetterVersionResponse.from_orm(v) for v in versions_list]
        return response
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate cover letter: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to generate cover letter"
        )
