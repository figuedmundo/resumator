from fastapi.testclient import TestClient

def test_unauthorized_access_to_protected_endpoint(client: TestClient):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 403

def test_sql_injection_on_login(client: TestClient):
    # Attempt to log in with a malicious username
    malicious_data = {
        "email": "' OR 1=1 --",
        "password": "password"
    }
    response = client.post("/api/v1/auth/login", json=malicious_data)
    assert response.status_code == 422

def test_xss_prevention_on_create_resume(client: TestClient, auth_headers: dict):
    # Attempt to create a resume with a malicious title
    malicious_data = {
        "title": "<script>alert('XSS')</script>",
        "markdown": "This is the content of my first resume.",
    }
    response = client.post("/api/v1/resumes", headers=auth_headers, json=malicious_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "<script>alert('XSS')</script>"


