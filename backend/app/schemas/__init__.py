"""Schemas package."""

from .user import UserCreate, UserUpdate, UserResponse, UserLogin, Token, TokenData
from .resume import (
    ResumeCreate, ResumeUpdate, ResumeResponse, ResumeVersionResponse,
    ResumeCustomizeRequest, ResumeCustomizeResponse, ResumePDFRequest,
    CoverLetterRequest, CoverLetterResponse
)
from .application import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    ApplicationListResponse, ApplicationStats
)

__all__ = [
    "UserCreate", "UserUpdate", "UserResponse", "UserLogin", "Token", "TokenData",
    "ResumeCreate", "ResumeUpdate", "ResumeResponse", "ResumeVersionResponse",
    "ResumeCustomizeRequest", "ResumeCustomizeResponse", "ResumePDFRequest",
    "CoverLetterRequest", "CoverLetterResponse",
    "ApplicationCreate", "ApplicationUpdate", "ApplicationResponse",
    "ApplicationListResponse", "ApplicationStats"
]
