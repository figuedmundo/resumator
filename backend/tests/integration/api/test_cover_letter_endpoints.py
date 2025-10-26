from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.cover_letter import CoverLetter

def test_create_cover_letter_with_valid_data(client: TestClient, auth_headers: dict, db: Session):
    # Create a cover letter
    cover_letter_data = {
        "title": "My First Cover Letter",
        "content": "This is the content of my first cover letter.",
    }
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)
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

def test_get_cover_letters_for_user(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume to associate the cover letter with
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume_id = response.json()["id"]

    # Create a cover letter
    cover_letter_data = {
        "title": "My First Cover Letter",
        "resume_id": resume_id,
        "content": "This is the content of my first cover letter.",
    }
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)
    assert response.status_code == 201

    # Get the list of cover letters
    response = client.get("/api/v1/cover-letters", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == cover_letter_data["title"]

def test_get_cover_letter_by_id(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume to associate the cover letter with
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume_id = response.json()["id"]

    # Create a cover letter
    cover_letter_data = {
        "title": "My First Cover Letter",
        "resume_id": resume_id,
        "content": "This is the content of my first cover letter.",
    }
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)
    assert response.status_code == 201
    cover_letter_id = response.json()["id"]

    # Get the cover letter by ID
    response = client.get(f"/api/v1/cover-letters/{cover_letter_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == cover_letter_data["title"]

def test_update_cover_letter(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume to associate the cover letter with
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume_id = response.json()["id"]

    # Create a cover letter
    cover_letter_data = {
        "title": "My First Cover Letter",
        "resume_id": resume_id,
        "content": "This is the content of my first cover letter.",
    }
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)
    assert response.status_code == 201
    cover_letter_id = response.json()["id"]

    # Update the cover letter
    update_data = {
        "title": "My Updated Cover Letter",
    }
    response = client.put(f"/api/v1/cover-letters/{cover_letter_id}", headers=auth_headers, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]

    # Check the database
    cover_letter = db.query(CoverLetter).filter(CoverLetter.id == cover_letter_id).first()
    assert cover_letter.title == update_data["title"]

def test_delete_cover_letter(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume to associate the cover letter with
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume_id = response.json()["id"]

    # Create a cover letter
    cover_letter_data = {
        "title": "My First Cover Letter",
        "resume_id": resume_id,
        "content": "This is the content of my first cover letter.",
    }
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)
    assert response.status_code == 201
    cover_letter_id = response.json()["id"]

    # Delete the cover letter
    response = client.delete(f"/api/v1/cover-letters/{cover_letter_id}", headers=auth_headers)
    assert response.status_code == 204

    # Check the database
    cover_letter = db.query(CoverLetter).filter(CoverLetter.id == cover_letter_id).first()
    assert cover_letter is None

def test_get_cover_letter_not_found(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/cover-letters/999", headers=auth_headers)
    assert response.status_code == 404

def test_get_cover_letter_not_authorized(client: TestClient, db: Session, sample_user_data):
    # Create a user and a cover letter
    user_one_response = client.post("/api/v1/auth/register", json=sample_user_data)
    user_one_headers = {"Authorization": f"Bearer {user_one_response.json()['access_token']}"}
    resume_data = {
        "title": "User One's Resume",
        "markdown": "This is a resume.",
    }
    resume_response = client.post("/api/v1/resumes", headers=user_one_headers, json=resume_data)
    resume_id = resume_response.json()["id"]

    cover_letter_data = {
        "title": "User One's Cover Letter",
        "resume_id": resume_id,
        "content": "This is a cover letter.",
    }
    cover_letter_response = client.post("/api/v1/cover-letters", headers=user_one_headers, json=cover_letter_data)
    cover_letter_id = cover_letter_response.json()["id"]

    # Create a second user
    other_user_data = {
        "email": "other@example.com",
        "password": "password",
        "username": "otheruser"
    }
    user_two_response = client.post("/api/v1/auth/register", json=other_user_data)
    user_two_headers = {"Authorization": f"Bearer {user_two_response.json()['access_token']}"}

    # Try to get user one's cover letter as user two
    response = client.get(f"/api/v1/cover-letters/{cover_letter_id}", headers=user_two_headers)
    assert response.status_code == 404

def test_update_cover_letter_not_found(client: TestClient, auth_headers: dict):
    update_data = {
        "title": "My Updated Cover Letter",
    }
    response = client.put("/api/v1/cover-letters/999", headers=auth_headers, json=update_data)
    assert response.status_code == 404

def test_update_cover_letter_not_authorized(client: TestClient, db: Session, sample_user_data):
    # Create a user and a cover letter
    user_one_response = client.post("/api/v1/auth/register", json=sample_user_data)
    user_one_headers = {"Authorization": f"Bearer {user_one_response.json()['access_token']}"}
    resume_data = {
        "title": "User One's Resume",
        "markdown": "This is a resume.",
    }
    resume_response = client.post("/api/v1/resumes", headers=user_one_headers, json=resume_data)
    resume_id = resume_response.json()["id"]

    cover_letter_data = {
        "title": "User One's Cover Letter",
        "resume_id": resume_id,
        "content": "This is a cover letter.",
    }
    cover_letter_response = client.post("/api/v1/cover-letters", headers=user_one_headers, json=cover_letter_data)
    cover_letter_id = cover_letter_response.json()["id"]

    # Create a second user
    other_user_data = {
        "email": "other@example.com",
        "password": "password",
        "username": "otheruser"
    }
    user_two_response = client.post("/api/v1/auth/register", json=other_user_data)
    user_two_headers = {"Authorization": f"Bearer {user_two_response.json()['access_token']}"}

    # Try to update user one's cover letter as user two
    update_data = {
        "title": "My Updated Cover Letter",
    }
    response = client.put(f"/api/v1/cover-letters/{cover_letter_id}", headers=user_two_headers, json=update_data)
    assert response.status_code == 404

def test_delete_cover_letter_not_found(client: TestClient, auth_headers: dict):
    response = client.delete("/api/v1/cover-letters/999", headers=auth_headers)
    assert response.status_code == 404


def test_generate_cover_letter_with_valid_data(client: TestClient, auth_headers: dict, db: Session, mock_ai_service):
    # Create a resume
    resume_data = {
        "title": "Software Engineer Resume",
        "markdown": "## Experience\n\n- Senior Developer",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume_id = response.json()["id"]

    # Generate a cover letter
    generate_data = {
        "resume_id": resume_id,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }
    response = client.post("/api/v1/cover-letters/generate", headers=auth_headers, json=generate_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == generate_data["title"]
    assert len(data["versions"]) == 1
    assert data["versions"][0]["markdown_content"] == "This is a mock AI-generated cover letter."

    # Check the database
    cover_letter = db.query(CoverLetter).filter(CoverLetter.id == data["id"]).first()
    assert cover_letter is not None
    assert cover_letter.title == generate_data["title"]


def test_generate_cover_letter_no_resume(client: TestClient, auth_headers: dict, mock_ai_service):
    generate_data = {
        "resume_id": 999,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }
    response = client.post("/api/v1/cover-letters/generate", headers=auth_headers, json=generate_data)
    assert response.status_code == 404


def test_preview_generate_cover_letter_with_valid_data(client: TestClient, auth_headers: dict, db: Session, mock_ai_service):
    # Create a resume
    resume_data = {
        "title": "Software Engineer Resume",
        "markdown": "## Experience\n\n- Senior Developer",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume_id = response.json()["id"]

    # Generate a cover letter preview
    generate_data = {
        "resume_id": resume_id,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }
    response = client.post("/api/v1/cover-letters/preview-generate", headers=auth_headers, json=generate_data)
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "This is a mock AI-generated cover letter."


def test_preview_generate_cover_letter_no_resume(client: TestClient, auth_headers: dict, mock_ai_service):
    generate_data = {
        "resume_id": 999,
        "job_description": "A job description",
        "company": "A company",
        "position": "A position",
        "title": "My Generated Cover Letter"
    }
    response = client.post("/api/v1/cover-letters/preview-generate", headers=auth_headers, json=generate_data)
    assert response.status_code == 404




def test_download_cover_letter_version_as_pdf(client: TestClient, auth_headers: dict, db: Session):
    # Create a cover letter
    cover_letter_data = {
        "title": "My First Cover Letter",
        "content": "This is the content of my first cover letter.",
    }
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)
    assert response.status_code == 201
    cover_letter = response.json()
    cover_letter_id = cover_letter["id"]
    version_id = cover_letter["versions"][0]["id"]

    # Download the cover letter version as a PDF
    response = client.get(f"/api/v1/cover-letters/{cover_letter_id}/versions/{version_id}/download", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["content-disposition"].startswith("attachment; filename=")
    assert response.content == b"mock pdf content"
