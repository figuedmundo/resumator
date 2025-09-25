"""FastAPI application entry point for Resumator with enhanced security."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.api import api_router
from app.core.database import engine, Base
from app.core.middleware import SecurityMiddleware
from app.config.settings import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Create database tables
Base.metadata.create_all(bind=engine)


def create_application() -> FastAPI:
    """Create and configure the FastAPI application with enhanced security."""
    
    app = FastAPI(
        title="Resumator API",
        description="AI-powered resume customization and job application tracking",
        version="1.0.0",
        docs_url="/docs" if settings.debug else None,  # Disable docs in production
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None
    )
    
    # Add security middleware first
    app.add_middleware(SecurityMiddleware)
    
    # Add trusted host middleware
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=settings.allowed_origins + ["localhost", "127.0.0.1"]
        )
    
    # Add CORS middleware with development-friendly configuration
    if settings.debug:
        # Development: More permissive CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"] if settings.debug else settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        # Production: Strict CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allow_headers=[
                "Authorization", 
                "Content-Type", 
                "Accept", 
                "Origin", 
                "User-Agent", 
                "DNT", 
                "Cache-Control",
                "X-Mx-ReqToken",
                "Keep-Alive",
                "X-Requested-With",
                "If-Modified-Since",
                "X-Security-Nonce"
            ],
            expose_headers=["X-Rate-Limit-Remaining", "X-Rate-Limit-Limit"]
        )
    
    # Include API routes
    app.include_router(api_router, prefix="/api")
    
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Welcome to Resumator API",
            "version": "1.0.0",
            "docs": "/docs" if settings.debug else "disabled",
            "health": "/api/v1/health"
        }
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy", 
            "service": "resumator-api",
            "version": "1.0.0"
        }
    
    return app


# Create the application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
