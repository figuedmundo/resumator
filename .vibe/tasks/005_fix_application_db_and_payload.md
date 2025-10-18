# AI Task Planning Template - Fix Application Creation Logic and Database Schema

> **About This Template:** This is a systematic framework for planning and executing technical projects with AI assistance. Use this structure to break down complex features, improvements, or fixes into manageable, trackable tasks that AI agents can execute effectively.

---

## 1. Task Overview

### Task Title
**Title:** Fix Application Creation Due to Database Schema and Payload Mismatch

### Goal Statement
**Goal:** To completely resolve the application creation failure by correcting a critical database schema mismatch and aligning the backend data models (SQLAlchemy and Pydantic) with the application's logic. This will restore the core functionality of creating a job application and ensure data integrity.

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
The application creation process is critically broken. Despite recent fixes to the frontend payload and the service layer, the root cause of the failure persists. The error message `(psycopg2.errors.UndefinedColumn) column "customized_cover_letter_version_id" of relation "applications" does not exist` indicates a fundamental disconnect between the application's code and the database schema.

The SQLAlchemy model is attempting to insert data into columns (`cover_letter_id`, `customized_cover_letter_version_id`) that do not exist in the database. This is happening because the `init.sql` script, which defines the database schema, is out of sync with the SQLAlchemy models defined in `backend/app/models/application.py`. The Docker environment has not applied the latest schema changes, leading to this runtime error.

Furthermore, there is a logical inconsistency in how resumes and cover letters are being handled in the API payload, which requires clarification and correction.

---

## 3. Context & Problem Definition

### Problem Statement
There are two distinct but related problems:

1.  **Database Schema Mismatch:** The primary issue is that the `applications` table in the PostgreSQL database is missing several columns that the backend application code expects. The SQLAlchemy ORM is generating an `INSERT` statement that includes fields like `cover_letter_id` and `customized_cover_letter_version_id`, but the database throws an `UndefinedColumn` error because those columns were never created. This is a blocking issue that makes it impossible to create any applications.

2.  **Inconsistent Data Modeling for Cover Letters:** You correctly identified a logical flaw in the API design. The API requires a `resume_id` and a `resume_version_id` to uniquely identify a resume version. However, for cover letters, it only asks for a `cover_letter_version_id`. This is problematic because the system cannot know which parent cover letter the version belongs to without the `cover_letter_id`. This can lead to ambiguity and makes the API less robust. The reason for this design choice is likely an oversight during the feature's development, where the cover letter implementation did not fully mirror the more mature resume implementation.

### Success Criteria
- [ ] The `applications` table in the database schema is successfully updated to include all necessary columns (`cover_letter_id`, `customized_cover_letter_version_id`, etc.).
- [ ] The backend API payload for creating an application is updated to require both `cover_letter_id` and `cover_letter_version_id` for consistency.
- [ ] The frontend `ApplicationFormPage.jsx` is updated to send the corrected payload.
- [ ] Users can successfully create a new job application, both with and without a cover letter, without any errors.
- [ ] The user is redirected to the applications page after a successful creation.

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Production system with a critical bug.
- **Breaking Changes:** Acceptable and necessary. The API contract for creating an application will be changed to enforce a more consistent data model.
- **Data Handling:** The database schema must be altered. Since application creation is already broken, there is no risk to existing data.
- **User Base:** All users are currently blocked from using this core feature.
- **Priority:** Highest priority. The focus is on a correct and robust fix.

---

## 5. Technical Requirements

### Functional Requirements
- **System:** The database schema must perfectly match the SQLAlchemy model definitions.
- **System:** The API for creating an application must require `cover_letter_id` when `cover_letter_version_id` is provided.
- **User can:** Select a cover letter and a specific version of it in the UI.

### Non-Functional Requirements
- **Data Integrity:** The relationship between applications, cover letters, and their versions must be clearly and correctly defined in the database.

---

## 6. Data & Database Changes

### Database Schema Changes
The `init.sql` script must be updated to correctly define the `applications` table. The final schema should include all columns present in the `Application` SQLAlchemy model.

```sql
-- Proposed changes for the 'applications' table in init.sql
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE RESTRICT,
    resume_version_id INTEGER NOT NULL REFERENCES resume_versions(id) ON DELETE RESTRICT,
    customized_resume_version_id INTEGER REFERENCES resume_versions(id) ON DELETE CASCADE,
    
    -- These columns need to be added or corrected
    cover_letter_id INTEGER REFERENCES cover_letters(id) ON DELETE SET NULL,
    cover_letter_version_id INTEGER REFERENCES cover_letter_versions(id) ON DELETE SET NULL,
    customized_cover_letter_version_id INTEGER REFERENCES cover_letter_versions(id) ON DELETE SET NULL,

    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    job_description TEXT,
    additional_instructions TEXT,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Data Model Updates
- **`backend/app/models/application.py`**: The `Application` SQLAlchemy model will be reviewed to ensure it is the source of truth for the database schema.
- **`backend/app/schemas/application.py`**: The `ApplicationCreate` Pydantic schema will be updated to require `cover_letter_id`.

```python
# Proposed change for ApplicationCreate in schemas/application.py
class ApplicationCreate(ApplicationBase):
    resume_id: int
    resume_version_id: int
    additional_instructions: Optional[str] = None
    customize_resume: bool = False
    cover_letter_id: Optional[int] = None  # Add this field
    cover_letter_version_id: Optional[int] = None
```

### Data Migration Plan
The fix requires resetting the Docker database volume to ensure the updated `init.sql` script is executed.
1.  Stop Docker Compose: `docker-compose down`
2.  Remove the database volume: `docker volume rm resumator_db_data`
3.  Rebuild and start the services: `docker-compose up -d --build`

---

## 7. API & Backend Changes

### Server Actions
- **`POST /api/v1/applications`**: The endpoint will now validate the presence of `cover_letter_id` in the payload via the updated `ApplicationCreate` schema.
- **`application_service.create_application`**: The service function will be updated to handle the new `cover_letter_id` field.

---

## 8. Frontend Changes

### Page Updates
- **`frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`**: The `handleSubmit` function will be modified to include `cover_letter_id` in the payload sent to the backend.

---

## 9. Implementation Plan

**Phase 1: Backend Correction**
1.  **Task 1.1 (DB Schema):** Read `backend/app/models/application.py` to confirm the correct schema for the `applications` table.
2.  **Task 1.2 (DB Schema):** Update the `CREATE TABLE` statement for `applications` in `backend/init.sql` to match the SQLAlchemy model exactly.
3.  **Task 1.3 (API Model):** Modify the `ApplicationCreate` Pydantic schema in `backend/app/schemas/application.py` to include the `cover_letter_id` field.
4.  **Task 1.4 (Service Layer):** Update the `create_application` function in `backend/app/services/application_service.py` to correctly handle the `cover_letter_id` from the updated schema.

**Phase 2: Frontend Correction**
1.  **Task 2.1 (Frontend):** Modify the `handleSubmit` function in `frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx` to include the `cover_letter_id` in the payload when a cover letter is selected.

**Phase 3: Database Reset and Verification**
1.  **Task 3.1 (DB Reset):** Provide and execute the shell commands to stop Docker, remove the database volume, and restart the application.
2.  **Task 3.2 (E2E Testing):** Manually test the end-to-end application creation flow to confirm that the bug is resolved.

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Progress will be tracked by checking off the implementation plan tasks. The AI agent will report after each phase is complete.

---

## 11. File Structure & Organization

- **New Files:**
    - `.vibe/tasks/005_fix_application_db_and_payload.md`
- **Modified Files:**
    - `backend/init.sql`
    - `backend/app/schemas/application.py`
    - `backend/app/services/application_service.py`
    - `frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  Execute the **Backend Correction** phase first. The database and API models must be the source of truth.
2.  Proceed to the **Frontend Correction** phase.
3.  Finally, execute the **Database Reset** and provide clear instructions for verification.

### Communication Preferences
- Please present this task document for review before making any code changes.
- Announce the completion of each phase.

### Code Quality Standards
- Adhere strictly to existing code styles.

---

## 13. Second-Order Impact Analysis

### Impact Assessment
- **Potential Risks:** The primary risk is the destructive nature of removing the Docker volume. This is a necessary step to fix the schema, and since the feature is already broken, no data will be lost.
- **User Workflow:** The impact will be highly positive, unblocking a critical feature.
