"""User service for user management operations."""

import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import AuthService
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.exceptions import ValidationError


logger = logging.getLogger(__name__)


class UserService:
    """Service for user operations."""
    
    def __init__(self, db: Optional[Session] = None):
        """Initialize user service."""
        self.db = db
    
    def _get_db(self) -> Session:
        """Get database session."""
        if self.db:
            return self.db
        return next(get_db())
    
    def create_user(self, username: str, email: str, password: str) -> User:
        """Create a new user."""
        db = self._get_db()
        
        try:
            # Check if username already exists
            if db.query(User).filter(User.username == username).first():
                raise ValidationError("Username already registered")
            
            # Check if email already exists
            if db.query(User).filter(User.email == email).first():
                raise ValidationError("Email already registered")
            
            # Hash password
            hashed_password = AuthService.hash_password(password)
            
            # Create user
            user = User(
                username=username,
                email=email,
                hashed_password=hashed_password
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            logger.info(f"Created new user: {username} (ID: {user.id})")
            return user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create user {username}: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to create user: {str(e)}")
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate a user by username and password."""
        db = self._get_db()
        
        try:
            user = db.query(User).filter(User.username == username).first()
            
            if not user:
                logger.warning(f"Authentication failed - user not found: {username}")
                return None
            
            if not user.is_active:
                logger.warning(f"Authentication failed - user inactive: {username}")
                return None
            
            if not AuthService.verify_password(password, user.hashed_password):
                logger.warning(f"Authentication failed - invalid password: {username}")
                return None
            
            logger.info(f"User authenticated successfully: {username}")
            return user
            
        except Exception as e:
            logger.error(f"Authentication error for user {username}: {e}")
            return None
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        db = self._get_db()
        
        try:
            return db.query(User).filter(User.id == user_id).first()
        except Exception as e:
            logger.error(f"Failed to get user by ID {user_id}: {e}")
            return None
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        db = self._get_db()
        
        try:
            return db.query(User).filter(User.username == username).first()
        except Exception as e:
            logger.error(f"Failed to get user by username {username}: {e}")
            return None
    
    def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user information."""
        db = self._get_db()
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return None
            
            # Update fields
            update_data = user_update.dict(exclude_unset=True)
            
            if 'username' in update_data:
                # Check if new username is already taken
                existing = db.query(User).filter(
                    User.username == update_data['username'],
                    User.id != user_id
                ).first()
                if existing:
                    raise ValidationError("Username already taken")
                user.username = update_data['username']
            
            if 'email' in update_data:
                # Check if new email is already taken
                existing = db.query(User).filter(
                    User.email == update_data['email'],
                    User.id != user_id
                ).first()
                if existing:
                    raise ValidationError("Email already taken")
                user.email = update_data['email']
            
            if 'password' in update_data:
                user.hashed_password = AuthService.hash_password(update_data['password'])
            
            db.commit()
            db.refresh(user)
            
            logger.info(f"Updated user: {user.username} (ID: {user.id})")
            return user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update user {user_id}: {e}")
            if isinstance(e, ValidationError):
                raise
            raise ValidationError(f"Failed to update user: {str(e)}")
    
    def deactivate_user(self, user_id: int) -> bool:
        """Deactivate a user account."""
        db = self._get_db()
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            user.is_active = False
            db.commit()
            
            logger.info(f"Deactivated user: {user.username} (ID: {user.id})")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to deactivate user {user_id}: {e}")
            return False
    
    def delete_user_data(self, user_id: int) -> bool:
        """Delete all user data (GDPR compliance)."""
        db = self._get_db()
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            # Delete user (cascade will handle related records)
            db.delete(user)
            db.commit()
            
            logger.info(f"Deleted user data for user ID: {user_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete user data {user_id}: {e}")
            return False
