"""Health check and utility endpoints."""

from fastapi import APIRouter
from datetime import datetime
from app.core.database import engine
from sqlalchemy import text

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "service": "resumator-api",
            "version": "1.0.0",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow(),
            "service": "resumator-api",
            "version": "1.0.0",
            "database": "disconnected",
            "error": str(e)
        }


@router.get("/status")
async def status():
    """Service status endpoint."""
    return {
        "service": "resumator-api",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow(),
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "resumes": "/api/v1/resumes",
            "applications": "/api/v1/applications"
        }
    }
