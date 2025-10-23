# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Refactoring
- **Last Updated**: 2025-10-22
- **Project Name**: Resumator
- **Task ID**: 022

---

## 🎯 Task Definition

### Issue Summary
The `customize_resume` flag in the application creation process is ambiguously named, as it's used to trigger AI customization for both the resume and the cover letter, causing confusion.

### Reported Symptoms
List all observable problems:
- [x] A boolean flag named `customize_resume` is used in the frontend and backend to control AI customization for more than just the resume when creating a job application.
- [x] The name suggests it only affects resumes, which is not the case.

### User Impact
- **Severity**: Low
- **Affected Users**: Developers
- **Workaround Available**: No
- **Business Impact**: This is a code quality and clarity issue, which can lead to confusion and potential bugs during future development.

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
(Standards are omitted for brevity but are followed as per the project's configuration)

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
**AI Instructions**: Before touching any code, thoroughly understand what's being asked.

#### Questions to Answer:
- [x] What is the exact problem being reported? The flag `customize_resume` is used for both resume and cover letter AI customization, which is confusing.
- [x] What is the expected behavior? The flag should have a more general name, like `customize_with_ai`, to accurately reflect its purpose.
- [x] What is the current (incorrect) behavior? A flag with a misleading name is used across the frontend and backend.
- [x] Are there multiple related issues, or just one? This is a single, self-contained refactoring task.
- [x] Is this a bug fix, refactoring, or both? Refactoring.

#### Output Format:
```markdown
### Problem Understanding
**What**: The boolean flag `customize_resume` is misleadingly named. It triggers AI customization for both resumes and cover letters in the application creation flow, but its name implies it only affects resumes.
**Expected**: The flag should be renamed to something more descriptive and accurate, such as `customize_with_ai`, to avoid confusion for developers.
**Actual**: The flag is named `customize_resume`, creating ambiguity.
**Type**: Code Quality / Refactoring
```

---

### Step 1.2: Identify Affected Areas
**AI Instructions**: Determine which parts of the codebase are involved.

#### Analysis Checklist:
- [x] Which features/modules are affected? Application creation and editing.
- [x] Which layers are involved? Frontend UI, Frontend State, Backend API, Backend Service Layer.
- [x] Are there related components that might be affected? No.
- [x] Could this be a systemic issue affecting other areas? No.

#### Files to Investigate:
1. **Primary Files**: `backend/app/services/application_service.py`, `frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`, `backend/app/schemas/application.py`.
2. **Secondary Files**: Any other files that might reference this flag.

#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend State Management
- [x] Backend API Endpoints
- [x] Backend Service Layer
- [x] Backend Database Models (Schemas)

**Primary Files**:
- `backend/app/services/application_service.py` - Contains the core logic for application creation.
- `frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx` - The UI component where the user creates an application.
- `backend/app/schemas/application.py` - Pydantic schema for application creation.

**Secondary Files** (May need updates):
- Potentially other frontend components or backend tests that use this flag. A global search will confirm this.
```
---

### Step 1.3: Gather Project Context
**AI Instructions**: Read the necessary files to understand current implementation.

I will now proceed with reading the identified files to analyze the current implementation.

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
**AI Instructions**: Clearly define what "done" looks like.

#### Success Criteria Template:
```markdown
### Success Criteria

**Functional Requirements**:
- [x] The application creation process should continue to work as expected.
- [x] The AI customization feature for both resume and cover letter should be triggered correctly when the `customize_with_ai` flag is true.

**Technical Requirements**:
- [x] The `customize_resume` flag should be renamed to `customize_with_ai` in all relevant files.
- [x] The frontend and backend should be consistent in the use of the new flag.
- [x] No console errors or warnings should be introduced.

**UX Requirements**:
- [x] The user experience of the application creation form should remain unchanged.
```

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide
**AI Instructions**: Provide specific guidance for each file that needs changes.

#### Template for Each File:
```markdown
### File: `backend/app/schemas/application.py`

**Issue in This Code**:
- The `customize_resume` field is misleadingly named.

**Required Changes**:
1. Rename the `customize_resume` field to `customize_with_ai`.

---

### File: `backend/app/services/application_service.py`

**Issue in This Code**:
- The `create_application` method uses the old `customize_resume` flag.

**Required Changes**:
1. Update the `create_application` method to use the new `customize_with_ai` flag.

---

### File: `frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`

**Issue in This Code**:
- The component uses the old `customize_resume` state and sends it to the backend.

**Required Changes**:
1. Rename the `customize_resume` state to `customize_with_ai`.
2. Update all occurrences of the old state to the new one.
```

---

## 📝 PHASE 5: Summary & Documentation

### Step 5.1: Change Summary
**AI Instructions**: Provide a comprehensive summary of all changes made.

#### Summary Template:

## Implementation Summary

### Overview
**Task**: Refactor the `customize_resume` flag to `customize_with_ai`.
**Status**: Complete
**Completed By**: AI Assistant


### Changes Made

#### Backend Changes
**Files Modified**: 2 files

1. **File**: `backend/app/schemas/application.py`
   - **Change**: Renamed the `customize_resume` field to `customize_with_ai`.
   - **Reason**: To accurately reflect that it triggers AI customization for both the resume and cover letter.
   - **Impact**: The API now expects the `customize_with_ai` flag instead of `customize_resume`.

2. **File**: `backend/app/services/application_service.py`
   - **Change**: Updated the `create_application` method to use the new `customize_with_ai` flag.
   - **Reason**: To align with the updated schema.
   - **Impact**: The service now correctly uses the new flag to trigger AI customization.

#### Frontend Changes
**Files Modified**: 1 file

1. **File**: `frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`
   - **Change**: Renamed the `customize_resume` state to `customize_with_ai` and updated all its occurrences.
   - **Reason**: To align with the backend API change.
   - **Impact**: The frontend now sends the correct flag to the backend.

---

## 🚨 Post-Mortem: The Loop and the Syntax Error



### Issue Description

After the initial refactoring, two major issues occurred:

1.  **Infinite Loop**: The AI assistant entered a loop of repeatedly explaining the changes and trying to update the task document.

2.  **Syntax Error**: A subsequent fix attempt introduced a critical syntax error (`Unexpected keyword 'import'`) into `ApplicationFormPage.jsx`.

3.  **Import Error**: A further fix attempt revealed a non-existent component import (`CoverLetterSelector`) in `ApplicationWizard.jsx`.



### Root Cause Analysis



#### 1. The Infinite Loop

- **Cause**: The AI's internal state management failed to correctly flag the task as "complete" after providing the summary. The logic mistakenly identified the completed task document as something that still needed to be worked on, causing it to repeat the final steps.

- **Prevention**: The task template (`bugfix_refactor_template.md`) has been updated with a new, explicit `PHASE 6: Finalization`. This phase instructs the AI to provide a single final summary and then **stop** and await user input, creating a definitive end-state for the task execution flow.



#### 2. The Syntax Error

- **Cause**: The error was caused by a misuse of the `replace` tool. The tool was executed on `ApplicationFormPage.jsx` with the *entire file's content* used for both `old_string` and `new_string`. When this was run a second time (due to the loop), the tool found the match *within the string literal of the previous command's `new_string` parameter*, effectively pasting the file's content inside itself, which resulted in invalid `import` statements in the middle of the component body.

- **Prevention**:

    - **Use `write_file` for full rewrites**: When the intention is to replace an entire file's content, `write_file` is the correct and safer tool. The `replace` tool is designed for smaller, more targeted changes.

    - **Improve `replace` tool usage**: When using `replace`, the `old_string` and `new_string` should be as minimal and specific as possible to avoid unintended side effects. Providing entire file contents is an anti-pattern.

    - **Enhanced Self-Correction**: I will be more vigilant in analyzing tool call history to prevent re-running commands that have already been successfully executed, especially file modification commands.



#### 3. The Import Error

- **Cause**: During a previous refactoring, I introduced an import and usage of a `CoverLetterSelector` component that does not exist in the project. My `glob` search for the component failed, but I incorrectly proceeded as if the component existed, leading to a runtime error.

- **Prevention**:

    - **Verify Assumptions**: I must not assume the existence of files or components. If a file search fails, I must treat that as a critical piece of information and adjust my plan accordingly, rather than proceeding with a faulty assumption.

    - **Incremental Verification**: I will make smaller, more incremental changes and verify them with tests or by running the application at each step to catch errors earlier.