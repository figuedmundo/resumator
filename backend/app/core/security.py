"""Security utilities for authentication and authorization."""

from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from app.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service for handling authentication operations."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            return payload
        except jwt.PyJWTError:
            return None
    
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
            access_token_expires = timedelta(minutes=settings.jwt_expire_minutes)
            access_token = AuthService.create_access_token(
                data={"sub": str(user.id), "username": user.username},
                expires_delta=access_token_expires
            )
            return access_token
        return None
