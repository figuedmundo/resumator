"""Enhanced security utilities with refresh tokens and rate limiting."""

import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import redis
import hashlib
from app.config.settings import settings


logger = logging.getLogger(__name__)


# Password hashing context
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# Redis client for token blacklisting and rate limiting
try:
    redis_client = redis.from_url(settings.redis_url)
    redis_client.ping()
    logger.info("Redis connected successfully")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}")
    redis_client = None


class SecurityHeaders:
    """Security headers middleware configuration."""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Return standard security headers."""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "microphone=(), camera=(), geolocation=()",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
        }


class RateLimiter:
    """Redis-based rate limiter."""
    
    def __init__(self, redis_client=redis_client):
        self.redis = redis_client
    
    def is_allowed(self, key: str, limit: int, window: int = 3600) -> bool:
        """Check if request is allowed based on rate limit."""
        if not self.redis:
            return True  # Allow if Redis is not available
        
        try:
            current = self.redis.get(key)
            if current is None:
                self.redis.setex(key, window, 1)
                return True
            
            if int(current) >= limit:
                return False
            
            self.redis.incr(key)
            return True
            
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            return True  # Allow if error occurs
    
    def get_remaining(self, key: str, limit: int) -> int:
        """Get remaining requests for the key."""
        if not self.redis:
            return limit
        
        try:
            current = self.redis.get(key)
            if current is None:
                return limit
            return max(0, limit - int(current))
        except:
            return limit


class TokenBlacklist:
    """Redis-based token blacklist."""
    
    def __init__(self, redis_client=redis_client):
        self.redis = redis_client
    
    def add_token(self, token: str, expires_at: datetime):
        """Add token to blacklist."""
        if not self.redis:
            return
        
        try:
            key = f"blacklisted_token:{hashlib.sha256(token.encode()).hexdigest()}"
            ttl = int((expires_at - datetime.utcnow()).total_seconds())
            if ttl > 0:
                self.redis.setex(key, ttl, "1")
        except Exception as e:
            logger.error(f"Token blacklist error: {e}")
    
    def is_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted."""
        if not self.redis:
            return False
        
        try:
            key = f"blacklisted_token:{hashlib.sha256(token.encode()).hexdigest()}"
            return self.redis.exists(key) > 0
        except Exception as e:
            logger.error(f"Token blacklist check error: {e}")
            return False


class FileValidator:
    """Validate uploaded files for security."""
    
    ALLOWED_EXTENSIONS = {'.md', '.txt'}
    MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
    
    @staticmethod
    def validate_file_content(content: str, filename: str) -> bool:
        """Validate file content for security issues."""
        # Check file size
        if len(content.encode('utf-8')) > FileValidator.MAX_FILE_SIZE:
            raise ValueError(f"File too large. Maximum size: {FileValidator.MAX_FILE_SIZE / (1024*1024):.1f}MB")
        
        # Check file extension
        if filename:
            ext = filename.lower().split('.')[-1] if '.' in filename else ''
            if f'.{ext}' not in FileValidator.ALLOWED_EXTENSIONS:
                raise ValueError(f"File type not allowed. Allowed: {', '.join(FileValidator.ALLOWED_EXTENSIONS)}")
        
        # Basic content validation
        if not content.strip():
            raise ValueError("File content cannot be empty")
        
        # Check for potential malicious patterns
        suspicious_patterns = [
            '<script', 'javascript:', 'data:', 'vbscript:', 
            'onload=', 'onerror=', 'onclick=', '&lt;script'
        ]
        
        content_lower = content.lower()
        for pattern in suspicious_patterns:
            if pattern in content_lower:
                logger.warning(f"Suspicious content detected: {pattern}")
                # Don't reject, but log for monitoring
        
        return True
    
    @staticmethod
    def sanitize_markdown(content: str) -> str:
        """Sanitize markdown content."""
        # Remove potential XSS vectors while preserving markdown
        import re
        
        # Remove script tags
        content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove javascript: links
        content = re.sub(r'javascript:[^"\']*', '', content, flags=re.IGNORECASE)
        
        # Remove on* event handlers
        content = re.sub(r'\son\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
        
        return content


class AuditLogger:
    """Audit logging for security events."""
    
    def __init__(self):
        self.logger = logging.getLogger("security_audit")
    
    def log_auth_attempt(self, username: str, success: bool, ip_address: str = None):
        """Log authentication attempt."""
        event = {
            "event": "auth_attempt",
            "username": username,
            "success": success,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if success:
            self.logger.info(f"Successful login: {event}")
        else:
            self.logger.warning(f"Failed login attempt: {event}")
    
    def log_file_upload(self, user_id: int, filename: str, size: int, ip_address: str = None):
        """Log file upload event."""
        event = {
            "event": "file_upload",
            "user_id": user_id,
            "filename": filename,
            "size": size,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.info(f"File upload: {event}")
    
    def log_sensitive_operation(self, user_id: int, operation: str, details: str = None):
        """Log sensitive operations."""
        event = {
            "event": "sensitive_operation",
            "user_id": user_id,
            "operation": operation,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.info(f"Sensitive operation: {event}")


# Initialize global instances
rate_limiter = RateLimiter()
token_blacklist = TokenBlacklist()
audit_logger = AuditLogger()


class AuthService:
    """Enhanced service for handling authentication operations."""
    
    @staticmethod
    def generate_secure_token() -> str:
        """Generate a cryptographically secure token."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using Argon2 (with bcrypt fallback)."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token with shorter expiry."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_expire_minutes)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.jwt_secret, 
            algorithm=settings.jwt_algorithm
        )
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> tuple[str, datetime]:
        """Create a JWT refresh token with longer expiry."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.jwt_refresh_expire_days)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "jti": AuthService.generate_secure_token()  # Unique token ID
        })
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.jwt_secret, 
            algorithm=settings.jwt_algorithm
        )
        return encoded_jwt, expire
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
        """Verify and decode a JWT token with blacklist check."""
        try:
            # Check if token is blacklisted
            if token_blacklist.is_blacklisted(token):
                logger.warning("Attempted to use blacklisted token")
                return None
            
            payload = jwt.decode(
                token, 
                settings.jwt_secret, 
                algorithms=[settings.jwt_algorithm]
            )
            
            # Verify token type
            if payload.get("type") != token_type:
                logger.warning(f"Token type mismatch: expected {token_type}, got {payload.get('type')}")
                return None
            
            return payload
            
        except JWTError as e:
            logger.warning(f"JWT verification failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None
    
    @staticmethod
    def revoke_token(token: str):
        """Revoke a token by adding it to blacklist."""
        try:
            payload = jwt.decode(
                token, 
                settings.jwt_secret, 
                algorithms=[settings.jwt_algorithm]
            )
            expires_at = datetime.fromtimestamp(payload.get("exp", 0))
            token_blacklist.add_token(token, expires_at)
            logger.info("Token revoked successfully")
        except Exception as e:
            logger.error(f"Token revocation error: {e}")
    
    @staticmethod
    def create_token_pair(data: dict) -> dict:
        """Create access and refresh token pair."""
        access_token = AuthService.create_access_token(data)
        refresh_token, refresh_expires = AuthService.create_refresh_token(data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.jwt_access_expire_minutes * 60
        }
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Optional[dict]:
        """Create new access token from valid refresh token."""
        payload = AuthService.verify_token(refresh_token, "refresh")
        if not payload:
            return None
        
        # Create new access token
        access_token_data = {
            "sub": payload.get("sub"),
            "username": payload.get("username")
        }
        access_token = AuthService.create_access_token(access_token_data)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.jwt_access_expire_minutes * 60
        }
    
    @staticmethod
    def register_user(username: str, email: str, password: str):
        """Register a new user - implementation in UserService."""
        from app.services.user_service import UserService
        user_service = UserService()
        return user_service.create_user(username, email, password)
    
    @staticmethod
    def authenticate(username: str, password: str) -> Optional[str]:
        """Authenticate user and return JWT token."""
        from app.services.user_service import UserService
        user_service = UserService()
        user = user_service.authenticate_user(username, password)
        if user:
            access_token_expires = timedelta(minutes=settings.jwt_access_expire_minutes)
            access_token = AuthService.create_access_token(
                data={"sub": str(user.id), "username": user.username},
                expires_delta=access_token_expires
            )
            return access_token
        return None
