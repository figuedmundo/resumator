import pytest
from datetime import timedelta
from app.core.security import AuthService
from app.config.settings import settings

def test_hash_and_verify_password():
    password = "secure_password"
    hashed_password = AuthService.hash_password(password)
    assert hashed_password != password
    assert AuthService.verify_password(password, hashed_password)
    assert not AuthService.verify_password("wrong_password", hashed_password)

def test_create_and_verify_access_token():
    data = {"sub": "123", "username": "testuser"}
    token = AuthService.create_access_token(data)
    payload = AuthService.verify_token(token)
    assert payload is not None
    assert payload["sub"] == "123"
    assert payload["username"] == "testuser"
    assert payload["type"] == "access"

def test_token_expiry():
    data = {"sub": "123"}
    # Create a token that expired 1 second ago
    expires_delta = timedelta(seconds=-1)
    token = AuthService.create_access_token(data, expires_delta=expires_delta)
    payload = AuthService.verify_token(token)
    assert payload is None

def test_create_and_verify_refresh_token():
    data = {"sub": "123", "username": "testuser"}
    token, _ = AuthService.create_refresh_token(data)
    payload = AuthService.verify_token(token, token_type="refresh")
    assert payload is not None
    assert payload["sub"] == "123"
    assert payload["username"] == "testuser"
    assert payload["type"] == "refresh"
    assert "jti" in payload

def test_revoke_token():
    data = {"sub": "123"}
    token = AuthService.create_access_token(data)
    
    # First, verify the token is valid
    payload = AuthService.verify_token(token)
    assert payload is not None

    # Now, revoke the token
    AuthService.revoke_token(token)

    # Finally, verify the token is no longer valid
    payload = AuthService.verify_token(token)
    assert payload is None