# Resumator 
You are helping with the development and refactoring of Resumator project, you are acting as a senior arquitect
Please read all the points below, analise and create a plan to refactor the app , I need a plan of what need to be done, the changes that need to be done, divided in steps , and for each step I need a prompt for the AI (you) to train yourself in a new conversation about the plan for that (each) step. 

Paths: (you can read backend and frontend in 2 different times to do not overcharge)
backend: "/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend"
frontend: "/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend"
Points:

- There is a big issue in ResumeEditorPage, let me explain, When I am in the ResumeViewPage there is a selector where I can select and view the different versions of the resume (VersionPicker), and if I click the Edit button I am redirected to ResumeEditorPage , where first, I want to see and edit the version I had selected in ResumeViewPage (issue is that always the original come to the view) and if I save it the last customized version is overwritten , please IMPORTANT we should be able to see the correct version selected in the ResumeEditorPage, and of course save the correct version of the resume selected, also have the VersionPicker in the ResumeEditorPage

- Add the cover letters in the dashboard, and please revise the layout, mind the white spaces

- please lets revise and refactor the Cover letters work flow, doesnt make sense that to create a cover letter I need to select and insert {{company}}

Position Title
{{position}}

Your Name
{{name}}

Today's Date
{{date}}

Hiring Manager Name
{{hiring_manager}}

Job Description
{{job_description}}

, If I select create resume from the dashboard or the top meny bar (Header) I should be able to create and save a cover letter without any job related information,, in the same way that is the resumes are working, I should be able to edit the cover letters and the versions of it

- When I would create a job application, I can select the option to create a cover letter, and select the cover letter I want use and have the option to decide customize it or not

- if when I am creating a job aplication and I want a cover letter but I do not have a cover letter saved or I do not have any cover letter I want from the saved ones, we can selct the templates and use them as base to customize the cover letter




- make a plan to add the Cover Letters to the system

- The Pages have too much logic included and is difficult to refactor, please make me a plan to separate the pages into componentes as much as possible, also where the logic can be shared