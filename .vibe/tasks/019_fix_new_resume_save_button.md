# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-21
- **Project Name**: Resumator
- **Task ID**: 019_fix_new_resume_save_button

---

## 🎯 Task Definition

### Issue Summary
The "Save" button is disabled when creating a new resume, preventing users from saving their work.

### Reported Symptoms
List all observable problems:
- [x] The "Save" button on the `/resumes/new` page is always disabled.
- [x] Changes to a new resume are not being saved.
- [x] The auto-save functionality is interfering with the expected manual save flow for new resumes.

### User Impact
- **Severity**: High
- **Affected Users**: All users trying to create a new resume.
- **Workaround Available**: No
- **Business Impact**: Users cannot create new resumes, which is a core feature of the application.

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
**What**: The "Save" button on the new resume page (`/resumes/new`) is disabled, preventing users from creating new resumes.
**Expected**: The "Save" button should be enabled when there are unsaved changes to a new resume, and clicking it should save the resume. Auto-save should only be active for existing resumes.
**Actual**: The "Save" button is always disabled for new resumes.
**Type**: Bug (UI/UX)

### Step 1.2: Identify Affected Areas
**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend State Management

**Primary Files**:
- `frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`: This is the component responsible for rendering the new resume page.

### Step 1.3: Gather Project Context
I have already read the `ResumeEditorPage.jsx` file and have a good understanding of its implementation.

### Step 1.4: Root Cause Analysis
**Symptom**: The "Save" button is disabled for new resumes.
**Immediate Cause**: The `disabled` attribute of the "Save" button is tied to the `saveStatus` state variable. `saveStatus` is not being updated to "unsaved" for new resumes.
**Root Cause**: The `useEffect` hook that handles change detection and triggers auto-saving is not correctly differentiating between new and existing resumes. For new resumes, it should only update the `saveStatus` to enable manual saving, but it's attempting to trigger auto-saving, which is blocked by a condition in `handleAutoSave` that requires a `selectedVersionId`.

### Step 1.5: Identify Dependencies and Side Effects
The changes to be made are isolated to the `ResumeEditorPage.jsx` file. The fix must not break the auto-save functionality for existing resumes.

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
**Functional Requirements**:
- [x] The "Save" button on the `/resumes/new` page should be enabled when there are unsaved changes.
- [x] Clicking the "Save" button should save the new resume.
- [x] The auto-save functionality should be disabled for new resumes.
- [x] The auto-save functionality should continue to work for existing resumes.

**Technical Requirements**:
- [x] The `saveStatus` state variable should be updated correctly for both new and existing resumes.
- [x] The `handleManualSave` function should be called when the "Save" button is clicked for a new resume.

**UX Requirements**:
- [x] The user should be able to create a new resume.
- [x] The user should be able to edit an existing resume with auto-save enabled.

### Step 2.2: Determine Solution Approach
**Chosen Approach**: Proper Fix

**Rationale**: The logic for handling changes needs to be refactored to correctly handle the two different cases (new vs. existing resumes). A proper fix will make the code more readable and maintainable.

### Step 2.3: Break Down into Steps
1.  **Refactor the change detection `useEffect`**: Modify the `useEffect` hook to only set the `saveStatus` to "unsaved" for new resumes, and to set the `saveStatus` and trigger auto-save for existing resumes.
2.  **Refactor the `handleAutoSave` function**: Remove the `!selectedVersionId` condition from the `handleAutoSave` function to make it more robust.

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide
**File**: `frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`

**Required Changes**:
1.  In the `useEffect` hook that detects changes, add a condition to only trigger auto-save for existing resumes (`id !== 'new'`).
2.  In the `handleAutoSave` function, remove the `!selectedVersionId` condition.
---