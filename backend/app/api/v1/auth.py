"""Enhanced authentication API endpoints with refresh tokens and audit logging."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import AuthService, audit_logger, FileValidator, rate_limiter
from app.core.middleware import get_client_ip, rate_limit_dependency
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse, RefreshTokenRequest
from app.services.user_service import UserService
from app.core.exceptions import ValidationError
from app.config.settings import settings


logger = logging.getLogger(__name__)
router = APIRouter()
logger.info(f"APIRouter instance created in auth.py: {router}")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_create: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    _: None = Depends(rate_limit_dependency)
):
    """Register a new user with enhanced security."""
    client_ip = get_client_ip(request)
    logger.info("Register route defined.")
    
    try:
        # Additional rate limiting for registration
        reg_key = f"register:{client_ip}"
        if not rate_limiter.is_allowed(reg_key, 3, 3600):  # 3 registrations per hour
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Registration rate limit exceeded"
            )
        
        user_service = UserService(db)
        
        # Create user
        user = user_service.create_user(
            username=user_create.username,
            email=user_create.email,
            password=user_create.password
        )
        
        # Generate token pair
        token_data = {"sub": str(user.id), "username": user.username}
        tokens = AuthService.create_token_pair(token_data)
        
        # Log successful registration
        audit_logger.log_auth_attempt(user_create.username, True, client_ip)
        audit_logger.log_sensitive_operation(
            user.id, 
            "user_registration", 
            f"New user registered: {user_create.username}"
        )
        
        return Token(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type="bearer",
            expires_in=tokens["expires_in"],
            user=UserResponse.from_orm(user)
        )
        
    except ValidationError as e:
        audit_logger.log_auth_attempt(user_create.username, False, client_ip)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        audit_logger.log_auth_attempt(user_create.username, False, client_ip)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=Token)
async def login(
    user_login: UserLogin,
    request: Request,
    db: Session = Depends(get_db),
    _: None = Depends(rate_limit_dependency)
):
    """Login user and return JWT token pair with audit logging."""
    client_ip = get_client_ip(request)
    logger.info("Login route defined.")
    
    try:
        user_service = UserService(db)
        
        # Authenticate user
        user = user_service.authenticate_user(
            email=user_login.email,
            password=user_login.password
        )
        
        if not user:
            audit_logger.log_auth_attempt(user_login.email, False, client_ip)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate token pair
        token_data = {"sub": str(user.id), "username": user.username}
        tokens = AuthService.create_token_pair(token_data)
        
        # Log successful login
        audit_logger.log_auth_attempt(user.username, True, client_ip)
        
        return Token(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type="bearer",
            expires_in=tokens["expires_in"],
            user=UserResponse.from_orm(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed for user {user_login.email}: {e}")
        audit_logger.log_auth_attempt(user_login.email, False, client_ip)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
    _: None = Depends(rate_limit_dependency)
):
    """Refresh access token using refresh token."""
    client_ip = get_client_ip(request)
    
    try:
        # Refresh the access token
        new_tokens = AuthService.refresh_access_token(refresh_request.refresh_token, db)
        
        if not new_tokens:
            audit_logger.log_sensitive_operation(
                0, "token_refresh_failed", f"Invalid refresh token from {client_ip}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Log successful token refresh
        audit_logger.log_sensitive_operation(
            0, "token_refreshed", f"Token refreshed from {client_ip}"
        )
        
        return Token(
            access_token=new_tokens["access_token"],
            refresh_token=refresh_request.refresh_token,  # Keep same refresh token
            token_type="bearer",
            expires_in=new_tokens["expires_in"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(
    request: Request,
    current_user = Depends(lambda: None)  # Will implement proper dependency
):
    """Logout user and revoke tokens."""
    client_ip = get_client_ip(request)
    
    try:
        # Extract token from authorization header
        authorization = request.headers.get("authorization")
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            
            # Revoke the token
            AuthService.revoke_token(token)
            
            # Log logout
            audit_logger.log_sensitive_operation(
                getattr(current_user, 'id', 0), 
                "user_logout", 
                f"User logged out from {client_ip}"
            )
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )
