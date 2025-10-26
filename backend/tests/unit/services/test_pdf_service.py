import pytest
from unittest.mock import MagicMock, patch
from app.services.pdf_service import PDFService

@pytest.fixture
def weasyprint_renderer_mock():
    with patch('app.services.pdf_service.WeasyPrintRenderer') as mock_renderer:
        mock_instance = MagicMock()
        mock_renderer.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def storage_service_mock():
    return MagicMock()

def test_generate_resume_pdf(weasyprint_renderer_mock, storage_service_mock):
    # Arrange
    service = PDFService(storage_service=storage_service_mock)
    markdown_content = "## Test"
    
    weasyprint_renderer_mock.render_from_markdown.return_value = b"resume_pdf_content"

    # Act
    result = service.generate_resume_pdf(markdown_content)

    # Assert
    weasyprint_renderer_mock.render_from_markdown.assert_called_once_with(markdown_content, "modern")
    assert result == b"resume_pdf_content"

def test_generate_cover_letter_pdf(weasyprint_renderer_mock, storage_service_mock):
    # Arrange
    service = PDFService(storage_service=storage_service_mock)
    content = "Test content"
    company = "Test Company"
    position = "Test Position"
    
    weasyprint_renderer_mock.render_from_html.return_value = b"cover_letter_pdf_content"

    # Act
    result = service.generate_cover_letter_pdf(content, company, position)

    # Assert
    weasyprint_renderer_mock.render_from_html.assert_called_once()
    assert result == b"cover_letter_pdf_content"
