from app.services.ai_service import AIGeneratorClient

def test_ai_service_generate_cover_letter(mock_ai_service):
    ai_client = AIGeneratorClient()
    response = ai_client.generate_cover_letter(
        template="",
        job_description="A job description",
        resume_summary="A resume summary",
        company="A company",
        position="A position",
    )
    assert response == "This is a mock AI-generated cover letter."

def test_ai_service_rewrite_resume(mock_ai_service):
    ai_client = AIGeneratorClient()
    response = ai_client.rewrite_resume(
        resume_summary="A resume summary",
        job_description="A job description",
        instructions=None,
    )
    assert response == "This is a mock AI-generated resume."

