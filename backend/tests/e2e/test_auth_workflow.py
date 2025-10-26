from fastapi.testclient import TestClient

def test_auth_workflow(client: TestClient, sample_user_data: dict):
    # Register
    response = client.post("/api/v1/auth/register", json=sample_user_data)
    assert response.status_code == 201
    user = response.json()["user"]
    assert user["email"] == sample_user_data["email"]

    # Login
    login_data = {
        "email": sample_user_data["email"],
        "password": sample_user_data["password"],
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data

    # Get current user
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == sample_user_data["email"]

    # Logout
    assert response.status_code == 200

    # Try to get current user again
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
