# AI Task Planning Template - Cover Letter Integration

> **About This Template:** This is a systematic framework for planning and executing technical projects with AI assistance. Use this structure to break down complex features, improvements, or fixes into manageable, trackable tasks that AI agents can execute effectively.

---

## 1. Task Overview

### Task Title
**Title:** Integrate Cover Letter Selection and Customization into the Job Application Workflow

### Goal Statement
**Goal:** The goal is to allow users to attach, create, and customize cover letters when creating or managing a job application. This will streamline the application process and provide users with more powerful tools to tailor their applications.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** FastAPI (Python), React 18.2.0 (Vite)
- **Language:** Python 3.9+, JavaScript (ES6+)
- **Database & ORM:** PostgreSQL, SQLAlchemy
- **UI & Styling:** Tailwind CSS, React components
- **Authentication:** JWT-based authentication
- **Key Architectural Patterns:** Service Layer, Dependency Injection, Component-Based UI

### Current State
- Job applications do not currently support cover letters.
- There is no mechanism to link cover letters to job applications.
- The UI does not provide any interface for cover letter selection or customization within the application workflow.

## 3. Context & Problem Definition

### Problem Statement
Users need to manage cover letters in conjunction with their job applications. Without this integration, they are forced to handle cover letters manually, outside of the Resumator platform. This creates a disjointed experience and misses an opportunity to leverage the platform's AI capabilities for cover letter customization.

### Success Criteria
- [x] Users can optionally attach an existing cover letter to a new or existing job application.
- [x] Users can create a new cover letter from a template during the application process.
- [x] Users can customize a cover letter specifically for a job application.
- [x] The customized cover letter is saved as a new version, preserving the original.
- [x] The application details page displays the attached cover letter.

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** New feature development on an existing application.
- **Breaking Changes:** Acceptable for the API as long as the frontend is updated accordingly.
- **Data Handling:** Requires database schema changes. Existing data should be preserved.
- **User Base:** All users of the job application feature will be affected.
- **Priority:** Stability and a smooth user experience are priorities.

---

## 5. Technical Requirements

### Functional Requirements
- **Application Model:**
  - `cover_letter_version_id` (nullable UUID) will be added to the `applications` table, with a foreign key to `cover_letter_versions`.
  - `cover_letter_customized_at` (nullable timestamp) will be added.
- **Application API:**
  - `POST /api/v1/applications`: Accept optional `cover_letter_id` or `template_id`.
  - `GET /api/v1/applications/{id}`: Return linked cover letter version details.
  - `POST /api/v1/applications/{id}/cover-letter`: Attach/associate a cover letter.
  - `PUT /api/v1/applications/{id}/cover-letter`: Update/customize the cover letter for the application.
  - `DELETE /api/v1/applications/{id}/cover-letter`: Detach/remove the cover letter from the application.
- **Frontend - ApplicationForm:**
  - An "Add Cover Letter" section will be added.
  - Options will include: "No cover letter", "Select from saved", "Create from template".
  - A customization interface will be available.
- **Frontend - ApplicationDetail:**
  - The linked cover letter will be displayed.
  - "Edit Cover Letter" and "Remove" buttons will be available.
- **CoverLetterCustomizationModal:**
  - A new modal will be created to edit and preview cover letter content.
  - Saving changes will create a new version of the cover letter.

### Non-Functional Requirements
- **Performance:** API responses should remain fast (<500ms).
- **Security:** All endpoints must be protected and user-scoped.
- **Usability:** The cover letter selection and customization process should be intuitive.

### Technical Constraints
- Must use the existing `cover_letter_versions` table.
- Customization must create a new version to avoid overwriting shared cover letters.

---

## 6. Data & Database Changes

### Database Schema Changes
```sql
ALTER TABLE applications
ADD COLUMN cover_letter_version_id UUID REFERENCES cover_letter_versions(id) ON DELETE SET NULL,
ADD COLUMN cover_letter_customized_at TIMESTAMP WITH TIME ZONE;
```

### Data Model Updates
**Pydantic Schemas (backend/app/schemas/application.py):**
```python
class ApplicationResponse(BaseModel):
    # ... existing fields
    cover_letter_version: Optional[CoverLetterVersionSchema]

class CoverLetterSelectionRequest(BaseModel):
    cover_letter_id: Optional[UUID]
    template_id: Optional[UUID]
```

---

## 7. API & Backend Changes

### Data Access Pattern Rules
- Business logic will be handled in `backend/app/services/application_service.py`.
- API endpoints will be defined in `backend/app/api/v1/applications.py`.

### Server Actions
- **`create_application`:** Modify to handle `cover_letter_id` or `template_id`.
- **`get_application`:** Modify to include cover letter version details.
- **`attach_cover_letter_to_application`:** New service function.
- **`customize_application_cover_letter`:** New service function.
- **`remove_cover_letter_from_application`:** New service function.

### Database Queries
- Queries will be updated in the `ApplicationService` to join with `cover_letter_versions` where necessary.

---

## 8. Frontend Changes

### New Components
- **`CoverLetterCustomizationModal.jsx`**: A modal for editing and previewing cover letters.
- **`CoverLetterSelector.jsx`**: A component to select from existing cover letters or templates.

### Page Updates
- **`ApplicationForm.jsx`**: Add the new cover letter selection and customization section.
- **`ApplicationDetail.jsx`**: Display the linked cover letter and provide options to edit or remove it.

### State Management
- The `useApplication` hook (if it exists, or equivalent state management) will be updated to handle cover letter data.

---

## 9. Implementation Plan

**Phase 1: Backend**
1.  Apply database schema changes.
2.  Update Pydantic schemas.
3.  Update `ApplicationService` with the new logic.
4.  Implement the new API endpoints in `applications.py`.
5.  Write unit and integration tests for the new functionality.

**Phase 2: Frontend**
1.  Create the `CoverLetterSelector` component.
2.  Create the `CoverLetterCustomizationModal` component.
3.  Integrate the new components into `ApplicationForm.jsx`.
4.  Update `ApplicationDetail.jsx` to display the cover letter.
5.  Update API service calls in `frontend/src/services/api.js`.

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Progress will be tracked by marking checkboxes in the "Success Criteria" and "Implementation Plan" sections.

---

## 11. File Structure & Organization

### New Files
- `frontend/src/components/Applications/CoverLetterSelector.jsx`
- `frontend/src/components/Applications/CoverLetterCustomizationModal.jsx`

### Modified Files
- `backend/app/models/application.py`
- `backend/app/schemas/application.py`
- `backend/app/services/application_service.py`
- `backend/app/api/v1/applications.py`
- `frontend/src/pages/ApplicationForm/ApplicationForm.jsx`
- `frontend/src/pages/ApplicationDetail/ApplicationDetail.jsx`
- `frontend/src/services/api.js`

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  Start with the backend changes (Phase 1).
2.  Ensure all backend tests pass before moving to the frontend.
3.  Implement the frontend components (Phase 2).
4.  Connect the frontend to the backend API.
5.  Verify the end-to-end workflow.

### Communication Preferences
- Provide a summary of changes after each major step (e.g., after backend is complete).
- Ask for clarification if requirements are ambiguous.

### Code Quality Standards
- Follow existing coding styles (PEP 8 for Python, React/JSX standards for frontend).
- Add comments for complex logic.

---

## 13. Second-Order Impact Analysis

### Impact Assessment
- **User Workflow:** This change will significantly alter the application creation workflow. It should be introduced with clear UI cues.
- **Performance:** The additional join on the `applications` table might have a minor performance impact. This should be monitored.
- **Related Features:** The cover letter list page may need to be updated to show which cover letters are associated with applications.
