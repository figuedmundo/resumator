"""
Shared pytest fixtures for all tests.
These fixtures provide database, client, authentication, and test data.
"""
import os
import pytest
from typing import Generator, Dict, Optional
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.orm import Session
from pathlib import Path

# CRITICAL: Set TESTING environment variable BEFORE any app imports
# This must be the very first thing to prevent database connection attempts
os.environ['TESTING'] = '1'

from app.core.database import Base, get_db, engine

# Enable foreign keys for SQLite (when using test engine)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Enable foreign key constraints for SQLite."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create fresh database for each test.
    Automatically creates tables, yields session, then drops tables.
    """
    Base.metadata.create_all(bind=engine)
    from app.core.database import SessionLocal
    session = SessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)


from app.services.storage_service import LocalStorageService

class MockPDFService:
    def generate_resume_pdf(self, markdown_content: str, template_id: str = "modern") -> bytes:
        return b"mock pdf content"

    def generate_cover_letter_pdf(self, content: str, company: str, position: str, title: Optional[str] = None) -> bytes:
        return b"mock pdf content"

    def generate_resume_html(self, markdown_content: str, template_id: str = "modern") -> str:
        return "<h1>mock html</h1>"

    def get_available_templates(self) -> list:
        return ["modern", "classic"]


@pytest.fixture(scope="function")
def client(db: Session, tmp_path: Path, monkeypatch) -> Generator[TestClient, None, None]:
    """
    FastAPI test client with database and service overrides.
    """
    from main import app
    from app.api.deps import get_storage, get_pdf_service

    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_get_storage():
        return LocalStorageService(base_path=str(tmp_path))

    def override_get_pdf_service():
        return MockPDFService()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_storage] = override_get_storage
    app.dependency_overrides[get_pdf_service] = override_get_pdf_service

    # Even if services use get_storage_service directly, this will patch it
    monkeypatch.setattr("app.services.resume_service.get_storage_service", override_get_storage)
    monkeypatch.setattr("app.services.cover_letter_service.get_storage_service", override_get_storage)


    from app.config import settings
    settings.debug = True

    with TestClient(app, base_url="http://testserver") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope='function')
def session(db: Session) -> Generator[Session, None, None]:
    """Inject the database session into the factories."""
    from .factories import user_factory
    user_factory.UserFactory._meta.sqlalchemy_session = db
    yield db


@pytest.fixture
def sample_user_data() -> Dict[str, str]:
    """Sample user registration data for tests."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "SecurePass123!",
        "full_name": "Test User"
    }


@pytest.fixture
def authenticated_user(client: TestClient, sample_user_data: Dict) -> Dict:
    """
    Creates a user, logs in, returns user data + auth token.
    Most tests need authenticated access, so this is very common.
    """
    # Register
    # Note: In debug mode, the prefix is /api
    response = client.post("/api/v1/auth/register", json=sample_user_data)
    assert response.status_code == 201
    token_response = response.json()
    user = token_response.get("user")

    # Login
    login_response = client.post("/api/v1/auth/login", json={
        "email": sample_user_data["email"],
        "password": sample_user_data["password"]
    })
    assert login_response.status_code == 200
    token_data = login_response.json()

    return {
        "user": user,
        "token": token_data["access_token"],
        "headers": {"Authorization": f"Bearer {token_data['access_token']}"}
    }


@pytest.fixture
def auth_headers(authenticated_user: Dict) -> Dict[str, str]:
    """Shortcut to get just the authorization headers."""
    return authenticated_user["headers"]


@pytest.fixture
def mock_ai_service(monkeypatch):
    """Mock AI service to avoid external API calls in tests."""
    def mock_generate_cover_letter(*args, **kwargs):
        return "This is a mock AI-generated cover letter."

    monkeypatch.setattr(
        "app.services.ai_service.AIGeneratorClient.generate_cover_letter",
        mock_generate_cover_letter
    )

    def mock_rewrite_resume(*args, **kwargs):
        return "This is a mock AI-generated resume."

    monkeypatch.setattr(
        "app.services.ai_service.AIGeneratorClient.rewrite_resume",
        mock_rewrite_resume
    )

@pytest.fixture(autouse=True)
def mock_redis(monkeypatch):
    """Replace redis client with a fake one."""
    import fakeredis
    from app.core import security

    fake_redis_client = fakeredis.FakeRedis()
    monkeypatch.setattr(security.token_blacklist, "redis", fake_redis_client)
    yield fake_redis_client
    fake_redis_client.flushall()
