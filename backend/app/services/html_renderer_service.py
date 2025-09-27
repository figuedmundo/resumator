"""HTML rendering service for converting markdown resumes to HTML."""

import os
import logging
from typing import Optional
from pathlib import Path
from abc import ABC, abstractmethod
import markdown
from jinja2 import Template
from app.core.exceptions import StorageError


logger = logging.getLogger(__name__)


class HTMLRenderer:
    """Service for HTML rendering operations."""
    
    def __init__(self):
        """Initialize HTML renderer."""
        pass
    
    def render_markdown_to_html(self, markdown_content: str, template_id: str = "modern") -> str:
        """Convert markdown to HTML using template."""
        try:
            # Convert markdown to HTML
            md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
            body_html = md.convert(markdown_content)
            
            # Load template
            template_html = self._load_template(template_id)
            
            # Render with Jinja2
            template = Template(template_html)
            return template.render(content=body_html)
        except Exception as e:
            logger.error(f"HTML generation failed: {e}")
            raise StorageError(f"HTML generation failed: {str(e)}")
    
    def _load_template(self, template_id: str) -> str:
        """Load HTML template."""
        # First try to load from filesystem
        template_path = Path(__file__).parent.parent / "templates" / f"resume_{template_id}.html"
        
        try:
            if template_path.exists():
                with open(template_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                logger.info(f"Template file not found: {template_path}, using embedded template")
                return self._get_embedded_template(template_id)
        except Exception as e:
            logger.warning(f"Failed to load template {template_id}: {e}")
            return self._get_embedded_template(template_id)
    
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
</html>""",
            
            "minimal": """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.7;
            color: #1a202c;
            max-width: 800px;
            margin: 0 auto;
            padding: 50px;
            background: white;
        }
        h1 {
            color: #1a365d;
            font-size: 3em;
            font-weight: 300;
            text-align: center;
            margin-bottom: 10px;
            position: relative;
        }
        h1::after {
            content: '';
            display: block;
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, #4299e1, #63b3ed);
            margin: 20px auto;
        }
        h2 {
            color: #2d3748;
            font-size: 1.4em;
            font-weight: 500;
            margin: 40px 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            position: relative;
            padding-left: 20px;
        }
        h2::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            background: #4299e1;
            border-radius: 50%;
        }
        h3 {
            color: #2d3748;
            margin: 25px 0 12px 0;
            font-size: 1.2em;
            font-weight: 600;
        }
        ul {
            padding-left: 25px;
            margin-bottom: 25px;
        }
        li {
            margin-bottom: 10px;
            line-height: 1.6;
        }
        .contact-info {
            text-align: center;
            margin-bottom: 40px;
            padding: 25px;
            background: linear-gradient(135deg, #f7fafc, #edf2f7);
            border-radius: 15px;
        }
        strong {
            color: #1a365d;
            font-weight: 600;
        }
        @page {
            margin: 0.5in;
        }
    </style>
</head>
<body>
    {{ content }}
</body>
</html>"""
        }
        return templates.get(template_id, templates["modern"])

    def get_available_templates(self) -> list:
        """Get list of available HTML templates."""
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
            },
            {
                "id": "minimal",
                "name": "Minimal",
                "description": "Clean, contemporary design with subtle gradients"
            }
        ]


# Global HTML renderer instance
html_renderer = HTMLRenderer()
