from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.resume import Resume

def test_create_resume_with_valid_data(client: TestClient, auth_headers: dict, db: Session):
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    if response.status_code != 201:
        assert False, response.json()
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == resume_data["title"]
    
    # Check that the resume was created in the database
    resume = db.query(Resume).filter(Resume.id == data["id"]).first()
    assert resume is not None
    assert resume.title == resume_data["title"]

def test_create_resume_with_invalid_data(client: TestClient, auth_headers: dict):
    resume_data = {
        "title": "My Second Resume",
        # Missing markdown
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 422

def test_get_resumes_for_user(client: TestClient, auth_headers: dict, db: Session, authenticated_user):
    # Create a resume for the user
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)

    response = client.get("/api/v1/resumes", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == resume_data["title"]

def test_get_empty_resumes_for_user(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/resumes", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

def test_get_resume_by_id(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume for the user
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    resume_id = response.json()["id"]

    response = client.get(f"/api/v1/resumes/{resume_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == resume_data["title"]

def test_get_resume_not_found(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/resumes/999", headers=auth_headers)
    assert response.status_code == 404

def test_get_resume_not_authorized(client: TestClient, db: Session, sample_user_data):
    # Create a user and a resume
    user_one_response = client.post("/api/v1/auth/register", json=sample_user_data)
    user_one_headers = {"Authorization": f"Bearer {user_one_response.json()['access_token']}"}
    resume_data = {
        "title": "User One's Resume",
        "markdown": "This is a resume.",
    }
    resume_response = client.post("/api/v1/resumes", headers=user_one_headers, json=resume_data)
    resume_id = resume_response.json()["id"]

    # Create a second user
    other_user_data = {
        "email": "other@example.com",
        "password": "password",
        "username": "otheruser"
    }
    user_two_response = client.post("/api/v1/auth/register", json=other_user_data)
    user_two_headers = {"Authorization": f"Bearer {user_two_response.json()['access_token']}"}

    # Try to get user one's resume as user two
    response = client.get(f"/api/v1/resumes/{resume_id}", headers=user_two_headers)
    assert response.status_code == 404

def test_update_resume(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    resume_id = response.json()["id"]

    # Update the resume
    update_data = {
        "title": "My Updated Resume",
        "is_default": True,
    }
    response = client.put(f"/api/v1/resumes/{resume_id}", headers=auth_headers, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["is_default"] == update_data["is_default"]

    # Check the database
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    assert resume.title == update_data["title"]

def test_update_resume_not_found(client: TestClient, auth_headers: dict):
    update_data = {
        "title": "My Updated Resume",
    }
    response = client.put("/api/v1/resumes/999", headers=auth_headers, json=update_data)
    assert response.status_code == 404

def test_update_resume_invalid_data(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume
    resume_data = {
        "title": "My First Resume",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    resume_id = response.json()["id"]

    # Try to update with invalid data (e.g., title is not a string)
    update_data = {
        "title": 123,
    }
    response = client.put(f"/api/v1/resumes/{resume_id}", headers=auth_headers, json=update_data)
    assert response.status_code == 422

def test_delete_resume(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume
    resume_data = {
        "title": "Resume to Delete",
        "markdown": "Content.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    resume_id = response.json()["id"]

    # Delete the resume
    response = client.delete(f"/api/v1/resumes/{resume_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Resume deleted successfully"

    # Verify it's deleted from the database
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    assert resume is None

def test_delete_resume_not_found(client: TestClient, auth_headers: dict):
    response = client.delete("/api/v1/resumes/999", headers=auth_headers)
    assert response.status_code == 404

def test_delete_resume_not_authorized(client: TestClient, db: Session, sample_user_data):
    # Create a user and a resume
    user_one_response = client.post("/api/v1/auth/register", json=sample_user_data)
    user_one_headers = {"Authorization": f"Bearer {user_one_response.json()['access_token']}"}
    resume_data = {
        "title": "User One's Resume",
        "markdown": "This is a resume.",
    }
    resume_response = client.post("/api/v1/resumes", headers=user_one_headers, json=resume_data)
    resume_id = resume_response.json()["id"]

    # Create a second user
    other_user_data = {
        "email": "other@example.com",
        "password": "password",
        "username": "otheruser"
    }
    user_two_response = client.post("/api/v1/auth/register", json=other_user_data)
    user_two_headers = {"Authorization": f"Bearer {user_two_response.json()['access_token']}"}

    # Try to delete user one's resume as user two
    response = client.delete(f"/api/v1/resumes/{resume_id}", headers=user_two_headers)
    assert response.status_code == 404

def test_delete_resume_with_dependent_applications_fails_without_force(client: TestClient, auth_headers: dict, db: Session, authenticated_user):

    # Create a resume

    resume_data = {

        "title": "Resume with Apps",

        "markdown": "Content.",

    }

    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)

    resume_id = response.json()["id"]

    version_id = response.json()["versions"][0]["id"]



    # Create a dependent application

    from app.models.application import Application

    app_data = Application(

        user_id=authenticated_user["user"]["id"],

        resume_id=resume_id,

        resume_version_id=version_id,

        company="TestCo",

        position="Tester",

        status="Applied"

    )

    db.add(app_data)

    db.commit()



    # Try to delete the resume without force

    response = client.delete(f"/api/v1/resumes/{resume_id}", headers=auth_headers)

    assert response.status_code == 400

    assert "Cannot delete resume. It is referenced by 1 application(s)." in response.json()["detail"]





def test_delete_resume_with_dependent_applications_succeeds_with_force(client: TestClient, auth_headers: dict, db: Session, authenticated_user):
    # Create a resume
    resume_data = {
        "title": "Resume with Apps to Force Delete",
        "markdown": "Content.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    resume_id = response.json()["id"]
    version_id = response.json()["versions"][0]["id"]

    # Create a dependent application
    from app.models.application import Application
    app_data = Application(
        user_id=authenticated_user["user"]["id"],
        resume_id=resume_id,
        resume_version_id=version_id,
        company="TestCo",
        position="Tester",
        status="Applied"
    )
    db.add(app_data)
    db.commit()

    # Delete the resume with force
    response = client.delete(f"/api/v1/resumes/{resume_id}?force=true", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Deleted resume 'Resume with Apps to Force Delete', 1 application(s), and 1 version(s)."

    # Verify resume and application are deleted from the database
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    assert resume is None
    application = db.query(Application).filter(Application.resume_id == resume_id).first()
    assert application is None


def test_download_resume_pdf(client: TestClient, auth_headers: dict, db: Session):
    # Create a resume
    resume_data = {
        "title": "My Downloadable Resume",
        "markdown": "This is the content of my downloadable resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)
    assert response.status_code == 201
    resume_id = response.json()["id"]

    # Download the resume
    response = client.get(f"/api/v1/resumes/{resume_id}/download", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content == b"mock pdf content"