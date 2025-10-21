m# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Refactoring
- **Last Updated**: 2025-10-19
- **Project Name**: Resumator
- **Task ID**: 016_refactor_cover_letter_generation_flow

---

## 🎯 Task Definition

### Issue Summary
Refactor the "Generate with AI" feature for cover letters to provide a preview-first workflow, preventing the creation of unwanted records.

### Reported Symptoms
- **Current Behavior**: The `POST /generate` endpoint immediately creates a new cover letter in the database before the user has reviewed or approved the content.
- **User Feedback**: This is not ideal. If the user dislikes the generated content and navigates away, an unwanted cover letter record remains.
- **Proposed Behavior**: The generation step should only fetch a preview of the AI-generated text. The cover letter should only be created when the user explicitly clicks a "Save" button.

### User Impact
- **Severity**: Medium
- **Affected Users**: All users of the AI cover letter generation feature.
- **Business Impact**: Improves user experience by giving them more control and prevents the accumulation of orphaned, unwanted data in the database.

---

## 🏗️ Project Context

(Project context from the template is assumed)

---

## 🔍 PHASE 1: Initial Analysis

### Problem Understanding
**What**: The current AI generation process for cover letters immediately saves the result to the database, which is not user-friendly.
**Expected**: The user should be able to preview the AI-generated content *before* it is saved. The save action should be a separate, explicit step.
**Actual**: A cover letter record is created as soon as the AI generation is complete.
**Type**: UX / Design Flaw

---

### Affected Areas

**Layers Involved**:
- [X] Frontend UI Components
- [X] Frontend API Service
- [X] Backend API Endpoints
- [X] Backend Service Layer

**Primary Files**:
- `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`: The UI component that needs its logic refactored.
- `frontend/src/services/api.js`: The frontend API service that will need a new function.
- `backend/app/api/v1/cover_letters.py`: The API layer where a new preview endpoint will be added.
- `backend/app/services/cover_letter_service.py`: The service layer that already contains the necessary preview logic.

---

### Root Cause Analysis

**Symptom**: Unwanted cover letters are created if the user abandons the AI generation flow after seeing the preview.
**Immediate Cause**: The frontend's `handleGenerate` function calls a backend endpoint (`POST /generate`) that both generates content and saves it to the database in one step.
**Root Cause**: The initial design of the feature coupled the generation and saving processes. A better design, as suggested by the user, is to decouple these actions to give the user a chance to review the content before creating a database record.

---

## 🎯 PHASE 2: Solution Planning

### Success Criteria

**Functional Requirements**:
- [X] Clicking "Generate with AI" will display a preview of the cover letter without saving it.
- [X] Clicking the "Save" button after a successful generation will create a single new cover letter record with the previewed content.
- [X] If the user navigates away after generating but before saving, no new cover letter is created.

**Technical Requirements**:
- [X] A new backend endpoint (`POST /api/v1/cover-letters/preview-generate`) will be created for generation-only previews.
- [X] The frontend will be updated to call this new endpoint for generation.
- [X] The frontend "Save" button will use the existing `POST /api/v1/cover-letters` endpoint to save the content from the preview.

### Solution Approach

**Chosen Approach**: Refactor

**Rationale**:
- This approach directly implements the user's improved workflow suggestion.
- It decouples the AI generation from the database transaction, which is a cleaner and more robust design.
- It leverages existing backend service logic (`generate_content`) for the new preview endpoint, minimizing new backend code.

---

### Implementation Steps

#### Step 1: Backend - Create Preview Endpoint
**Priority**: Critical
**Estimated Time**: 45m

**Objectives**:
- [ ] Add a new endpoint `POST /api/v1/cover-letters/preview-generate` to `backend/app/api/v1/cover_letters.py`.
- [ ] This endpoint should call the existing `generate_content` method in the `CoverLetterService`.
- [ ] It should return only the generated text in a simple JSON response, e.g., `{"content": "..."}`.

**Deliverables**:
- [ ] An updated `cover_letters.py` file with the new endpoint.

---

#### Step 2: Frontend - Update API Service
**Priority**: Critical
**Estimated Time**: 15m
**Dependencies**: Step 1

**Objectives**:
- [ ] Add a new function to `frontend/src/services/api.js` to call the new preview endpoint.

**Deliverables**:
- [ ] An updated `api.js` file with a new function, e.g., `generateCoverLetterPreview`.

---

#### Step 3: Frontend - Refactor Generation Page
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Step 2

**Objectives**:
- [ ] Modify `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`.
- [ ] The `handleGenerate` function should now call the new preview API function.
- [ ] The `handleSave` function should call the standard `createCoverLetter` API function, as it does now. This part of the logic is now correct under the new workflow.

**Deliverables**:
- [ ] An updated `CoverLetterGeneratePage.jsx` with the new, improved workflow.

**Verification**:
- [ ] Manually test the end-to-end flow to confirm the new behavior.
