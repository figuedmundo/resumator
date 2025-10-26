from fastapi.testclient import TestClient

def test_not_found_error(client: TestClient):
    response = client.get("/api/v1/non-existent-endpoint")
    assert response.status_code == 404

# def test_internal_server_error(client: TestClient, auth_headers: dict, monkeypatch):
#     def mock_get_user_by_id(user_id: int):
#         raise Exception("Database error")
#
#     monkeypatch.setattr("app.services.user_service.UserService.get_user_by_id", mock_get_user_by_id)
#
#     response = client.get("/api/v1/users/me", headers=auth_headers)
#     assert response.status_code == 500

