"""AI service for resume customization and cover letter generation using Groq."""

import os
import logging
from typing import Dict, Any, Optional
import requests
from groq import Groq
from app.config import settings
from app.core.exceptions import AIServiceError


logger = logging.getLogger(__name__)


class AIGeneratorClient:
    """Client for interacting with Groq AI service."""
    
    def __init__(self):
        """Initialize with environment variables."""
        self.api_key = settings.groq_api_key
        self.model = settings.groq_model_name
        
        if not self.api_key:
            raise AIServiceError("GROQ_API_KEY environment variable is required")
        
        try:
            self.client = Groq(api_key=self.api_key)
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            raise AIServiceError("Failed to initialize AI service")
    
    def _load_prompt_template(self, template_name: str) -> str:
        """Load prompt template from file."""
        template_path = f"/app/ai/prompts/{template_name}.md"
        try:
            if os.path.exists(template_path):
                with open(template_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                # Fallback to embedded templates
                return self._get_embedded_template(template_name)
        except Exception as e:
            logger.warning(f"Failed to load template {template_name}: {e}")
            return self._get_embedded_template(template_name)
    
    def _get_embedded_template(self, template_name: str) -> str:
        """Get embedded prompt templates."""
        templates = {
            "rewrite_resume": """You are an expert resume editor. Given the user's resume (in Markdown) and the job description (plain text), rewrite the resume so it:
- Matches keywords, skills and tone from the JD.
- Prioritizes relevant bullet points (shorten non-relevant ones).
- Preserves factual content (company names, dates, role titles) verbatim unless asked to change.
- Keeps a modular section structure (SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS).
- Returns ONLY the updated resume in Markdown — no commentary.

Rules:
- Keep bullets concise (max 2 lines each).
- Add 3 measurable bullets for the most recent role if relevant data exists.
- Include a short 1–2 sentence customized summary at the top.
- Ensure contact details are unchanged unless explicitly provided.
- Use American English.

{custom_instructions}

Resume Content:
{resume_markdown}

Job Description:
{job_description}

Output the revised resume in Markdown format:""",
            
            "cover_letter": """You are an expert cover letter writer. Use the job description and the customized resume summary to produce a professional cover letter with this shape:
- 3 paragraphs: intro (why you), body (key experiences + fit), closing (call to action).
- ≤ 350 words total.
- Friendly but professional tone; match JD tone.
- Output plain text suitable for email body or PDF.

{custom_instructions}

Company: {company}
Position: {position}
Job Description: {job_description}
Resume Summary: {resume_summary}

Generate a professional cover letter:"""
        }
        return templates.get(template_name, "")
    
    def rewrite_resume(self, resume_markdown: str, job_description: str, instructions: Optional[Dict] = None) -> str:
        """Return rewritten resume markdown tailored to the JD."""
        try:
            # Extract and format custom instructions
            custom_instructions_text = ""
            if instructions:
                # Handle both dict and string types
                if isinstance(instructions, dict):
                    # Extract from common keys
                    instruction_value = instructions.get('custom_instructions') or instructions.get('additional_instructions') or str(instructions)
                else:
                    instruction_value = str(instructions)
                
                if instruction_value:
                    custom_instructions_text = f"""🔴 CRITICAL CUSTOM INSTRUCTIONS - HIGHEST PRIORITY 🔴
You MUST follow these specific user instructions EXACTLY as specified.
These instructions override standard rules if there's a conflict.

CUSTOM INSTRUCTIONS:
{instruction_value}

⚠️ IMPORTANT: Apply the above instructions IMMEDIATELY to the resume customization.
================================"""
            
            # Load and format the prompt template
            prompt_template = self._load_prompt_template("rewrite_resume")
            prompt = prompt_template.format(
                resume_markdown=resume_markdown,
                job_description=job_description,
                custom_instructions=custom_instructions_text
            )
            
            # Make the API call
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume editor who tailors resumes to specific job descriptions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=1,
                max_completion_tokens=8192,
                top_p=1,
                reasoning_effort="high",
                stream=False,  # Changed from True to False to fix the streaming issue
                stop=None
            )
            
            result = chat_completion.choices[0].message.content
            if not result:
                raise AIServiceError("Empty response from AI service")
            
            return result.strip()
            
        except Exception as e:
            logger.error(f"Failed to rewrite resume: {e}")
            if isinstance(e, AIServiceError):
                raise
            raise AIServiceError(f"Resume customization failed: {str(e)}")
    
    def generate_cover_letter(self, template: str, job_description: str, resume_summary: str, 
                            company: str = "", position: str = "", additional_instructions: Optional[str] = None) -> str:
        """Return a tailored cover letter (plain text)."""
        try:
            # Handle custom instructions
            custom_instructions_text = ""
            if additional_instructions:
                custom_instructions_text = f"""🔴 CRITICAL CUSTOM INSTRUCTIONS - HIGHEST PRIORITY 🔴
You MUST follow these specific user instructions EXACTLY as specified.
These instructions override standard rules if there's a conflict.

CUSTOM INSTRUCTIONS:
{additional_instructions}

⚠️ IMPORTANT: Apply the above instructions IMMEDIATELY to the resume customization.
================================"""

            # Load and format the prompt template
            prompt_template = self._load_prompt_template("cover_letter")
            prompt = prompt_template.format(
                company=company,
                position=position,
                job_description=job_description,
                resume_summary=resume_summary,
                custom_instructions=custom_instructions_text
            )
            
            if template:
                prompt += f"\n\nTemplate to follow: {template}"
            
            # Make the API call
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert cover letter writer who creates compelling, professional cover letters."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=1,
                max_completion_tokens=8192,
                top_p=1,
                reasoning_effort="high",
                stream=False,  # Changed from True to False to fix the streaming issue
                stop=None
            )
            
            result = chat_completion.choices[0].message.content
            if not result:
                raise AIServiceError("Empty response from AI service")
            
            return result.strip()
            
        except Exception as e:
            logger.error(f"Failed to generate cover letter: {e}")
            if isinstance(e, AIServiceError):
                raise
            raise AIServiceError(f"Cover letter generation failed: {str(e)}")
    
    def test_connection(self) -> bool:
        """Test the connection to Groq API."""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": "Hello"}],
                model=self.model,
                max_tokens=10
            )
            return chat_completion.choices[0].message.content is not None
        except Exception as e:
            logger.error(f"AI service connection test failed: {e}")
            return False
