# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-21
- **Project Name**: Resumator
- **Task ID**: 020_fix_ai_customization_instructions

---

## 🎯 Task Definition

### Issue Summary
The "Additional Instructions" provided by the user are not being taken into account when generating a cover letter using AI.

### Reported Symptoms
List all observable problems:
- [x] When generating a cover letter from `/cover-letters/generate`, the "Additional Instructions" are ignored.
- [x] When creating a new application from `/applications/new` and selecting AI customization for a cover letter, the "Additional Instructions" are ignored.

### User Impact
- **Severity**: High
- **Affected Users**: All users of the AI cover letter generation feature.
- **Workaround Available**: No
- **Business Impact**: This bug significantly degrades the value of the AI customization feature, which is a key selling point of the application.

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Resumator
Technology Stack:
  Frontend: React 18.2.0, Vite 7.1.5, TailwindCSS 3.3.6
  Backend: FastAPI, Python 3.11, PostgreSQL
  State Management: React Context API
  Testing: Vitest, React Testing Library, Pytest
  UI Components: HeroIcons, Custom Components
  Code Editor: CodeMirror 6
  Markdown: react-markdown, remark-gfm
  HTTP Client: Axios 1.6.2
  Utilities: clsx, date-fns, DOMPurify

Project Paths:
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
  Backend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend
  Frontend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend
  Docs: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/.vibe
  Templates: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/.vibe/templates
  TailwindConfig: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/tailwind.config.js
  ViteConfig: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/vite.config.mjs
```

### Project Standards & Guidelines
(omitted for brevity)

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
**What**: The "Additional Instructions" are not being used by the AI when generating cover letters.
**Expected**: The AI should take the "Additional Instructions" into account when generating a cover letter, in both the cover letter generation page and the new application page.
**Actual**: The "Additional Instructions" are ignored in both cases.
**Type**: Bug (Functionality)

### Step 1.2: Identify Affected Areas
**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend API Service
- [x] Backend API Endpoints
- [x] Backend Service Layer

**Primary Files**:
- `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`
- `frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`
- `backend/app/api/v1/cover_letters.py`
- `backend/app/services/ai_service.py`
- `backend/app/services/cover_letter_service.py`

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
**Functional Requirements**:
- [x] The "Additional Instructions" from the cover letter generation page should be used by the AI.
- [x] The "Additional Instructions" from the new application page should be used by the AI when customizing a cover letter.

**Technical Requirements**:
- [x] The frontend should correctly pass the "Additional Instructions" to the backend.
- [x] The backend should correctly receive and use the "Additional Instructions".

### Step 2.2: Determine Solution Approach
**Chosen Approach**: Proper Fix

**Rationale**: The issue is likely a data passing problem between the frontend and backend. A proper fix will involve tracing the data flow and ensuring the "Additional Instructions" are passed correctly at each step.

### Step 2.3: Break Down into Steps
1.  **Analyze Frontend**: Investigate how the "Additional Instructions" are passed from the UI to the API service in both `CoverLetterGeneratePage.jsx` and `ApplicationFormPage.jsx`.
2.  **Analyze Backend**: Investigate how the "Additional Instructions" are received by the API in `cover_letters.py` and how they are used by the `ai_service.py` and `cover_letter_service.py`.
3.  **Implement Fix**: Correct the data passing logic in the frontend and/or backend.
4.  **Test**: Verify that the "Additional Instructions" are correctly used in both the cover letter generation page and the new application page.
---