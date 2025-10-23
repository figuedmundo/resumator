"""Application schemas for request/response validation."""

from datetime import datetime, date
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from ..schemas.cover_letter import CoverLetterVersionResponse


class ApplicationBase(BaseModel):
    """Base schema for applications."""
    company: str
    position: str
    job_description: Optional[str] = None
    status: str = "Applied"
    applied_date: Optional[date] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    """Schema for creating an application."""
    resume_id: int
    resume_version_id: int
    additional_instructions: Optional[str] = None
    customize_with_ai: bool = False
    # Cover letter customization fields
    cover_letter_id: Optional[int] = None
    cover_letter_version_id: Optional[int] = None
    customize_cover_letter: bool = False


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""
    company: Optional[str] = None
    position: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    additional_instructions: Optional[str] = None
    cover_letter_version_id: Optional[int] = None


class ApplicationResponse(ApplicationBase):
    """Schema for application response."""
    id: int
    user_id: int
    resume_id: int
    resume_version_id: int
    customized_resume_version_id: Optional[int]
    additional_instructions: Optional[str]
    created_at: datetime
    updated_at: datetime

    # New fields for cover letter integration
    cover_letter_version_id: Optional[int] = None
    cover_letter_customized_at: Optional[datetime] = None
    cover_letter_version: Optional[CoverLetterVersionResponse] = None

    # Enhanced fields
    resume_title: Optional[str] = None
    cover_letter_title: Optional[str] = None
    resume_version_name: Optional[str] = None
    customized_version_name: Optional[str] = None
    can_download_resume: bool = True

    class Config:
        from_attributes = True


class CoverLetterSelectionRequest(BaseModel):
    """Schema for selecting a cover letter for an application."""
    cover_letter_id: Optional[UUID] = Field(None, description="The master cover letter ID")
    template_id: Optional[UUID] = Field(None, description="The template to create a new cover letter from")


class ApplicationListResponse(BaseModel):
    """Schema for application list response."""
    applications: list[ApplicationResponse]
    total: int
    page: int
    per_page: int


class ApplicationStats(BaseModel):
    """Schema for application statistics."""
    total: int
    applied: int
    interviewing: int
    rejected: int
    offers: int
