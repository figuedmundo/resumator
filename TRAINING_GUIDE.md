# Resumator 
You are helping with the development and refactoring of Resumator project, you are acting as a senior arquitect
I need that you create a plan to refactor the app according the points below, I need a plan of what need to be done, the changes that need to be done, divided in steps , and for each step I need a prompt for the AI (you) to train yourself in a new conversation about the plan for that step.

Paths: (you can read backend and frontend in 2 different times to do not overcharge)
backend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend
frontend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend
ResumeEditorPage: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx
ResumeViewPage: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/ResumeViewPage.jsx
Points:
- we need to refactor the project, currently when the ResumeEditorPage is opened the Split view is shown by default, I noticed this view is not useful and create a lot of issues with the layout of the project in general, and not useful when open the page in the phone. we need to delete this view. Keep the edit page as default 

- The wide of all the views is wrong, is wider than expected, is not pleasant to the view

- When the ResumeViewPage is open the Template Selection takes too much space in the view, please re-think the layout of the page , also take into accoun the Template Selection should be flexible enough that if I want to add a template I should be able without rewrite Pages and Views all over the place, even if there is no view for it, at least just adding a template html and editing the config or .env file I should be able to add another template into the project

- The customization of a resume is very linked to the job that I will be appliying, so instead to have the Customize button in the ResiveViewPage, it should be in the Aplication process, for example, when I will apply for job I start creating the application where I will add the Job Description and all the Aditional instructions that I need for that application, in that way if later I see the Aplication Details Page, I can have all those details there. , after the application is created , I should be able to select the Resume I will use, and if I want start the customization of the resume (Customize Resume button) with the AI (groq) , In the customize the idea of Compare the original resume with the customized is good but the layout is not working, have 2 pages makes them too narrow and not pleasant to read, also it doesn't work in mobile , please re-think this or remove the Comparizion , After I get the customized resume , I should be able to edit it , and when the use is happy or agrees with the customized resume , we can complete the aplication. 

- The customized resume should show the version and the company like v2 - intel , instead of v2 - Customized  , in this way the custommized resume is clear identificable 

- In the Aplication List the row where is the aplication has too much empty space the information is all in the left side , also I should be able to download the resume choosen

- Also I should be able to download the resume I choose when I created the application in the Aolication Details 

- I should be able to delete the Resume from the Resume card in Resumes Page, 

- I should be able to edit and view the resume version I want in the ResumeViewPage and ResumeEditorPage 

- If I delete an aplication and if this had created a customized resume with the application, that customized resume also should be deleted,  never delete the original resume with an aplication of course.