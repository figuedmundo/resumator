"""Cover letter schema models for request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ======================================
# Template Schemas
# ======================================

class CoverLetterTemplateResponse(BaseModel):
    """Template response model."""
    id: int
    name: str
    description: Optional[str] = None
    content_template: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ======================================
# Version Schemas
# ======================================

class CoverLetterVersionCreate(BaseModel):
    """Create a new version."""
    content: str = Field(..., description="Cover letter content in markdown")
    job_description: Optional[str] = Field(None, description="Job description used for customization")
    is_original: bool = Field(default=True, description="Whether this is an original master version")


class CoverLetterVersionResponse(BaseModel):
    """Version response model."""
    id: int
    cover_letter_id: int
    version: str = Field(..., description="Version identifier (e.g., v1, v2 - Company Name)")
    markdown_content: str
    job_description: Optional[str] = None
    is_original: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ======================================
# Master Cover Letter Schemas
# ======================================

class CoverLetterCreate(BaseModel):
    """Create a new master cover letter."""
    title: str = Field(..., description="Name of this cover letter")
    content: str = Field(default="", description="Initial content for the first version")
    is_default: bool = Field(default=False, description="Whether this is the default cover letter")


class CoverLetterUpdate(BaseModel):
    """Update cover letter metadata."""
    title: Optional[str] = None
    is_default: Optional[bool] = None


class CoverLetterResponse(BaseModel):
    """Cover letter response model (metadata only, no versions)."""
    id: int
    user_id: int
    title: str
    is_default: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CoverLetterDetailResponse(BaseModel):
    """Detailed cover letter response with versions."""
    id: int
    user_id: int
    title: str
    is_default: bool
    created_at: datetime
    updated_at: datetime
    versions: List[CoverLetterVersionResponse] = []
    
    class Config:
        from_attributes = True


# ======================================
# Generation Schemas
# ======================================

class CoverLetterGenerateRequest(BaseModel):
    """Request to generate a new cover letter."""
    title: str = Field(..., description="Name for this cover letter")
    resume_id: int = Field(..., description="Resume to use for personalization")
    job_description: str = Field(..., description="Job posting text")
    company: str = Field(..., description="Company name")
    position: str = Field(..., description="Position title")
    template_id: Optional[int] = Field(None, description="Optional template to guide generation")
    base_cover_letter_content: Optional[str] = Field(None, description="Optional base cover letter content to use as a template")


class CoverLetterGenerateResponse(BaseModel):
    """Response after generating a cover letter."""
    id: int
    user_id: int
    title: str
    is_default: bool
    created_at: datetime
    updated_at: datetime
    versions: List[CoverLetterVersionResponse] = []
    
    class Config:
        from_attributes = True


# ======================================
# Legacy Schemas (for backward compatibility)
# ======================================

class CoverLetterCreateLegacy(BaseModel):
    """Legacy schema for creating cover letter with content directly."""
    title: str
    content: str
    template_id: Optional[int] = None


class CoverLetterUpdateLegacy(BaseModel):
    """Legacy schema for updating cover letter."""
    title: Optional[str] = None
    content: Optional[str] = None
    template_id: Optional[int] = None


class CoverLetterResponseLegacy(BaseModel):
    """Legacy cover letter response."""
    id: int
    user_id: int
    title: str
    content: str
    template_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CoverLetterGenerateRequestLegacy(BaseModel):
    """Legacy generation request."""
    resume_id: Optional[int] = None
    company: str
    position: str
    job_description: str
    template_id: Optional[int] = None


class CoverLetterListResponse(BaseModel):
    """Paginated list of cover letters."""
    cover_letters: List[CoverLetterResponse]
    total: int
    page: int
    per_page: int
