from fastapi.testclient import TestClient


def test_root(client: TestClient):
    """
    Tests the root endpoint.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to Resumator API"

def test_docs(client: TestClient):
    """
    Tests if the docs are available in the test environment.
    """
    response = client.get("/docs")
    assert response.status_code == 200
