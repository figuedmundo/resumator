"""Resume schemas for request/response validation."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ResumeVersionBase(BaseModel):
    """Base schema for resume versions."""
    version: str
    markdown_content: str
    job_description: Optional[str] = None
    is_original: bool = False


class ResumeVersionCreate(ResumeVersionBase):
    """Schema for creating a resume version."""
    pass


class ResumeVersionResponse(ResumeVersionBase):
    """Schema for resume version response."""
    id: int
    resume_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ResumeBase(BaseModel):
    """Base schema for resumes."""
    title: str
    is_default: bool = False


class ResumeCreate(ResumeBase):
    """Schema for creating a resume."""
    markdown: str  # Initial markdown content for v1


class ResumeUpdate(BaseModel):
    """Schema for updating a resume."""
    title: Optional[str] = None
    is_default: Optional[bool] = None


class ResumeResponse(ResumeBase):
    """Schema for resume response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    versions: List[ResumeVersionResponse] = []
    
    class Config:
        from_attributes = True


class ResumeCustomizeRequest(BaseModel):
    """Schema for customizing a resume."""
    job_description: str
    instructions: Optional[Dict[str, Any]] = None


class ResumeCustomizeResponse(BaseModel):
    """Schema for customized resume response."""
    customized_markdown: str
    version: str
    version_id: int


class ResumePDFRequest(BaseModel):
    """Schema for PDF generation request."""
    template: str = "modern"
    version_id: Optional[int] = None  # If not provided, use latest


class CoverLetterRequest(BaseModel):
    """Schema for cover letter generation."""
    company: str
    position: str
    job_description: str
    template: Optional[str] = None


class CoverLetterResponse(BaseModel):
    """Schema for cover letter response."""
    id: int
    title: str
    content: str
    template_used: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
