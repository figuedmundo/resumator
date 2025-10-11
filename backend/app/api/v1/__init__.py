"""API v1 router configuration."""

from fastapi import APIRouter
from app.api.v1 import auth, users, resumes, applications, cover_letters

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(cover_letters.router, prefix="/cover-letters", tags=["cover letters"])
