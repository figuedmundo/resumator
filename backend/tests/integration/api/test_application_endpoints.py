from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.application import Application

def test_create_application_with_valid_data(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume to associate the application with
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    # Create an application
    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    response = client.post("/api/v1/applications", headers=auth_headers, json=application_data)
    assert response.status_code == 201
    data = response.json()
    assert data["company"] == application_data["company"]

    # Check that the application was created in the database
    application = db.query(Application).filter(Application.id == data["id"]).first()
    assert application is not None
    

def test_get_applications_for_user(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume and an application
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    response = client.post("/api/v1/applications", headers=auth_headers, json=application_data)
    assert response.status_code == 201

    # Get the list of applications
    response = client.get("/api/v1/applications", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["applications"][0]["company"] == application_data["company"]


def test_get_application_by_id(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume and an application
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    response = client.post("/api/v1/applications", headers=auth_headers, json=application_data)
    assert response.status_code == 201
    application_id = response.json()["id"]

    # Get the application by ID
    response = client.get(f"/api/v1/applications/{application_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["company"] == application_data["company"]


def test_update_application(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume and an application
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    response = client.post("/api/v1/applications", headers=auth_headers, json=application_data)
    assert response.status_code == 201
    application_id = response.json()["id"]

    # Update the application
    update_data = {
        "company": "Updated Company",
        "notes": "These are my updated notes.",
    }
    response = client.put(f"/api/v1/applications/{application_id}", headers=auth_headers, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["company"] == update_data["company"]
    assert data["notes"] == update_data["notes"]

    # Check the database
    application = db.query(Application).filter(Application.id == application_id).first()
    assert application.company == update_data["company"]
    assert application.notes == update_data["notes"]


def test_delete_application(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume and an application
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    response = client.post("/api/v1/applications", headers=auth_headers, json=application_data)
    assert response.status_code == 201
    application_id = response.json()["id"]

    # Delete the application
    response = client.delete(f"/api/v1/applications/{application_id}", headers=auth_headers)
    assert response.status_code == 200 # Should be 200 as it returns a body

    # Check the database
    application = db.query(Application).filter(Application.id == application_id).first()
    assert application is None


def test_get_application_not_found(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/applications/999", headers=auth_headers)
    assert response.status_code == 404


def test_get_application_not_authorized(client: TestClient, db: Session, sample_user_data):
    # Create a user and an application
    user_one_response = client.post("/api/v1/auth/register", json=sample_user_data)
    user_one_headers = {"Authorization": f"Bearer {user_one_response.json()['access_token']}"}
    resume_data = {
        "title": "User One's Resume",
        "markdown": "This is a resume.",
    }
    resume_response = client.post("/api/v1/resumes", headers=user_one_headers, json=resume_data)
    resume = resume_response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "User One's Company",
        "position": "User One's Position",
        "status": "Applied",
    }
    application_response = client.post("/api/v1/applications", headers=user_one_headers, json=application_data)
    application_id = application_response.json()["id"]

    # Create a second user
    other_user_data = {
        "email": "other@example.com",
        "password": "password",
        "username": "otheruser"
    }
    user_two_response = client.post("/api/v1/auth/register", json=other_user_data)
    user_two_headers = {"Authorization": f"Bearer {user_two_response.json()['access_token']}"}

    # Try to get user one's application as user two
    response = client.get(f"/api/v1/applications/{application_id}", headers=user_two_headers)
    assert response.status_code == 404


def test_get_application_stats(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume and an application
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    client.post("/api/v1/applications", headers=auth_headers, json=application_data)

    # Get stats
    response = client.get("/api/v1/applications/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["applied"] == 1


def test_get_status_options(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/applications/status/options", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "statuses" in data
    assert len(data["statuses"]) > 0


def test_update_application_status(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume and an application
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    response = client.post("/api/v1/applications", headers=auth_headers, json=application_data)
    assert response.status_code == 201
    application_id = response.json()["id"]

    # Update status
    status_update = {"status": "Interviewing"}
    response = client.patch(f"/api/v1/applications/{application_id}/status", headers=auth_headers, json=status_update)
    assert response.status_code == 200

    # Check the database
    application = db.query(Application).filter(Application.id == application_id).first()
    assert application.status == "Interviewing"

def test_get_applications_for_user_with_status_filter(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume and two applications with different statuses
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    application_data_1 = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company 1",
        "position": "Test Position 1",
        "status": "Applied",
    }
    client.post("/api/v1/applications", headers=auth_headers, json=application_data_1)

    application_data_2 = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "company": "Test Company 2",
        "position": "Test Position 2",
        "status": "Interviewing",
    }
    client.post("/api/v1/applications", headers=auth_headers, json=application_data_2)

    # Get the list of applications with status "Applied"
    response = client.get("/api/v1/applications?status=Applied", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["applications"][0]["company"] == application_data_1["company"]


def test_download_application_cover_letter_as_pdf(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume = response.json()
    resume_id = resume["id"]
    resume_version_id = resume["versions"][0]["id"]

    # Create a cover letter
    cover_letter_data = {
        "title": "My First Cover Letter",
        "content": "This is the content of my first cover letter.",
    }
    response = client.post("/api/v1/cover-letters", headers=auth_headers, json=cover_letter_data)
    assert response.status_code == 201
    cover_letter = response.json()
    cover_letter_id = cover_letter["id"]
    cover_letter_version_id = cover_letter["versions"][0]["id"]

    # Create an application
    application_data = {
        "resume_id": resume_id,
        "resume_version_id": resume_version_id,
        "cover_letter_id": cover_letter_id,
        "cover_letter_version_id": cover_letter_version_id,
        "company": "Test Company",
        "position": "Test Position",
        "status": "Applied",
    }
    response = client.post("/api/v1/applications", headers=auth_headers, json=application_data)
    assert response.status_code == 201
    application_id = response.json()["id"]

    # Download the cover letter as a PDF
    response = client.get(f"/api/v1/applications/{application_id}/cover-letter/download", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["content-disposition"].startswith("attachment; filename=")
    assert response.content == b"mock pdf content"