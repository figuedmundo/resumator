"""Authentication API endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import AuthService
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.services.user_service import UserService
from app.core.exceptions import ValidationError


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_create: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user."""
    try:
        user_service = UserService(db)
        
        # Create user
        user = user_service.create_user(
            username=user_create.username,
            email=user_create.email,
            password=user_create.password
        )
        
        # Generate token
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "username": user.username}
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=Token)
async def login(
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user and return JWT token."""
    try:
        user_service = UserService(db)
        
        # Authenticate user
        user = user_service.authenticate_user(
            email=user_login.email,
            password=user_login.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate token
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "username": user.username}
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed for user {user_login.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/verify-token")
async def verify_token(
    current_user: UserResponse = Depends(lambda: None)  # Will be implemented with proper dependency
):
    """Verify if the current token is valid."""
    # This endpoint will be protected by authentication dependency
    # If we reach here, token is valid
    return {"valid": True, "user": current_user}


@router.post("/refresh-token", response_model=Token)
async def refresh_token(
    current_user = Depends(lambda: None)  # Will be implemented with proper dependency
):
    """Refresh JWT token."""
    # Generate new token
    access_token = AuthService.create_access_token(
        data={"sub": str(current_user.id), "username": current_user.username}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(current_user)
    )
