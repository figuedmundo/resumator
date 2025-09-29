"""Application schemas for request/response validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


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
    cover_letter_id: Optional[int] = None
    additional_instructions: Optional[str] = None
    customize_resume: bool = False


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""
    company: Optional[str] = None
    position: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    additional_instructions: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    """Schema for application response."""
    id: int
    user_id: int
    resume_id: int
    resume_version_id: int
    cover_letter_id: Optional[int]
    customized_resume_version_id: Optional[int]
    additional_instructions: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


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


class EnhancedApplicationResponse(ApplicationResponse):
    """Enhanced schema for application response with resume details."""
    resume_title: Optional[str] = None
    resume_version_name: Optional[str] = None
    customized_version_name: Optional[str] = None
    can_download_resume: bool = True
