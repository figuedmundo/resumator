import time
from fastapi.testclient import TestClient

def test_resume_list_performance(client: TestClient, auth_headers: dict):
    # Create 100 resumes
    for i in range(100):
        resume_data = {
            "title": f"Resume {i}",
            "markdown": f"This is resume {i}",
        }
        client.post("/api/v1/resumes", headers=auth_headers, json=resume_data)

    start_time = time.time()
    response = client.get("/api/v1/resumes", headers=auth_headers)
    end_time = time.time()

    assert response.status_code == 200
    assert end_time - start_time < 1.0  # Should be less than 1 second
