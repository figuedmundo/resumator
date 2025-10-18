# AI Task Planning Template - Cover Letter and Application UX Refactor

> **About This Template:** This is a systematic framework for planning and executing technical projects with AI assistance. Use this structure to break down complex features, improvements, or fixes into manageable, trackable tasks that AI agents can execute effectively.

---

## 1. Task Overview

### Task Title
**Title:** Refactor Cover Letter and Application Creation UX

### Goal Statement
**Goal:** To improve the user experience and fix critical bugs in the cover letter and application creation workflows. This involves replacing outdated UI components, fixing layout issues, resolving save functionality bugs, and redesigning the application creation process from a multi-step wizard to a more intuitive single-form interface, while also addressing a critical database error preventing application creation.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** React 18.2.0 (with Vite), FastAPI, Python 3.9+
- **Language:** JavaScript (ES6+), Python 3.9+
- **Database & ORM:** PostgreSQL with SQLAlchemy
- **UI & Styling:** Tailwind CSS, CSS Modules
- **Authentication:** JWT-based
- **Key Architectural Patterns:** Service Layer, Dependency Injection, Component-Based UI

### Current State
The current state of the cover letter and application creation flows is detrimental to the user experience. Key issues include:
- The `CoverLetterGeneratePage` uses a jarring native `alert` for cancellation and allows users to proceed without any cover letters existing.
- The `CoverLetterEditorPage` suffers from a poor, overly wide layout, prevents the creation of generic cover letters by requiring company/position details, lacks an autosave feature, and displays a persistent, misleading save indicator.
- The `ApplicationWizard` is a cumbersome multi-step process that is currently broken due to a backend database error (`UndefinedColumn: column "cover_letter_id" of relation "applications" does not exist`), completely blocking users from creating job applications.
- The AI customization flow is disjointed, with separate instructions for resumes and no clear path for cover letters.

---

## 3. Context & Problem Definition

### Problem Statement
The user experience for creating cover letters and job applications is fragmented, buggy, and visually inconsistent. Key workflows are blocked by a combination of poor UI/UX choices and a critical backend database error. This prevents users from efficiently creating and managing their job application materials, undermining the core value proposition of the Resumator application. The issues range from minor annoyances like native alerts to show-stopping bugs that make core features unusable.

### Success Criteria
- [ ] A confirmation dialog replaces the `alert` on the `CoverLetterGeneratePage`.
- [ ] The "Next" button on `CoverLetterGeneratePage` is disabled if no cover letters exist.
- [ ] The `CoverLetterEditorPage` layout is constrained to a comfortable reading width.
- [ ] "Company" and "Position" fields are removed from the `CoverLetterEditorPage`, allowing generic cover letters to be saved.
- [ ] Autosave is implemented on the `CoverLetterEditorPage` for existing letters, with a clear visual indicator for save status.
- [ ] The save indicator on the `CoverLetterEditorPage` only shows immediately after a successful save action.
- [ ] The `ApplicationWizard` is completely replaced by a new, single-page `ApplicationForm`.
- [ ] The database schema error is resolved, and applications can be created successfully, both with and without an associated cover letter.
- [ ] The new `ApplicationForm` allows for optional AI customization of both the selected resume and cover letter using a single, larger "Additional Instructions" field.

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** New development on an existing system.
- **Breaking Changes:** Acceptable. The `ApplicationWizard` will be removed and replaced, which is a significant but necessary breaking change to improve the UX.
- **Data Handling:** The database schema must be altered. Existing application data is not a concern as the feature is currently broken.
- **User Base:** All users creating applications will be affected by the changes.
- **Priority:** The priority is to achieve a stable, functional, and user-friendly workflow. Stability and correctness are paramount.

---

## 5. Technical Requirements

### Functional Requirements
- **System:** Must display a non-native confirmation dialog when a user attempts to cancel an action on the `CoverLetterGeneratePage`.
- **System:** The "Next" button on the `CoverLetterGeneratePage` must be in a disabled state if the list of available cover letters is empty.
- **User can:** Create and save a generic cover letter without providing a company name or position title.
- **System:** Automatically save changes on an *existing* cover letter after a short period of user inactivity. New cover letters will require an explicit initial save.
- **User can:** Create a job application using a single form instead of a multi-step wizard.
- **User can:** Create a job application without selecting a cover letter.
- **User can:** Provide a single set of instructions for AI customization that will apply to both the selected resume and cover letter.

### Non-Functional Requirements
- **Usability:** The new application form must be significantly more intuitive and require fewer steps than the wizard it replaces. The cover letter editor must be comfortable to use for extended writing.
- **Responsive Design:** All modified and new components must be fully responsive for desktop, tablet, and mobile views.
- **Performance:** The autosave feature should not introduce any noticeable performance degradation.

---

## 6. Data & Database Changes

### Database Schema Changes
The error `column "cover_letter_id" of relation "applications" does not exist` indicates a critical schema mismatch. A migration is required to add this column to the `applications` table.

```sql
-- This SQL command will be the basis for the database migration.
-- It adds a foreign key relationship to the cover_letters table.
ALTER TABLE applications ADD COLUMN cover_letter_id INTEGER REFERENCES cover_letters(id) ON DELETE SET NULL;
```

### Data Model Updates
- The Pydantic schema `ApplicationCreate` in `backend/app/schemas/application.py` will be updated to make `cover_letter_id` and related version fields optional.
- The SQLAlchemy model for `Application` in `backend/app/models/application.py` needs to be verified to include the `cover_letter_id` relationship.

### Data Migration Plan
1.  **Backup:** (Optional, as the current feature is broken)
2.  **Apply Changes:** A new migration file will be created and applied via the project's migration tool (or manually via `init.sql` if that is the project's convention) to add the `cover_letter_id` column.
3.  **Validate:** Confirm the column has been added correctly in the PostgreSQL database.

---

## 7. API & Backend Changes

### Data Access Pattern Rules
- All business logic will be handled within the `services` layer.
- API endpoints in the `api/v1` directory will only handle request/response validation and routing to the appropriate service.

### Server Actions
- **`POST /api/v1/applications`**: The corresponding service function `application_service.create_application` will be modified to:
    - Accept an optional `cover_letter_id`.
    - If `cover_letter_id` is `None`, create the application without a cover letter reference.
    - Handle the new unified AI customization instructions.
- **`PUT /api/v1/cover-letters/{cover_letter_id}`**: The service function `cover_letter_service.update_cover_letter` will be modified to remove the validation requirement for `company` and `position`.

### Database Queries
- The `create_application` query will be updated to correctly handle a null value for `cover_letter_id`.

---

## 8. Frontend Changes

### New Components
- **`ConfirmationModal.jsx`**: A reusable modal component to handle confirmation dialogs across the application.
- **`useAutosave.jsx`**: A custom React hook to manage the autosave functionality, including debouncing and status tracking.

### Page Updates
- **`CoverLetterGeneratePage.jsx`**: Will be updated to use the new `ConfirmationModal` and include logic to disable the "Next" button when no cover letters are present.
- **`CoverLetterEditorPage.jsx`**:
    - The main container will be styled with a `max-width` to improve readability.
    - The input fields for "company" and "position" will be removed.
    - The `useAutosave` hook will be implemented to handle saving.
    - The save indicator's visibility will be tied to the state from the autosave hook.
- **`ApplicationWizard/`**: This entire directory and its associated routes will be deleted.
- **`ApplicationForm.jsx` (New Page)**: A new page will be created at `/applications/new`. It will feature a single, comprehensive form for application creation, replacing the old wizard.

### State Management
- The `useAutosave` hook will manage its own state for `isSaving`, `isSaved`, `error`.
- The new `ApplicationForm` will manage its form state locally using React hooks.

---

## 9. Implementation Plan

**Phase 1: Backend Fix & Cover Letter UX Enhancements**
1.  **Task 1.1 (DB):** Investigate the existing migrations (`1.2.0-cover-letter-refactor.sql`, `cl_refactor_migration.sql`) and create a new, definitive migration to add the nullable `cover_letter_id` column to the `applications` table.
2.  **Task 1.2 (Backend):** Update the `create_application` service and Pydantic schema to handle an optional `cover_letter_id`.
3.  **Task 1.3 (Backend):** Update the `update_cover_letter` service and schema to remove the requirement for `company` and `position`.
4.  **Task 1.4 (Frontend):** Create the reusable `ConfirmationModal.jsx` component.
5.  **Task 1.5 (Frontend):** Refactor `CoverLetterGeneratePage.jsx` to use the modal and manage the "Next" button state.
6.  **Task 1.6 (Frontend):** Refactor `CoverLetterEditorPage.jsx` to fix the layout, remove unnecessary fields, and manage the save indicator state.
7.  **Task 1.7 (Frontend):** Create and implement the `useAutosave.jsx` hook in the editor.

**Phase 2: Application Form Refactor**
1.  **Task 2.1 (Frontend):** Delete the `frontend/src/pages/ApplicationWizard` directory and remove its routes from `App.jsx`.
2.  **Task 2.2 (Frontend):** Create the new `ApplicationForm.jsx` page component.
3.  **Task 2.3 (Frontend):** Add the new `/applications/new` route to `App.jsx`.
4.  **Task 2.4 (Frontend):** Implement the complete UI for the new form, including selectors for resumes/versions, optional cover letters/versions, and the unified AI customization section with a larger text area.
5.  **Task 2.5 (Frontend):** Connect the form's submission logic to the updated `POST /api/v1/applications` endpoint.

**Phase 3: Verification & Cleanup**
1.  **Task 3.1 (E2E Testing):** Thoroughly test the entire flow: creating a generic cover letter, editing it (with autosave), creating a new application (with and without a cover letter), and triggering the AI customization.
2.  **Task 3.2 (Code Review):** Ensure all new code adheres to project standards.

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
Progress will be tracked by checking off the success criteria and the implementation plan tasks as they are completed. The AI agent will provide a summary of completed tasks after each major phase.

---

## 11. File Structure & Organization

- **New Files:**
    - `.vibe/tasks/003_cover_letter_and_application_refactor.md`
    - `frontend/src/components/common/ConfirmationModal.jsx`
    - `frontend/src/hooks/useAutosave.jsx`
    - `frontend/src/pages/ApplicationForm/ApplicationForm.jsx`
    - `backend/migrations/versions/YYYYMMDD_add_cover_letter_to_applications.py` (or equivalent `.sql` file)
- **Modified Files:**
    - `backend/app/api/v1/applications.py`
    - `backend/app/services/application_service.py`
    - `backend/app/schemas/application.py`
    - `backend/app/api/v1/cover_letters.py`
    - `backend/app/services/cover_letter_service.py`
    - `frontend/src/App.jsx`
    - `frontend/src/pages/CoverLetterEditor/CoverLetterEditorPage.jsx`
- **Deleted Folders:**
    - `frontend/src/pages/ApplicationWizard/`

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  Begin with **Phase 1**. Do not proceed to Phase 2 until the backend database issue is resolved and the cover letter UX enhancements are implemented and verified.
2.  When creating the database migration, first inspect the existing migration files in `backend/migrations/` to avoid conflicts.
3.  For frontend changes, create reusable components and hooks as planned. Do not implement logic directly inside page components if it can be abstracted.
4.  After completing all coding tasks, perform a final verification run of the entire user flow.

### Communication Preferences
- Provide a brief summary after completing each major task in the implementation plan (e.g., "Task 1.1 complete: Database migration has been created.").
- Before making any significant deviation from the plan, ask for confirmation.

### Code Quality Standards
- Adhere strictly to the existing code style (PEP 8 for Python, React/JSX standards for the frontend).
- Ensure all new components are functional and well-structured.
- Add comments only for complex logic that isn't self-explanatory.

---

## 13. Second-Order Impact Analysis

### Impact Assessment
- **Potential Risks:** The database migration is the highest-risk part of this task. If done incorrectly, it could cause issues. The removal of the `ApplicationWizard` is a major change; links or bookmarks to the old wizard pages will be broken.
- **Performance:** The autosave feature will increase the number of API calls. The `useAutosave` hook must be implemented with debouncing to mitigate this.
- **User Workflow:** The user workflow for creating applications will be fundamentally changed for the better. Users who were accustomed to the old wizard will need to adapt, but the new process will be more streamlined and intuitive.
