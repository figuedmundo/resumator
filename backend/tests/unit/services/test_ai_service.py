import pytest
from unittest.mock import MagicMock, patch
from app.services.ai_service import AIGeneratorClient

@pytest.fixture
def groq_client_mock():
    with patch('app.services.ai_service.Groq') as mock_groq:
        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        yield mock_client

def test_rewrite_resume(groq_client_mock):
    # Arrange
    client = AIGeneratorClient()
    resume_markdown = "## Experience"
    job_description = "Software Engineer"
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "Rewritten resume"
    groq_client_mock.chat.completions.create.return_value = mock_response

    # Act
    result = client.rewrite_resume(resume_markdown, job_description)

    # Assert
    groq_client_mock.chat.completions.create.assert_called_once()
    assert result == "Rewritten resume"

def test_generate_cover_letter(groq_client_mock):
    # Arrange
    client = AIGeneratorClient()
    template = "Template"
    job_description = "Software Engineer"
    resume_summary = "Summary"
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "Generated cover letter"
    groq_client_mock.chat.completions.create.return_value = mock_response

    # Act
    result = client.generate_cover_letter(template, job_description, resume_summary)

    # Assert
    groq_client_mock.chat.completions.create.assert_called_once()
    assert result == "Generated cover letter"
