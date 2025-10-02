# Resumator 
You are helping with the development and refactoring of Resumator project, you are acting as a senior arquitect
Please read the points below and I need that you create a plan to refactor the app according the points below, I need a plan of what need to be done, the changes that need to be done, divided in steps , and for each step I need a prompt for the AI (you) to train yourself in a new conversation about the plan for that (each) step. 

Paths: (you can read backend and frontend in 2 different times to do not overcharge)
backend: "/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend"
frontend: "/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend"
Points:

- Add Customize button in the ResumeViewPage, needs to customize the resume version currlently selected

- After The ai Customize the resume, in ResumeComparison the Original Resume is empty

- After The ai Customize the resume, in ResumeComparison there is a button Discard changes , but even I clicked that button, the resume customized version is already saved.
- After The ai Customize the resume, in ResumeComparison there is a button Save changes, after clicked I am redirected to ResumeCustomizePage, I would prefer be redirected to ResumeViewPage 

- I want be able to edit the resume customized in ResumeEditorPage (you can use the same version selector than in ResumeEditorPage)

- in ResumeEditorPage, I want strongly that the wide of the page is the standard width, pleasant to read, and the lines inside needs to wrapped (right now I have to scroll horizontaly to read and is not good)

- please improve the layout and css of ApplicationWizard 

- in ApplicationWizard , step 2 Select resume , the resume preview doesn't show me anything (empty), please remove the preview

- in ApplicationWizard , step 3 Customize (optional), I have a checkbox to accept the creation of a customized version , if I click on the Generate preview, 1st issue, the preview is truncated, 2do issue, the resume customized is saved in the dabase wieh a new version number, and when after complete the  aplication, another version is saved in the databse v(number) - company ,, so is creating 2 version, only one should be generated. I think that the best option is join step2 and step 3 in one page of the wizard, do not show the preview resume (neither for the original and customized), have the checkbox to select if I want customize using AI and pass to the next page that is Review and Create

- in ApplicationWizard , step 4 Review and Create , after click on Create Applcation, the page should show the loading spinner to denota that the page is working with the customization and saving of everything in the database

- When creating a custom resume, in the Additional Instructions section, I added "translate the resume to french", but the resume was not transated by the AI



- make a plan to add the Cover Letters to the system

- The Pages have too much logic included and is difficult to refactor, please make me a plan to separate the pages into componentes as much as possible, also where the logic can be shared