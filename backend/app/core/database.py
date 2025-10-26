"""Database configuration and session management."""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Check if we're in testing mode BEFORE importing settings
# This must happen before any database connection attempts
TESTING = os.environ.get('TESTING', '').lower() in ('1', 'true', 'yes')

if TESTING:
    # Use in-memory SQLite for tests - no need to import settings
    DATABASE_URL = "sqlite:///:memory:"
    print("✓ Test mode: Using in-memory SQLite database")
    
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # Production/development: Use PostgreSQL from settings
    from app.config import settings
    
    print(f"Database URL: {settings.database_url}")
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_recycle=300,
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
