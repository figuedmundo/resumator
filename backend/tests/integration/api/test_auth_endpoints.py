from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
import pytest

def test_register_user(client: TestClient, db: Session, sample_user_data):
    response = client.post(
        "/api/v1/auth/register",
        json=sample_user_data,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == sample_user_data["email"]
    assert "access_token" in data

    user = db.query(User).filter(User.email == sample_user_data["email"]).first()
    assert user is not None

def test_login_user_wrong_credentials(client: TestClient, db: Session, sample_user_data):
    client.post(
        "/api/v1/auth/register",
        json=sample_user_data,
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": sample_user_data["email"], "password": "wrongpassword"},
    )
    assert response.status_code == 401

def test_refresh_token(client: TestClient, db: Session):
    # First, register and login a user to get a refresh token
    client.post("/api/v1/auth/register", json={"email": "test@example.com", "password": "password", "username": "testuser"})
    login_response = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "password"})
    refresh_token = login_response.json()["refresh_token"]

    # Now, use the refresh token to get a new access token
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_logout(client: TestClient, authenticated_user):
    # The 'authenticated_user' fixture gives us a logged-in user and headers
    headers = authenticated_user["headers"]

    # Call the logout endpoint
    response = client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == 204

    # Verify the token is no longer valid by accessing a protected route
    profile_response = client.get("/api/v1/users/me", headers=headers)
    assert profile_response.status_code == 401