"""Cover letter schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CoverLetterTemplateBase(BaseModel):
    """Base schema for cover letter templates."""
    name: str
    description: Optional[str] = None
    content_template: str


class CoverLetterTemplateCreate(CoverLetterTemplateBase):
    """Schema for creating a cover letter template."""
    pass


class CoverLetterTemplateResponse(CoverLetterTemplateBase):
    """Schema for cover letter template response."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CoverLetterBase(BaseModel):
    """Base schema for cover letters."""
    title: str
    content: str
    template_id: Optional[int] = None


class CoverLetterCreate(CoverLetterBase):
    """Schema for creating a cover letter."""
    pass


class CoverLetterUpdate(BaseModel):
    """Schema for updating a cover letter."""
    title: Optional[str] = None
    content: Optional[str] = None
    template_id: Optional[int] = None


class CoverLetterResponse(CoverLetterBase):
    """Schema for cover letter response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CoverLetterGenerateRequest(BaseModel):
    """Schema for generating a new cover letter."""
    company: str
    position: str
    job_description: str
    resume_id: Optional[int] = None
    template_id: Optional[int] = None


class CoverLetterGenerateResponse(CoverLetterResponse):
    """Schema for cover letter generation response."""
    template_name: Optional[str] = None


class CoverLetterCustomizeRequest(BaseModel):
    """Schema for customizing a cover letter."""
    additional_instructions: Optional[str] = None
    content: Optional[str] = None


class CoverLetterListResponse(BaseModel):
    """Schema for cover letter list response."""
    cover_letters: list[CoverLetterResponse]
    total: int
    page: int
    per_page: int
