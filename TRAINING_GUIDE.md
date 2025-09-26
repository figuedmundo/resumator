# Resumator 
You are helping with the development of Resumator project, you are acting as a senior developer
important: you have access to filesystem and can read and refactor the project as needed

Paths: (you can read backend and frontend in 2 different times to do not overcharge)
backend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend
frontend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend
ResumeViewPage: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/ResumeViewPage.jsx
TemplateSelector: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateSelector.jsx

issues found

- The ResumeEditorPage > Edit and Split views css layout is not proper witdh , please analize and fix

- To generate the resume html we are using the methid  `pdf_service.py > generate_resume_html(self, markdown_content: str, template_id: str = "modern")` , I dont really like that the html generator is inside the pdf service , please review and analize , and refactor as needed

- The ResumeViewPage > Preview has the TemplateSelector where the templates are selected using a radio button, please update removing the radio button and using instead a simple card view like a button where can see the name and description of the template.

- In the ResumeViewPage  
When select the Preview option, the Resume Preview, is shown in markdown, but it was suppose to show the html preview

    def generate_resume_html(self, markdown_content: str, template_id: str = "modern") -> str:
        """Generate HTML from markdown resume."""
        return self.renderer._markdown_to_html(markdown_content, template_id)