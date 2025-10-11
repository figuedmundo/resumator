"""PDF rendering service for converting markdown resumes to PDF."""

import os
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from abc import ABC, abstractmethod
from datetime import datetime
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
    
    def generate_cover_letter_pdf(self, content: str, company: str, position: str, 
                                  title: Optional[str] = None) -> bytes:
        """Generate PDF from cover letter content.
        
        Args:
            content: Cover letter text content or markdown
            company: Company name for header
            position: Position for header
            title: Optional title for the document
            
        Returns:
            PDF bytes
        """
        try:
            # Create HTML for cover letter with professional formatting
            html_content = self._generate_cover_letter_html(
                content=content,
                company=company,
                position=position,
                title=title
            )
            
            # Generate PDF using the renderer
            if hasattr(self.renderer, 'weasyprint'):
                pdf_bytes = self.renderer.weasyprint.HTML(string=html_content).write_pdf()
            else:
                # Fallback to wkhtmltopdf
                options = {
                    'page-size': 'A4',
                    'margin-top': '0.75in',
                    'margin-right': '0.75in',
                    'margin-bottom': '0.75in',
                    'margin-left': '0.75in',
                    'encoding': "UTF-8",
                    'no-outline': None,
                    'enable-local-file-access': None,
                }
                pdf_bytes = pdfkit.from_string(html_content, False, options=options)
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Failed to generate cover letter PDF: {e}")
            raise StorageError(f"Cover letter PDF generation failed: {str(e)}")
    
    def _generate_cover_letter_html(self, content: str, company: str, position: str,
                                    title: Optional[str] = None) -> str:
        """Generate professional HTML for cover letter.
        
        Args:
            content: Cover letter content
            company: Company name
            position: Position title
            title: Optional document title
            
        Returns:
            HTML string
        """
        current_date = datetime.now().strftime("%B %d, %Y")
        doc_title = title or f"Cover Letter - {company} - {position}"
        
        # Create professional cover letter HTML
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{doc_title}</title>
            <style>
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #fff;
                    padding: 0;
                }}
                
                .container {{
                    max-width: 850px;
                    margin: 0 auto;
                    padding: 40px 30px;
                    background-color: #ffffff;
                }}
                
                .header {{
                    margin-bottom: 30px;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 15px;
                }}
                
                .header-info {{
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
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
                
                .salutation {{
                    margin-top: 30px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }}
                
                .letter-content {{
                    line-height: 1.8;
                    color: #2c3e50;
                    text-align: justify;
                    margin-bottom: 25px;
                }}
                
                .letter-content p {{
                    margin-bottom: 15px;
                    text-indent: 0;
                }}
                
                .closing {{
                    margin-top: 30px;
                }}
                
                .closing-salutation {{
                    margin-bottom: 60px;
                    font-weight: 500;
                }}
                
                .signature {{
                    margin-top: 15px;
                    color: #7f8c8d;
                    font-size: 13px;
                }}
                
                @media print {{
                    body {{
                        background-color: #fff;
                    }}
                    .container {{
                        box-shadow: none;
                    }}
                }}
                
                @page {{
                    size: A4;
                    margin: 0.75in;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="header-info">
                        <div></div>
                        <div class="position-info">
                            <h3>{company}</h3>
                            <p>Position: {position}</p>
                        </div>
                    </div>
                    <div class="date">{current_date}</div>
                </div>
                
                <div class="letter-content">
                    {self._format_letter_content(content)}
                </div>
                
                <div class="closing">
                    <div class="closing-salutation">Sincerely,</div>
                    <div class="signature">
                        <p style="margin-bottom: 50px;">[Your Name]</p>
                        <p>[Your Email]</p>
                        <p>[Your Phone]</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _format_letter_content(self, content: str) -> str:
        """Format letter content for HTML display.
        
        Handles both plain text and markdown-like formatting.
        """
        # If content contains HTML-like tags, wrap in paragraphs
        if '<p>' not in content and '<div>' not in content:
            # Split by double newlines to create paragraphs
            paragraphs = content.split('\n\n')
            formatted = '\n'.join([f'<p>{p.strip()}</p>' for p in paragraphs if p.strip()])
            return formatted
        else:
            return content
    
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
    
    def save_cover_letter_pdf(self, content: str, user_id: int, application_id: int,
                             company: str, position: str, title: Optional[str] = None) -> str:
        """Generate and save cover letter PDF.
        
        Args:
            content: Cover letter content
            user_id: User ID
            application_id: Application ID
            company: Company name
            position: Position title
            title: Optional document title
            
        Returns:
            Storage path to saved PDF
        """
        try:
            # Generate PDF
            pdf_bytes = self.generate_cover_letter_pdf(
                content=content,
                company=company,
                position=position,
                title=title
            )
            
            # Save to storage
            file_path = f"users/{user_id}/applications/{application_id}/cover_letter_{company.replace(' ', '_')}_{position.replace(' ', '_')}.pdf"
            storage_path = storage.save(file_path, pdf_bytes)
            
            logger.info(f"Saved cover letter PDF for application {application_id}")
            return storage_path
            
        except Exception as e:
            logger.error(f"Failed to save cover letter PDF: {e}")
            raise StorageError(f"Failed to save cover letter PDF: {str(e)}")
    
    def get_available_templates(self) -> list:
        """Get list of available PDF templates."""
        return html_renderer.get_available_templates()


# Global PDF service instance
pdf_service = PDFService()
