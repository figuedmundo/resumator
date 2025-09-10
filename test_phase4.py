#!/usr/bin/env python3
"""
Test script to validate Phase 4 PDF and template functionality.
"""

import sys
import os
sys.path.append('/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend')

from app.services.pdf_service import pdf_service

def test_pdf_templates():
    """Test PDF template functionality."""
    print("🧪 Testing PDF Template System...")
    
    # Test 1: Get available templates
    print("\n1. Testing template list...")
    templates = pdf_service.get_available_templates()
    print(f"   Available templates: {len(templates)}")
    for template in templates:
        print(f"   - {template['id']}: {template['name']} - {template['description']}")
    
    # Test 2: Generate PDF with each template
    print("\n2. Testing PDF generation...")
    test_markdown = """# John Doe
**Software Engineer**

## Contact Information
- Email: john.doe@example.com
- Phone: (555) 123-4567
- LinkedIn: linkedin.com/in/johndoe

## Experience

### Senior Software Engineer | TechCorp Inc.
*January 2020 - Present*
- Led development of microservices architecture
- Improved system performance by 40%
- Mentored junior developers

### Software Engineer | StartupXYZ
*June 2018 - December 2019*
- Developed full-stack web applications
- Collaborated with cross-functional teams
- Implemented CI/CD pipelines

## Education

### Bachelor of Science in Computer Science
*University of Technology* | 2014-2018
- GPA: 3.8/4.0
- Dean's List: 6 semesters

## Skills
- **Languages:** Python, JavaScript, Go
- **Frameworks:** React, Django, FastAPI
- **Tools:** Docker, Kubernetes, Git
- **Databases:** PostgreSQL, MongoDB, Redis

## Projects

### E-commerce Platform
Built scalable e-commerce platform using microservices architecture.
- **Technologies:** Python, React, PostgreSQL, Docker
- **Results:** Handled 10k+ concurrent users

### ML Model Deployment Pipeline
Created automated pipeline for ML model deployment.
- **Technologies:** Python, TensorFlow, Kubernetes
- **Results:** Reduced deployment time by 70%
"""
    
    for template in templates:
        print(f"   Testing {template['name']} template...")
        try:
            pdf_bytes = pdf_service.generate_resume_pdf(test_markdown, template['id'])
            print(f"   ✅ {template['name']}: Generated {len(pdf_bytes)} bytes")
        except Exception as e:
            print(f"   ❌ {template['name']}: Error - {e}")
    
    print("\n✅ PDF Template System Test Complete!")

if __name__ == "__main__":
    test_pdf_templates()
