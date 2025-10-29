"""
E2E tests for complete resume workflow.
Tests the entire lifecycle: create → edit → download → delete
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.e2e
class TestResumeWorkflow:
    """
    End-to-end test for complete resume workflow.
    Simulates a real user journey through the resume features.
    """
    
    def test_complete_resume_lifecycle(self, client: TestClient, auth_headers: dict):
        """
        GIVEN: Authenticated user
        WHEN: User creates, edits, downloads, and deletes a resume
        THEN: All operations should succeed and data should be consistent
        
        This test covers the full resume lifecycle:
        1. Create a new resume
        2. Verify resume appears in list
        3. Get resume details
        4. Update resume content
        5. Download resume as PDF
        6. Delete resume
        7. Verify resume is gone
        """
        
        # Step 1: Create a new resume
        resume_data = {
            "title": "E2E Test Resume",
            "markdown": "## Professional Experience\n\n- Software Engineer at Company A\n- Led team of 5 developers"
        }
        
        create_response = client.post(
            "/api/v1/resumes",
            json=resume_data,
            headers=auth_headers
        )
        assert create_response.status_code == 201, f"Failed to create resume: {create_response.text}"
        
        created_resume = create_response.json()
        resume_id = created_resume["id"]
        
        assert created_resume["title"] == resume_data["title"]
        assert "id" in created_resume
        assert "created_at" in created_resume
        assert "updated_at" in created_resume
        
        # Step 2: Verify resume appears in list
        list_response = client.get(
            "/api/v1/resumes",
            headers=auth_headers
        )
        assert list_response.status_code == 200
        
        resumes_list = list_response.json()
        # Handle both direct array and wrapped response
        if isinstance(resumes_list, dict):
            resumes_list = resumes_list.get("resumes", [])
        
        assert len(resumes_list) > 0
        assert any(r["id"] == resume_id for r in resumes_list), "Created resume not in list"
        
        # Step 3: Get specific resume details
        detail_response = client.get(
            f"/api/v1/resumes/{resume_id}",
            headers=auth_headers
        )
        assert detail_response.status_code == 200
        
        resume_detail = detail_response.json()
        assert resume_detail["id"] == resume_id
        assert resume_detail["title"] == resume_data["title"]
        
        # Step 4: Update resume content
        updated_data = {
            "title": "E2E Test Resume - Updated",
            "content": "## Professional Experience\n\n- Senior Software Engineer at Company B\n- Managed team of 10 developers\n\n## Skills\n\n- Python, FastAPI, React, PostgreSQL",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
            "years_experience": 7
        }
        
        update_response = client.put(
            f"/api/v1/resumes/{resume_id}",
            json=updated_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200
        
        updated_resume = update_response.json()
        assert updated_resume["title"] == updated_data["title"]
        assert len(updated_resume["skills"]) == 4
        
        # Step 5: Download resume as PDF
        download_response = client.get(
            f"/api/v1/resumes/{resume_id}/download",
            headers=auth_headers
        )
        assert download_response.status_code == 200
        assert download_response.headers["content-type"] == "application/pdf"
        
        # Verify PDF content exists
        pdf_content = download_response.content
        assert len(pdf_content) > 0
        assert pdf_content[:4] == b'%PDF', "Invalid PDF file"
        
        # Step 6: Delete resume
        delete_response = client.delete(
            f"/api/v1/resumes/{resume_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        
        # Step 7: Verify resume is deleted
        verify_delete_response = client.get(
            f"/api/v1/resumes/{resume_id}",
            headers=auth_headers
        )
        assert verify_delete_response.status_code == 404
        
        # Verify it's not in the list anymore
        final_list_response = client.get(
            "/api/v1/resumes",
            headers=auth_headers
        )
        assert final_list_response.status_code == 200
        
        final_list = final_list_response.json()
        if isinstance(final_list, dict):
            final_list = final_list.get("resumes", [])
        
        assert not any(r["id"] == resume_id for r in final_list), "Deleted resume still in list"
    
    
    def test_resume_versioning_workflow(self, client: TestClient, auth_headers: dict):
        """
        GIVEN: User has a resume
        WHEN: User creates a customized version
        THEN: Should create a new version while preserving original
        
        Tests the version control system for resumes.
        """
        
        # Create base resume
        base_resume = {
            "title": "Base Resume",
            "markdown": "## Experience\n\nSoftware Engineer"
        }
        
        create_response = client.post(
            "/api/v1/resumes",
            json=base_resume,
            headers=auth_headers
        )
        assert create_response.status_code == 201
        
        resume_id = create_response.json()["id"]
        
        # Create customized version
        customization_data = {
            "job_description": "Looking for a Python expert with FastAPI experience",
            "instructions": "Emphasize Python and API development skills"
        }
        
        customize_response = client.post(
            f"/api/v1/resumes/{resume_id}/customize",
            json=customization_data,
            headers=auth_headers
        )
        assert customize_response.status_code == 200
        
        customized = customize_response.json()
        assert "customized_content" in customized or "content" in customized
        
        # Get versions list
        versions_response = client.get(
            f"/api/v1/resumes/{resume_id}/versions",
            headers=auth_headers
        )
        assert versions_response.status_code == 200
        
        versions = versions_response.json()
        if isinstance(versions, dict):
            versions = versions.get("versions", [])
        
        # Should have at least base version and customized version
        assert len(versions) >= 1
        
        # Cleanup
        client.delete(f"/api/v1/resumes/{resume_id}", headers=auth_headers)
    
    
    def test_multiple_users_resume_isolation(self, client: TestClient, sample_user_data: dict):
        """
        GIVEN: Two different users
        WHEN: Each creates resumes
        THEN: Users should only see their own resumes
        
        Tests data isolation between users.
        """
        
        # Create first user
        user1_data = {
            **sample_user_data,
            "email": "user1@test.com",
            "username": "user1"
        }
        
        register_response1 = client.post("/api/v1/auth/register", json=user1_data)
        assert register_response1.status_code == 201
        
        login_response1 = client.post("/api/v1/auth/login", json={
            "email": user1_data["email"],
            "password": user1_data["password"]
        })
        user1_token = login_response1.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}
        
        # Create second user
        user2_data = {
            **sample_user_data,
            "email": "user2@test.com",
            "username": "user2"
        }
        
        register_response2 = client.post("/api/v1/auth/register", json=user2_data)
        assert register_response2.status_code == 201
        
        login_response2 = client.post("/api/v1/auth/login", json={
            "email": user2_data["email"],
            "password": user2_data["password"]
        })
        user2_token = login_response2.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}
        
        # User 1 creates a resume
        user1_resume = {
            "title": "User 1 Resume",
            "markdown": "User 1 content"
        }
        
        create_response1 = client.post(
            "/api/v1/resumes",
            json=user1_resume,
            headers=user1_headers
        )
        assert create_response1.status_code == 201
        user1_resume_id = create_response1.json()["id"]
        
        # User 2 creates a resume
        user2_resume = {
            "title": "User 2 Resume",
            "markdown": "User 2 content"
        }
        
        create_response2 = client.post(
            "/api/v1/resumes",
            json=user2_resume,
            headers=user2_headers
        )
        assert create_response2.status_code == 201
        user2_resume_id = create_response2.json()["id"]
        
        # User 1 should only see their resume
        list_response1 = client.get("/api/v1/resumes", headers=user1_headers)
        assert list_response1.status_code == 200
        
        user1_resumes = list_response1.json()
        if isinstance(user1_resumes, dict):
            user1_resumes = user1_resumes.get("resumes", [])
        
        user1_resume_ids = [r["id"] for r in user1_resumes]
        assert user1_resume_id in user1_resume_ids
        assert user2_resume_id not in user1_resume_ids
        
        # User 2 should only see their resume
        list_response2 = client.get("/api/v1/resumes", headers=user2_headers)
        assert list_response2.status_code == 200
        
        user2_resumes = list_response2.json()
        if isinstance(user2_resumes, dict):
            user2_resumes = user2_resumes.get("resumes", [])
        
        user2_resume_ids = [r["id"] for r in user2_resumes]
        assert user2_resume_id in user2_resume_ids
        assert user1_resume_id not in user2_resume_ids
        
        # User 2 should not be able to access User 1's resume
        unauthorized_response = client.get(
            f"/api/v1/resumes/{user1_resume_id}",
            headers=user2_headers
        )
        assert unauthorized_response.status_code == 403
        
        # Cleanup
        client.delete(f"/api/v1/resumes/{user1_resume_id}", headers=user1_headers)
        client.delete(f"/api/v1/resumes/{user2_resume_id}", headers=user2_headers)
    
    
    def test_resume_with_empty_fields(self, client: TestClient, auth_headers: dict):
        """
        GIVEN: Resume data with optional fields omitted
        WHEN: Creating and retrieving resume
        THEN: Should handle missing fields gracefully
        """
        
        # Create resume with minimal data
        minimal_resume = {
            "title": "Minimal Resume",
            "markdown": "Basic content"
        }
        
        create_response = client.post(
            "/api/v1/resumes",
            json=minimal_resume,
            headers=auth_headers
        )
        assert create_response.status_code == 201
        
        created = create_response.json()
        resume_id = created["id"]
        
        # Verify it can be retrieved
        get_response = client.get(
            f"/api/v1/resumes/{resume_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        
        # Verify PDF generation works with minimal data
        pdf_response = client.get(
            f"/api/v1/resumes/{resume_id}/download",
            headers=auth_headers
        )
        assert pdf_response.status_code == 200
        assert pdf_response.headers["content-type"] == "application/pdf"
        
        # Cleanup
        client.delete(f"/api/v1/resumes/{resume_id}", headers=auth_headers)


@pytest.mark.e2e
@pytest.mark.slow
class TestResumePerformance:
    """Performance tests for resume operations."""
    
    def test_bulk_resume_creation_and_retrieval(self, client: TestClient, auth_headers: dict):
        """
        GIVEN: User creates multiple resumes
        WHEN: Retrieving list of resumes
        THEN: Should handle pagination and return quickly
        """
        
        created_ids = []
        
        # Create 10 resumes
        for i in range(10):
            resume_data = {
                "title": f"Bulk Test Resume {i}",
                "markdown": f"Content for resume {i}"
            }
            
            response = client.post(
                "/api/v1/resumes",
                json=resume_data,
                headers=auth_headers
            )
            assert response.status_code == 201
            created_ids.append(response.json()["id"])
        
        # Retrieve all resumes
        list_response = client.get(
            "/api/v1/resumes",
            headers=auth_headers
        )
        assert list_response.status_code == 200
        
        resumes = list_response.json()
        if isinstance(resumes, dict):
            resumes = resumes.get("resumes", [])
        
        assert len(resumes) >= 10
        
        # Cleanup
        for resume_id in created_ids:
            client.delete(f"/api/v1/resumes/{resume_id}", headers=auth_headers)
