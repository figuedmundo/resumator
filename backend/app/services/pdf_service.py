"""PDF rendering service for converting markdown resumes to PDF."""

import os
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from abc import ABC, abstractmethod
import pdfkit
from app.config import settings
from app.core.exceptions import StorageError
from app.services.storage_service import storage
from app.services.html_renderer_service import html_renderer


logger = logging.getLogger(__name__)


class PDFRenderer(ABC):
    """Abstract base class for PDF renderers."""
    
    @abstractmethod
    def render(self, markdown_content: str, template_id: str = "modern") -> bytes:
        """Return PDF bytes for given markdown and template."""
        pass


class WeasyPrintRenderer(PDFRenderer):
    """WeasyPrint-based PDF renderer."""
    
    def __init__(self):
        """Initialize WeasyPrint renderer."""
        try:
            import weasyprint
            self.weasyprint = weasyprint
        except ImportError:
            raise StorageError("WeasyPrint not installed. Install with: pip install weasyprint")
    
    def render(self, markdown_content: str, template_id: str = "modern") -> bytes:
        """Render markdown to PDF using WeasyPrint."""
        try:
            # Convert markdown to HTML using HTML renderer service
            html_content = html_renderer.render_markdown_to_html(markdown_content, template_id)
            
            # Generate PDF
            pdf_bytes = self.weasyprint.HTML(string=html_content).write_pdf()
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"WeasyPrint PDF generation failed: {e}")
            raise StorageError(f"PDF generation failed: {str(e)}")


class WKHTMLToPDFRenderer(PDFRenderer):
    """wkhtmltopdf-based PDF renderer."""
    
    def __init__(self):
        """Initialize wkhtmltopdf renderer."""
        # Configure wkhtmltopdf options
        self.options = {
            'page-size': 'A4',
            'margin-top': '0.5in',
            'margin-right': '0.5in',
            'margin-bottom': '0.5in',
            'margin-left': '0.5in',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None,
        }
    
    def render(self, markdown_content: str, template_id: str = "modern") -> bytes:
        """Render markdown to PDF using wkhtmltopdf."""
        try:
            # Convert markdown to HTML using HTML renderer service
            html_content = html_renderer.render_markdown_to_html(markdown_content, template_id)
            
            # Generate PDF
            pdf_bytes = pdfkit.from_string(html_content, False, options=self.options)
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"wkhtmltopdf PDF generation failed: {e}")
            raise StorageError(f"PDF generation failed: {str(e)}")


def get_pdf_renderer() -> PDFRenderer:
    """Factory function to get the configured PDF renderer."""
    # Try WeasyPrint first, fallback to wkhtmltopdf
    try:
        return WeasyPrintRenderer()
    except StorageError:
        logger.info("WeasyPrint not available, using wkhtmltopdf")
        return WKHTMLToPDFRenderer()


class PDFService:
    """Service for PDF operations."""
    
    def __init__(self):
        """Initialize PDF service."""
        self.renderer = get_pdf_renderer()
    
    def generate_resume_pdf(self, markdown_content: str, template_id: str = "modern") -> bytes:
        """Generate PDF from markdown resume."""
        return self.renderer.render(markdown_content, template_id)

    def generate_resume_html(self, markdown_content: str, template_id: str = "modern") -> str:
        """Generate HTML from markdown resume."""
        return html_renderer.render_markdown_to_html(markdown_content, template_id)
    
    def save_resume_pdf(self, markdown_content: str, user_id: int, resume_id: int, 
                       version_id: int, template_id: str = "modern") -> str:
        """Generate and save resume PDF."""
        try:
            # Generate PDF
            pdf_bytes = self.generate_resume_pdf(markdown_content, template_id)
            
            # Save to storage
            file_path = f"users/{user_id}/resumes/{resume_id}/versions/{version_id}/resume_{template_id}.pdf"
            storage_path = storage.save(file_path, pdf_bytes)
            
            return storage_path
            
        except Exception as e:
            logger.error(f"Failed to save resume PDF: {e}")
            raise StorageError(f"Failed to save resume PDF: {str(e)}")
    
    def get_available_templates(self) -> list:
        """Get list of available PDF templates."""
        return html_renderer.get_available_templates()


# Global PDF service instance
pdf_service = PDFService()
