"""Application configuration settings."""

import os
import json
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # --- Database ---
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://resumator:password@db:5432/resumator"
    )
    postgres_user: Optional[str] = os.getenv("POSTGRES_USER")
    postgres_password: Optional[str] = os.getenv("POSTGRES_PASSWORD")
    postgres_db: Optional[str] = os.getenv("POSTGRES_DB")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # Security
    jwt_secret: str = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production")
    jwt_algorithm: str = "HS256"
    jwt_access_expire_minutes: int = 15  # Shorter access token lifetime
    jwt_refresh_expire_days: int = 30  # Refresh token lifetime
    # jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days default

    # AI Service (Groq)
    groq_api_url: str = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model_name: str = os.getenv("GROQ_MODEL_NAME", "llama3-8b-8192")
    
    # Storage
    storage_type: str = os.getenv("STORAGE_TYPE", "local")  # local or s3
    storage_path: str = os.getenv("STORAGE_PATH", "/app/storage")
    
    # MinIO/S3 (optional)
    minio_endpoint: Optional[str] = os.getenv("MINIO_ENDPOINT")
    minio_access_key: Optional[str] = os.getenv("MINIO_ACCESS_KEY")
    minio_secret_key: Optional[str] = os.getenv("MINIO_SECRET_KEY")
    minio_bucket: str = os.getenv("MINIO_BUCKET", "resumator")
    
    # App
    app_name: str = os.getenv("APP_NAME", "Resume Customizer")
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS - Allow both HTTP and HTTPS for development
    # Dynamically load from environment variable, or use development defaults
    allowed_origins: list = json.loads(os.getenv(
        "ALLOWED_ORIGINS",
        json.dumps([
            "http://localhost:3000",  # React dev server
            "http://localhost:5173",  # Vite dev server
            "https://localhost:3000", # Production HTTPS
            "https://localhost:5173", # Production HTTPS
            "http://127.0.0.1:3000",  # Alternative localhost
            "http://127.0.0.1:5173",  # Alternative localhost
        ])
    ))
    
    # --- Environment (dev or prod) ---
    environment: str = os.getenv("ENVIRONMENT", "dev")
    
    @property
    def is_development(self) -> bool:
        return self.environment == "dev" or self.debug

    # --- Rate limiting ---
    # Relaxed limits for better UX while maintaining security
    ai_calls_per_hour: int = int(os.getenv("AI_CALLS_PER_HOUR", "50"))  # Increased from 20
    requests_per_minute: int = int(
        os.getenv("REQUESTS_PER_MINUTE", "1000" if environment == "dev" else "60")  # Reduced prod from 100
    )
    auth_attempts_per_hour: int = int(
        os.getenv("AUTH_ATTEMPTS_PER_HOUR", "50" if environment == "dev" else "10")  # More reasonable
    )
    file_uploads_per_hour: int = int(os.getenv("FILE_UPLOADS_PER_HOUR", "20"))  # Increased from 10
    
    # Separate limits for read vs write operations
    read_requests_per_minute: int = int(os.getenv("READ_REQUESTS_PER_MINUTE", "300"))
    write_requests_per_minute: int = int(os.getenv("WRITE_REQUESTS_PER_MINUTE", "60"))

    # --- Email ---
    smtp_host: Optional[str] = os.getenv("SMTP_HOST")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: Optional[str] = os.getenv("SMTP_USER")
    smtp_password: Optional[str] = os.getenv("SMTP_PASSWORD")
    email_from: Optional[str] = os.getenv("EMAIL_FROM")

    # --- Sentry ---
    sentry_dsn: Optional[str] = os.getenv("SENTRY_DSN")
    
    class Config:
        # Load .env.dev or .env.prod automatically
        env_file = f".env.{os.getenv('ENVIRONMENT', 'dev')}"
        extra = "ignore"

settings = Settings()
