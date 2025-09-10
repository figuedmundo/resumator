"""API dependencies for authentication and database sessions."""

from typing import Optional
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import AuthService
from app.models.user import User
from app.services.user_service import UserService


# Security scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify token
        payload = AuthService.verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        # Get user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user_service = UserService(db)
        user = user_service.get_user_by_id(int(user_id))
        
        if user is None:
            raise credentials_exception
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        return user
        
    except ValueError:
        raise credentials_exception
    except Exception:
        raise credentials_exception


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Get user service instance."""
    return UserService(db)


def get_resume_service(db: Session = Depends(get_db)):
    """Get resume service instance."""
    from app.services.resume_service import ResumeService
    return ResumeService(db)


def get_application_service(db: Session = Depends(get_db)):
    """Get application service instance."""
    from app.services.application_service import ApplicationService
    return ApplicationService(db)


def get_current_user_from_token(
    token: str,
    db: Session = Depends(get_db)
) -> User:
    """Get current user from token string."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify token
        payload = AuthService.verify_token(token)
        if payload is None:
            raise credentials_exception
        
        # Get user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user_service = UserService(db)
        user = user_service.get_user_by_id(int(user_id))
        
        if user is None:
            raise credentials_exception
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        return user
        
    except ValueError:
        raise credentials_exception
    except Exception:
        raise credentials_exception


def get_user_from_token_or_header(
    request,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> User:
    """Get user from token query parameter or authorization header."""
    from fastapi import Request
    
    # First check for token in query parameter
    if token:
        return get_current_user_from_token(token, db)
    
    # Then check authorization header
    authorization = request.headers.get("authorization")
    if authorization and authorization.startswith("Bearer "):
        token_from_header = authorization.split(" ")[1]
        return get_current_user_from_token(token_from_header, db)
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required"
    )
