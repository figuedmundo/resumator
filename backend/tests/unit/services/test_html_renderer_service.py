import pytest
from app.services.html_renderer_service import HTMLRenderer

def test_render_markdown_to_html_modern():
    # Arrange
    renderer = HTMLRenderer()
    markdown_content = "## Test Header"
    
    # Act
    html_content = renderer.render_markdown_to_html(markdown_content, template_id="modern")

    # Assert
    assert '<h2 id="test-header">Test Header</h2>' in html_content

def test_render_markdown_to_html_classic():
    # Arrange
    renderer = HTMLRenderer()
    markdown_content = "## Test Header"
    
    # Act
    html_content = renderer.render_markdown_to_html(markdown_content, template_id="classic")

    # Assert
    assert '<h2 id="test-header">Test Header</h2>' in html_content
