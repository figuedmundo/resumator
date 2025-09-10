"""Resume management API endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.resume import (
    ResumeCreate, ResumeResponse, ResumeVersionResponse, 
    ResumeCustomizeRequest, ResumeCustomizeResponse,
    ResumePDFRequest, CoverLetterRequest, CoverLetterResponse
)
from app.services.resume_service import ResumeService
from app.services.pdf_service import pdf_service
from app.api.deps import get_current_active_user, get_resume_service, get_current_user_from_token
from app.core.exceptions import ResumeNotFoundError, ValidationError, AIServiceError
import io


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    resume_create: ResumeCreate,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Upload a new resume."""
    try:
        resume = resume_service.upload_resume(
            user_id=current_user.id,
            title=resume_create.title,
            markdown=resume_create.markdown
        )
        
        return {
            "resume_id": resume.id,
            "version": "v1",
            "message": "Resume uploaded successfully"
        }
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to upload resume for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload resume"
        )


@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """List all resumes for the current user."""
    try:
        resumes = resume_service.list_user_resumes(current_user.id)
        return [ResumeResponse.from_orm(resume) for resume in resumes]
        
    except Exception as e:
        logger.error(f"Failed to list resumes for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list resumes"
        )


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Get a specific resume."""
    try:
        resume = resume_service.get_resume(current_user.id, resume_id)
        return ResumeResponse.from_orm(resume)
        
    except ResumeNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get resume {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get resume"
        )


@router.post("/{resume_id}/customize", response_model=ResumeCustomizeResponse)
async def customize_resume(
    resume_id: int,
    request: ResumeCustomizeRequest,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Customize a resume for a specific job description."""
    try:
        customized_markdown = resume_service.customize_resume(
            user_id=current_user.id,
            resume_id=resume_id,
            job_description=request.job_description,
            instructions=request.instructions
        )
        
        # Get the latest version info
        versions = resume_service.list_resume_versions(current_user.id, resume_id)
        latest_version = versions[0] if versions else None
        
        return ResumeCustomizeResponse(
            customized_markdown=customized_markdown,
            version=latest_version.version if latest_version else "unknown",
            version_id=latest_version.id if latest_version else 0
        )
        
    except ResumeNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to customize resume {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to customize resume"
        )


@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
async def list_resume_versions(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """List all versions of a resume."""
    try:
        versions = resume_service.list_resume_versions(current_user.id, resume_id)
        return [ResumeVersionResponse.from_orm(version) for version in versions]
        
    except ResumeNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to list resume versions for {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list resume versions"
        )


@router.get("/{resume_id}/versions/{version_id}")
async def get_resume_version(
    resume_id: int,
    version_id: int,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Get a specific resume version."""
    try:
        version = resume_service.get_resume_version(
            current_user.id, resume_id, version_id
        )
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume version not found"
            )
        
        return {
            "id": version.id,
            "version": version.version,
            "markdown_content": version.markdown_content,
            "job_description": version.job_description,
            "is_original": version.is_original,
            "created_at": version.created_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get resume version {version_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get resume version"
        )


@router.put("/{resume_id}/versions/{version_id}")
async def update_resume_version(
    resume_id: int,
    version_id: int,
    request: dict,  # Should contain 'markdown' field
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Update a resume version's content."""
    try:
        if 'markdown' not in request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Markdown content is required"
            )
        
        version = resume_service.update_resume_version(
            user_id=current_user.id,
            resume_id=resume_id,
            version_id=version_id,
            markdown=request['markdown']
        )
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume version not found"
            )
        
        return {"message": "Resume version updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update resume version {version_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update resume version"
        )


@router.get("/{resume_id}/download")
async def download_resume_pdf(
    resume_id: int,
    template: str = "modern",
    version_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Download resume as PDF."""
    try:
        # Get resume version
        if version_id:
            version = resume_service.get_resume_version(
                current_user.id, resume_id, version_id
            )
        else:
            # Get latest version
            versions = resume_service.list_resume_versions(current_user.id, resume_id)
            version = versions[0] if versions else None
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume version not found"
            )
        
        # Generate PDF
        pdf_bytes = pdf_service.generate_resume_pdf(
            version.markdown_content, template
        )
        
        # Create streaming response
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=resume_{template}_{version.version}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate PDF for resume {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF"
        )


@router.get("/{resume_id}/preview")
async def preview_resume_pdf(
    request,
    resume_id: int,
    template: str = "modern",
    version_id: Optional[int] = None,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Preview resume as PDF in browser."""
    from fastapi import Request
    
    try:
        # Get current user from token or header
        current_user = None
        
        if token:
            current_user = get_current_user_from_token(token, db)
        else:
            # Try to get from authorization header
            authorization = request.headers.get("authorization")
            if authorization and authorization.startswith("Bearer "):
                token_from_header = authorization.split(" ")[1]
                current_user = get_current_user_from_token(token_from_header, db)
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        # Get resume version
        if version_id:
            version = resume_service.get_resume_version(
                current_user.id, resume_id, version_id
            )
        else:
            # Get latest version
            versions = resume_service.list_resume_versions(current_user.id, resume_id)
            version = versions[0] if versions else None
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume version not found"
            )
        
        # Generate PDF
        pdf_bytes = pdf_service.generate_resume_pdf(
            version.markdown_content, template
        )
        
        # Create streaming response for inline viewing
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=resume_{template}_{version.version}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to preview PDF for resume {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to preview PDF"
        )


@router.post("/{resume_id}/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(
    resume_id: int,
    request: CoverLetterRequest,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Generate a cover letter for a specific resume."""
    try:
        cover_letter = resume_service.generate_cover_letter(
            user_id=current_user.id,
            company=request.company,
            position=request.position,
            job_description=request.job_description,
            resume_id=resume_id,
            template=request.template
        )
        
        return CoverLetterResponse.from_orm(cover_letter)
        
    except ResumeNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to generate cover letter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate cover letter"
        )


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """Delete a resume and all its versions."""
    try:
        success = resume_service.delete_resume(current_user.id, resume_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        return {"message": "Resume deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete resume {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume"
        )


@router.get("/templates/list")
async def list_pdf_templates():
    """Get available PDF templates."""
    try:
        templates = pdf_service.get_available_templates()
        return {"templates": templates}
        
    except Exception as e:
        logger.error(f"Failed to list PDF templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list PDF templates"
        )
