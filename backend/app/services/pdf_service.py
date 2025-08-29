"""PDF rendering service for converting markdown resumes to PDF."""

import os
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from abc import ABC, abstractmethod
import markdown
import pdfkit
from jinja2 import Template
from app.config import settings
from app.core.exceptions import StorageError
from app.services.storage_service import storage


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
            # Convert markdown to HTML
            html_content = self._markdown_to_html(markdown_content, template_id)
            
            # Generate PDF
            pdf_bytes = self.weasyprint.HTML(string=html_content).write_pdf()
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"WeasyPrint PDF generation failed: {e}")
            raise StorageError(f"PDF generation failed: {str(e)}")
    
    def _markdown_to_html(self, markdown_content: str, template_id: str) -> str:
        """Convert markdown to HTML using template."""
        # Convert markdown to HTML
        md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
        body_html = md.convert(markdown_content)
        
        # Load template
        template_html = self._load_template(template_id)
        
        # Render with Jinja2
        template = Template(template_html)
        return template.render(content=body_html)
    
    def _load_template(self, template_id: str) -> str:
        """Load HTML template."""
        template_path = f"/app/templates/resume_{template_id}.html"
        
        try:
            if os.path.exists(template_path):
                with open(template_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                return self._get_embedded_template(template_id)
        except Exception as e:
            logger.warning(f"Failed to load template {template_id}: {e}")
            return self._get_embedded_template("modern")
    
    def _get_embedded_template(self, template_id: str) -> str:
        """Get embedded HTML templates."""
        templates = {
            "modern": """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        h2 {
            color: #2c3e50;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin: 30px 0 15px 0;
            font-size: 1.4em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        h3 {
            color: #34495e;
            margin: 20px 0 10px 0;
            font-size: 1.2em;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .contact-info {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        strong {
            color: #2c3e50;
        }
        @page {
            margin: 0.5in;
        }
    </style>
</head>
<body>
    {{ content }}
</body>
</html>""",
            
            "classic": """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.5;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        h1 {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 30px;
            font-size: 2.2em;
        }
        h2 {
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin: 25px 0 15px 0;
            font-size: 1.3em;
            text-transform: uppercase;
        }
        h3 {
            margin: 15px 0 8px 0;
            font-size: 1.1em;
            font-style: italic;
        }
        ul {
            padding-left: 25px;
        }
        li {
            margin-bottom: 5px;
        }
        .contact-info {
            text-align: center;
            margin-bottom: 25px;
        }
        @page {
            margin: 0.75in;
        }
    </style>
</head>
<body>
    {{ content }}
</body>
</html>"""
        }
        return templates.get(template_id, templates["modern"])


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
            # Convert markdown to HTML
            html_content = self._markdown_to_html(markdown_content, template_id)
            
            # Generate PDF
            pdf_bytes = pdfkit.from_string(html_content, False, options=self.options)
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"wkhtmltopdf PDF generation failed: {e}")
            raise StorageError(f"PDF generation failed: {str(e)}")
    
    def _markdown_to_html(self, markdown_content: str, template_id: str) -> str:
        """Convert markdown to HTML using template."""
        # Convert markdown to HTML
        md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
        body_html = md.convert(markdown_content)
        
        # Load template
        template_html = self._load_template(template_id)
        
        # Render with Jinja2
        template = Template(template_html)
        return template.render(content=body_html)
    
    def _load_template(self, template_id: str) -> str:
        """Load HTML template."""
        # Same implementation as WeasyPrintRenderer
        template_path = f"/app/templates/resume_{template_id}.html"
        
        try:
            if os.path.exists(template_path):
                with open(template_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                return self._get_embedded_template(template_id)
        except Exception as e:
            logger.warning(f"Failed to load template {template_id}: {e}")
            return self._get_embedded_template("modern")
    
    def _get_embedded_template(self, template_id: str) -> str:
        """Get embedded HTML templates - same as WeasyPrintRenderer."""
        return WeasyPrintRenderer()._get_embedded_template(template_id)


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
        return [
            {
                "id": "modern",
                "name": "Modern",
                "description": "Clean, modern design with blue accents"
            },
            {
                "id": "classic", 
                "name": "Classic",
                "description": "Traditional black and white design"
            }
        ]


# Global PDF service instance
pdf_service = PDFService()
