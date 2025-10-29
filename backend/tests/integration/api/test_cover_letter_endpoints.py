import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.cover_letter import CoverLetter
from tests.factories.cover_letter_factory import CoverLetterFactory
from tests.factories.user_factory import UserFactory

from tests.factories.resume_factory import ResumeFactory

# Mark all tests in this module as integration tests
pytestmark = pytest.mark.integration

def test_create_cover_letter(client: TestClient, auth_headers: dict, db: Session):
    """
    GIVEN: Valid cover letter data
    WHEN:  POST /api/v1/cover-letters is called
    THEN:  A new cover letter should be created and returned with a 201 status code
    """
    # Arrange
    cover_letter_data = {
        "title": "My First Cover Letter",
        "content": "This is the content of my first cover letter.",
    }

    # Act
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == cover_letter_data["title"]
    assert "versions" in data
    assert len(data["versions"]) == 1
    assert data["versions"][0]["markdown_content"] == cover_letter_data["content"]

    # Check that the cover letter was created in the database
    cover_letter = db.query(CoverLetter).filter(CoverLetter.id == data["id"]).first()
    assert cover_letter is not None
    assert cover_letter.title == cover_letter_data["title"]

def test_get_all_cover_letters(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user with multiple cover letters
    WHEN:  GET /api/v1/cover-letters is called
    THEN:  A list of all cover letters for that user should be returned
    """
    # Arrange
    CoverLetterFactory.create_batch(3, user_id=authenticated_user["user_id"])

    # Act
    response = client.get("/api/v1/cover-letters", headers=authenticated_user["headers"])

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

def test_get_cover_letter_by_id(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user and a cover letter ID
    WHEN:  GET /api/v1/cover-letters/{cover_letter_id} is called
    THEN:  The cover letter with that ID should be returned
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"])

    # Act
    response = client.get(f"/api/v1/cover-letters/{cover_letter.id}", headers=authenticated_user["headers"])

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == cover_letter.title

def test_update_cover_letter(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user, a cover letter ID, and new data
    WHEN:  PUT /api/v1/cover-letters/{cover_letter_id} is called
    THEN:  The cover letter should be updated and returned
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"])
    update_data = {"title": "My Updated Cover Letter"}

    # Act
    response = client.put(f"/api/v1/cover-letters/{cover_letter.id}", headers=authenticated_user["headers"], json=update_data)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]

    # Check the database
    session.refresh(cover_letter)
    assert cover_letter.title == update_data["title"]

def test_delete_cover_letter(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user and a cover letter ID
    WHEN:  DELETE /api/v1/cover-letters/{cover_letter_id} is called
    THEN:  The cover letter should be deleted
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"])

    # Act
    response = client.delete(f"/api/v1/cover-letters/{cover_letter.id}", headers=authenticated_user["headers"])

    # Assert
    assert response.status_code == 204

    # Check the database
    deleted_cover_letter = session.query(CoverLetter).filter(CoverLetter.id == cover_letter.id).first()
    assert deleted_cover_letter is None

def test_get_cover_letter_not_found(client: TestClient, auth_headers: dict):
    """
    GIVEN: An authenticated user and a non-existent cover letter ID
    WHEN:  GET /api/v1/cover-letters/{cover_letter_id} is called
    THEN:  A 404 Not Found error should be returned
    """
    response = client.get("/api/v1/cover-letters/999", headers=auth_headers)
    assert response.status_code == 404

def test_get_cover_letter_unauthorized(client: TestClient, session: Session):
    """
    GIVEN: Two authenticated users, one with a cover letter
    WHEN:  The second user tries to get the first user's cover letter
    THEN:  A 404 Not Found error should be returned
    """
    # Arrange
    user_one = UserFactory()
    cover_letter = CoverLetterFactory(user_id=user_one.id)
    user_two = UserFactory()
    login_data = {"email": user_two.email, "password": "password"}
    response = client.post("/api/v1/auth/login", json=login_data)
    user_two_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}


    # Act
    response = client.get(f"/api/v1/cover-letters/{cover_letter.id}", headers=user_two_headers)

    # Assert
    assert response.status_code == 404

def test_update_cover_letter_not_found(client: TestClient, auth_headers: dict):
    """
    GIVEN: An authenticated user, a non-existent cover letter ID, and new data
    WHEN:  PUT /api/v1/cover-letters/{cover_letter_id} is called
    THEN:  A 404 Not Found error should be returned
    """
    update_data = {"title": "My Updated Cover Letter"}
    response = client.put("/api/v1/cover-letters/999", headers=auth_headers, json=update_data)
    assert response.status_code == 404

def test_update_cover_letter_unauthorized(client: TestClient, session: Session):
    """
    GIVEN: Two authenticated users, one with a cover letter
    WHEN:  The second user tries to update the first user's cover letter
    THEN:  A 404 Not Found error should be returned
    """
    # Arrange
    user_one = UserFactory()
    cover_letter = CoverLetterFactory(user_id=user_one.id)
    user_two = UserFactory()
    login_data = {"email": user_two.email, "password": "password"}
    response = client.post("/api/v1/auth/login", json=login_data)
    user_two_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
    update_data = {"title": "My Updated Cover Letter"}

    # Act
    response = client.put(f"/api/v1/cover-letters/{cover_letter.id}", headers=user_two_headers, json=update_data)

    # Assert
    assert response.status_code == 404
def test_delete_cover_letter_not_found(client: TestClient, auth_headers: dict):
    """
    GIVEN: An authenticated user and a non-existent cover letter ID
    WHEN:  DELETE /api/v1/cover-letters/{cover_letter_id} is called
    THEN:  A 404 Not Found error should be returned
    """
    response = client.delete("/api/v1/cover-letters/999", headers=auth_headers)
    assert response.status_code == 404
def test_delete_cover_letter_unauthorized(client: TestClient, session: Session):
    """
    GIVEN: Two authenticated users, one with a cover letter
    WHEN:  The second user tries to delete the first user's cover letter
    THEN:  A 404 Not Found error should be returned
    """
    # Arrange
    user_one = UserFactory()
    cover_letter = CoverLetterFactory(user_id=user_one.id)
    user_two = UserFactory()
    login_data = {"email": user_two.email, "password": "password"}
    response = client.post("/api/v1/auth/login", json=login_data)
    user_two_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}

    # Act
    response = client.delete(f"/api/v1/cover-letters/{cover_letter.id}", headers=user_two_headers)

    # Assert
    assert response.status_code == 404    
    
def test_generate_cover_letter(client: TestClient, authenticated_user: dict, session: Session, mock_ai_service):
    """
    GIVEN: An authenticated user, a resume, and a job description
    WHEN:  POST /api/v1/cover-letters/generate is called
    THEN:  A new cover letter should be generated and returned
    """
    # Arrange
    resume = ResumeFactory(user_id=authenticated_user["user_id"])
    generate_data = {
        "resume_id": resume.id,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }

    # Act
    response = client.post("/api/v1/cover-letters/generate", headers=authenticated_user["headers"], json=generate_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == generate_data["title"]
    assert len(data["versions"]) == 1
    assert data["versions"][0]["markdown_content"] == "This is a mock AI-generated cover letter."

    # Check the database
    cover_letter = session.query(CoverLetter).filter(CoverLetter.id == data["id"]).first()
    assert cover_letter is not None
    assert cover_letter.title == generate_data["title"]
def test_generate_cover_letter_not_found(client: TestClient, auth_headers: dict, mock_ai_service):
    """
    GIVEN: An authenticated user and a non-existent resume ID
    WHEN:  POST /api/v1/cover-letters/generate is called
    THEN:  A 404 Not Found error should be returned
    """
    # Arrange
    generate_data = {
        "resume_id": 999,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }

    # Act
    response = client.post("/api/v1/cover-letters/generate", headers=auth_headers, json=generate_data)

    # Assert
    assert response.status_code == 404
def test_preview_generate_cover_letter(client: TestClient, authenticated_user: dict, session: Session, mock_ai_service):
    """
    GIVEN: An authenticated user, a resume, and a job description
    WHEN:  POST /api/v1/cover-letters/preview-generate is called
    THEN:  A preview of the generated cover letter should be returned
    """
    # Arrange
    resume = ResumeFactory(user_id=authenticated_user["user_id"])
    generate_data = {
        "resume_id": resume.id,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }

    # Act
    response = client.post("/api/v1/cover-letters/preview-generate", headers=authenticated_user["headers"], json=generate_data)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "This is a mock AI-generated cover letter."
def test_preview_generate_cover_letter_not_found(client: TestClient, auth_headers: dict, mock_ai_service):
    """
    GIVEN: An authenticated user and a non-existent resume ID
    WHEN:  POST /api/v1/cover-letters/preview-generate is called
    THEN:  A 404 Not Found error should be returned
    """
    # Arrange
    generate_data = {
        "resume_id": 999,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }

    # Act
    response = client.post("/api/v1/cover-letters/preview-generate", headers=auth_headers, json=generate_data)

    # Assert
    assert response.status_code == 404
def test_get_cover_letter_versions(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user and a cover letter with multiple versions
    WHEN:  GET /api/v1/cover-letters/{cover_letter_id}/versions is called
    THEN:  A list of all versions for that cover letter should be returned
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"], versions=3)

    # Act
    response = client.get(f"/api/v1/cover-letters/{cover_letter.id}/versions", headers=authenticated_user["headers"])

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
def test_get_cover_letter_version_by_id(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user, a cover letter, and a version ID
    WHEN:  GET /api/v1/cover-letters/{cover_letter_id}/versions/{version_id} is called
    THEN:  The cover letter version with that ID should be returned
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"])
    version = cover_letter.versions[0]

    # Act
    response = client.get(f"/api/v1/cover-letters/{cover_letter.id}/versions/{version.id}", headers=authenticated_user["headers"])

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["markdown_content"] == version.markdown_content
def test_update_cover_letter_version(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user, a cover letter, a version ID, and new data
    WHEN:  PUT /api/v1/cover-letters/{cover_letter_id}/versions/{version_id} is called
    THEN:  The cover letter version should be updated and returned
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"])
    version = cover_letter.versions[0]
    update_data = {"markdown_content": "My Updated Content"}

    # Act
    response = client.put(f"/api/v1/cover-letters/{cover_letter.id}/versions/{version.id}", headers=authenticated_user["headers"], json=update_data)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["markdown_content"] == update_data["markdown_content"]

    # Check the database
    session.refresh(version)
    assert version.markdown_content == update_data["markdown_content"]
def test_delete_cover_letter_version(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user, a cover letter, and a version ID
    WHEN:  DELETE /api/v1/cover-letters/{cover_letter_id}/versions/{version_id} is called
    THEN:  The cover letter version should be deleted
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"], versions=2)
    version_to_delete = cover_letter.versions[0]

    # Act
    response = client.delete(f"/api/v1/cover-letters/{cover_letter.id}/versions/{version_to_delete.id}", headers=authenticated_user["headers"])

    # Assert
    assert response.status_code == 204

    # Check the database
    deleted_version = session.query(CoverLetterVersion).filter(CoverLetterVersion.id == version_to_delete.id).first()
    assert deleted_version is None
    assert len(cover_letter.versions) == 1
def test_download_cover_letter_version_as_pdf(client: TestClient, authenticated_user: dict, session: Session):
    """
    GIVEN: An authenticated user, a cover letter, and a version ID
    WHEN:  GET /api/v1/cover-letters/{cover_letter_id}/versions/{version_id}/download is called
    THEN:  A PDF file should be returned
    """
    # Arrange
    cover_letter = CoverLetterFactory(user_id=authenticated_user["user_id"])
    version = cover_letter.versions[0]

    # Act
    response = client.get(f"/api/v1/cover-letters/{cover_letter.id}/versions/{version.id}/download", headers=authenticated_user["headers"])

    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["content-disposition"].startswith("attachment; filename=")
    assert response.content == b"mock pdf content"