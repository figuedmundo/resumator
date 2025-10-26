"PDF rendering service for converting HTML content to PDF."

import os
import logging
from typing import Optional
from abc import ABC, abstractmethod
from datetime import datetime
import weasyprint
from app.core.exceptions import StorageError
from app.services.storage_service import StorageService, get_storage_service
from app.services.html_renderer_service import html_renderer

logger = logging.getLogger(__name__)


class PDFRenderer(ABC):
    """Abstract base class for PDF renderers."""

    @abstractmethod
    def render_from_markdown(self, markdown_content: str, template_id: str = "modern") -> bytes:
        """Return PDF bytes for given markdown and template."""
        pass

    @abstractmethod
    def render_from_html(self, html_content: str) -> bytes:
        """Return PDF bytes for given HTML string."""
        pass


class WeasyPrintRenderer(PDFRenderer):
    """WeasyPrint-based PDF renderer."""

    def render_from_markdown(self, markdown_content: str, template_id: str = "modern") -> bytes:
        """Render markdown to PDF using WeasyPrint."""
        html_content = html_renderer.render_markdown_to_html(markdown_content, template_id)
        return self.render_from_html(html_content)

    def render_from_html(self, html_content: str) -> bytes:
        """Render HTML to PDF using WeasyPrint."""
        try:
            return weasyprint.HTML(string=html_content).write_pdf()
        except Exception as e:
            logger.error(f"WeasyPrint PDF generation failed: {e}")
            raise StorageError(f"PDF generation failed: {str(e)}")


class PDFService:
    """Service for PDF operations."""

    def __init__(self, storage_service: Optional[StorageService] = None):
        """Initialize PDF service."""
        self.renderer = WeasyPrintRenderer()
        if storage_service:
            self.storage_service = storage_service
        else:
            self.storage_service = get_storage_service()

    def generate_resume_pdf(self, markdown_content: str, template_id: str = "modern") -> bytes:
        """Generate PDF from markdown resume."""
        return self.renderer.render_from_markdown(markdown_content, template_id)

    def generate_resume_html(self, markdown_content: str, template_id: str = "modern") -> str:
        """Generate HTML from markdown resume."""
        return html_renderer.render_markdown_to_html(markdown_content, template_id)

    def generate_cover_letter_pdf(self, content: str, company: str, position: str,
                                  title: Optional[str] = None) -> bytes:
        """Generate PDF from cover letter content."""
        try:
            html_content = self._generate_cover_letter_html(
                content=content,
                company=company,
                position=position,
                title=title
            )
            return self.renderer.render_from_html(html_content)
        except Exception as e:
            logger.error(f"Failed to generate cover letter PDF: {e}")
            raise StorageError(f"Cover letter PDF generation failed: {str(e)}")

    def _generate_cover_letter_html(self, content: str, company: str, position: str,
                                    title: Optional[str] = None) -> str:
        """Generate professional HTML for cover letter."""
        current_date = datetime.now().strftime("%B %d, %Y")
        doc_title = title or f"Cover Letter - {company} - {position}"

        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{doc_title}</title>
            <style>
                @page {{
                    size: A4;
                    margin: 0.75in;
                }}
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 850px;
                    margin: 0 auto;
                }}
                .header {{
                    margin-bottom: 30px;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 15px;
                }}
                .position-info {{
                    text-align: right;
                }}
                .position-info h3 {{
                    color: #2c3e50;
                    font-size: 18px;
                    margin-bottom: 3px;
                }}
                .position-info p {{
                    color: #7f8c8d;
                    font-size: 14px;
                }}
                .date {{
                    color: #7f8c8d;
                    font-size: 13px;
                    margin-top: 10px;
                    text-align: right;
                }}
                .letter-content {{
                    line-height: 1.8;
                    color: #2c3e50;
                    text-align: justify;
                }}
                .letter-content p {{
                    margin-bottom: 15px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="position-info">
                        <h3>{company}</h3>
                        <p>Position: {position}</p>
                    </div>
                    <div class="date">{current_date}</div>
                </div>
                <div class="letter-content">
                    {self._format_letter_content(content)}
                </div>
            </div>
        </body>
        </html>
        """
        return html

    def _format_letter_content(self, content: str) -> str:
        """Format letter content for HTML display."""
        if '<p>' not in content and '<div>' not in content:
            paragraphs = content.split('\n\n')
            return '\n'.join([f'<p>{p.strip()}</p>' for p in paragraphs if p.strip()])
        return content

    def save_resume_pdf(self, markdown_content: str, user_id: int, resume_id: int,
                       version_id: int, template_id: str = "modern") -> str:
        """Generate and save resume PDF."""
        try:
            pdf_bytes = self.generate_resume_pdf(markdown_content, template_id)
            storage_path = self.storage_service.save(file_path, pdf_bytes)
            return storage_path
        except Exception as e:
            logger.error(f"Failed to save resume PDF: {e}")
            raise StorageError(f"Failed to save resume PDF: {str(e)}")

    def save_cover_letter_pdf(self, content: str, user_id: int, application_id: int,
                             company: str, position: str, title: Optional[str] = None) -> str:
        """Generate and save cover letter PDF."""
        try:
            pdf_bytes = self.generate_cover_letter_pdf(
                content=content,
                company=company,
                position=position,
                title=title
            )
            file_path = f"users/{user_id}/applications/{application_id}/cover_letter.pdf"
            storage_path = storage.save(file_path, pdf_bytes)
            logger.info(f"Saved cover letter PDF for application {application_id}")
            return storage_path
        except Exception as e:
            logger.error(f"Failed to save cover letter PDF: {e}")
            raise StorageError(f"Failed to save cover letter PDF: {str(e)}")

    def get_available_templates(self) -> list:
        """Get list of available PDF templates."""
        return html_renderer.get_available_templates()

