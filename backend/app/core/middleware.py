"""Security middleware for FastAPI application."""

import time
import logging
from typing import Callable
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from app.core.security import SecurityHeaders, RateLimiter, audit_logger
from app.config.settings import settings

logger = logging.getLogger(__name__)


class SecurityMiddleware:
    """Security middleware for adding headers and rate limiting."""
    
    def __init__(self, app):
        self.app = app
        self.rate_limiter = RateLimiter()
        
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        
        # Rate limiting check
        client_ip = self._get_client_ip(request)
        if not self._check_rate_limits(request, client_ip):
            response = JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"}
            )
            await response(scope, receive, send)
            return
        
        # Process request
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                # Add security headers
                headers = message.get("headers", [])
                security_headers = SecurityHeaders.get_security_headers()
                
                for name, value in security_headers.items():
                    headers.append([name.encode(), value.encode()])
                
                message["headers"] = headers
                
            await send(message)
        
        await self.app(scope, receive, send_wrapper)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _check_rate_limits(self, request: Request, client_ip: str) -> bool:
        """Check tiered rate limits based on operation type."""
        path = request.url.path
        method = request.method
        
        # Skip rate limiting in development for easier testing
        if settings.is_development:
            return True
        
        # Different limits for read vs write operations
        if method in ["GET", "HEAD", "OPTIONS"]:
            limit = settings.read_requests_per_minute
            window = 60
            key_prefix = "read"
        else:
            limit = settings.write_requests_per_minute
            window = 60
            key_prefix = "write"
        
        # Apply operation-specific rate limit
        operation_key = f"{key_prefix}:{client_ip}"
        if not self.rate_limiter.is_allowed(operation_key, limit, window):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}, operation: {key_prefix}, path: {path}")
            return False
        
        # Special limits for sensitive endpoints only
        if "/auth/login" in path or "/auth/register" in path:
            auth_key = f"auth:{client_ip}"
            if not self.rate_limiter.is_allowed(auth_key, settings.auth_attempts_per_hour, 3600):
                logger.warning(f"Auth rate limit exceeded for IP: {client_ip}")
                return False
        
        # AI endpoints get separate, more restrictive limits
        if "/customize" in path or "/cover-letter" in path:
            ai_key = f"ai:{client_ip}"
            if not self.rate_limiter.is_allowed(ai_key, settings.ai_calls_per_hour, 3600):
                logger.warning(f"AI rate limit exceeded for IP: {client_ip}")
                return False
        
        # File upload limits
        if "/upload" in path:
            upload_key = f"upload:{client_ip}"
            if not self.rate_limiter.is_allowed(upload_key, settings.file_uploads_per_hour, 3600):
                logger.warning(f"Upload rate limit exceeded for IP: {client_ip}")
                return False
        
        return True


async def rate_limit_dependency(request: Request) -> None:
    """Dependency for additional rate limiting on sensitive endpoints."""
    client_ip = request.client.host if request.client else "unknown"
    
    # AI endpoint specific limits
    if "/customize" in str(request.url) or "/cover-letter" in str(request.url):
        rate_limiter = RateLimiter()
        ai_key = f"ai:{client_ip}"
        
        if not rate_limiter.is_allowed(ai_key, settings.ai_calls_per_hour):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="AI service rate limit exceeded. Please try again later."
            )


def get_client_ip(request: Request) -> str:
    """Helper to get client IP from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    return request.client.host if request.client else "unknown"
