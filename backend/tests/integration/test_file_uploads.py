from fastapi.testclient import TestClient

def test_upload_invalid_content_type(client: TestClient, auth_headers: dict):
    response = client.post(
        "/api/v1/resumes/upload",
        headers=auth_headers,
        files={"file": ("test.txt", b"some content", "text/plain")},
    )
    assert response.status_code == 422

def test_upload_file_too_large(client: TestClient, auth_headers: dict):
    # Create a large file
    large_content = b"a" * (1024 * 1024 * 11) # 11MB
    response = client.post(
        "/api/v1/resumes/upload",
        headers=auth_headers,
        files={"file": ("test.pdf", large_content, "application/pdf")},
    )
    assert response.status_code == 422

