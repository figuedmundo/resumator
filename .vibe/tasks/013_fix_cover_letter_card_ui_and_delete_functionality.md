# AI Task: Fix Cover Letter Card UI and Delete Functionality

> **Purpose**: This document outlines the analysis and plan to fix bugs and refactor the `CoverLetterCard` component to align with project standards.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-19
- **Project Name**: Resumator
- **Task ID**: 013

---

## 🎯 Task Definition

### Issue Summary
The `CoverLetterCard` component is visually outdated, uses a legacy confirmation dialog, and has a bug that prevents successful deletion, causing a 422 API error.

### Reported Symptoms
- [x] Symptom 1: The UI of the `CoverLetterCard` does not match the application's modern design standards (e.g., `ResumeCard`).
- [x] Symptom 2: Clicking the "Delete" button triggers a native browser `alert()` for confirmation instead of the app's standard confirmation modal.
- [x] Symptom 3: Confirming deletion results in a 422 Unprocessable Entity error in the browser console, with the network request going to `DELETE /api/v1/cover-letters/undefined`.

### User Impact
- **Severity**: High
- **Affected Users**: All users
- **Workaround Available**: No
- **Business Impact**: Prevents users from managing their cover letters, leading to a frustrating user experience and data clutter.

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Resumator
Technology Stack:
  Frontend: React 18, Vite, TailwindCSS
  Backend: FastAPI, Python 3.9+, PostgreSQL
  State Management: React Hooks & Context
  Testing: vitest, Pytest

Project Paths:
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
  Backend: ./backend
  Frontend: ./frontend

```

### Project Standards & Guidelines

#### Coding Standards
```yaml
Frontend:
  - Component Style: Functional Components with Hooks
  - Styling Approach: Tailwind CSS
  - File Naming: PascalCase for components
  - State Management: Context API / Custom Hooks
```

#### UI/UX Standards
```yaml
Design System:
  - Component Library: Custom components with Tailwind CSS
  - Icons: Heroicons
  
Interaction Patterns:
  - Confirmations: Custom modal dialogs (`ConfirmDialog`) for destructive actions.
  - Feedback: Toast notifications for success/error messages.
```

---

## 🔍 PHASE 1: Initial Analysis

### Problem Understanding
**What**: The delete functionality on the `CoverLetterCard` is broken due to incorrect data being passed, and its UI/UX is inconsistent with the rest of the application.
**Expected**: Clicking "Delete" should open a modern confirmation modal. On confirmation, the correct cover letter ID should be sent to the API, and the item should be removed from the list. The card's styling should match other cards in the app.
**Actual**: Clicking "Delete" shows a browser alert. Confirming sends `undefined` as the ID to the API, which returns a 422 error. The UI is outdated.
**Type**: Bug / UX / Code Quality

### Affected Areas

**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend State Management

**Primary Files**:
- `frontend/src/components/CoverLetters/CoverLetterCard.jsx`: Contains the outdated UI and flawed delete logic.
- `frontend/src/pages/CoverLetters/CoverLettersPage.jsx`: Manages state and handlers for the delete process.
- `frontend/src/components/CoverLetters/CoverLetterList.jsx`: Passes props from the page to the card.

### Current Implementation Analysis

**File**: `frontend/src/components/CoverLetters/CoverLetterCard.jsx`
**Purpose**: Displays a single cover letter with action buttons.
**Current Approach**: The card has its own `handleDelete` function that shows a `window.confirm` dialog. It then calls the `onDelete` prop with `coverLetter.id`.
**Issues Found**:
1.  `window.confirm` is used instead of the project's `ConfirmDialog`.
2.  The `onDelete` call is incorrect; it passes an `id` instead of the full object the parent page expects.

**File**: `frontend/src/pages/CoverLetters/CoverLettersPage.jsx`
**Purpose**: Renders the list of cover letters and handles CRUD operations.
**Current Approach**: It defines a `handleDeleteClick` function that expects a full `coverLetter` object to set in state for the `ConfirmDialog`. This function is passed as the `onDelete` prop to the list and card.
**Issues Found**: The handler receives an `id` instead of an object, causing `deleteConfirm.id` to be `undefined` in the final API call.

### Root Cause Analysis

**Symptom 1**: `DELETE .../undefined` returns 422.
*   **Immediate Cause**: The `deleteCoverLetter` API function is called with `undefined`.
*   **Root Cause**: There is a prop contract mismatch.
    1.  `CoverLettersPage` passes `handleDeleteClick` as the `onDelete` prop. This handler expects the entire `coverLetter` object: `handleDeleteClick(coverLetter)`.
    2.  `CoverLetterCard` calls this prop with only the ID: `onDelete(coverLetter.id)`.
    3.  Therefore, `handleDeleteClick` receives an ID, not an object. The state `deleteConfirm` is set to the ID (e.g., `123`).
    4.  The final confirmation handler, `handleDeleteConfirm`, tries to access `deleteConfirm.id`, which is `123.id`, resulting in `undefined`.

**Symptom 2**: `alert()` is shown.
*   **Root Cause**: The `CoverLetterCard` component has a hardcoded `window.confirm()` call inside its `handleDelete` function, which is a legacy pattern inconsistent with the project's UX standards.

**Symptom 3**: Outdated UI.
*   **Root Cause**: The component uses a separate CSS module (`CoverLetterCard.module.css`) and hardcoded emoji icons instead of leveraging the project's Tailwind CSS utility classes and the Heroicons library.

---

## 🎯 PHASE 2: Solution Planning

### Success Criteria

**Functional Requirements**:
- [ ] Clicking the "Delete" button on a `CoverLetterCard` must open the `ConfirmDialog` modal.
- [ ] Confirming the deletion must trigger a `DELETE` request to `/api/v1/cover-letters/{id}` with a valid integer ID.
- [ ] The cover letter must be removed from the UI upon successful deletion.
- [ ] A success toast/message should appear after deletion.

**Technical Requirements**:
- [ ] The `window.confirm` call must be removed from `CoverLetterCard.jsx`.
- [ ] The `onDelete` prop passed to `CoverLetterCard` must correctly receive the full `coverLetter` object.
- [ ] No 422 errors related to this action should appear in the console.

**UX Requirements**:
- [ ] The `CoverLetterCard`'s appearance (layout, buttons, icons) must be updated to match the style of other cards in the application (e.g., `ResumeCard`).
- [ ] Emoji icons must be replaced with SVGs from the Heroicons library.

### Solution Approach

**Chosen Approach**: **Refactor**

**Rationale**:
- A simple "Proper Fix" would solve the `undefined` ID bug, but it wouldn't address the inconsistent UI and UX.
- A "Refactor" approach allows us to fix the bug while simultaneously aligning the component with the established architecture and design system, reducing technical debt and improving maintainability.

### Implementation Steps

#### Step 1: Refactor `CoverLetterCard` Logic
**Priority**: Critical
**Objectives**:
- [ ] Remove the internal `handleDelete` logic from `CoverLetterCard`.
- [ ] The "Delete" button's `onClick` should directly call the `onDelete` prop, passing the entire `coverLetter` object.
- [ ] Remove the `window.confirm` dialog.
- [ ] Remove the `isDeleting` state, as the parent component will now manage this.

**Changes Required**:
- `frontend/src/components/CoverLetters/CoverLetterCard.jsx`

#### Step 2: Update `CoverLetterCard` UI/Style
**Priority**: High
**Dependencies**: Step 1
**Objectives**:
- [ ] Replace the component's reliance on `CoverLetterCard.module.css` with Tailwind CSS classes.
- [ ] Update the HTML structure to match the project's card component standard.
- [ ] Replace hardcoded emoji icons (`👁️`, `✏️`, `🗑️`) with appropriate components from the Heroicons library.
- [ ] Ensure the new styling is responsive.

**Changes Required**:
- `frontend/src/components/CoverLetters/CoverLetterCard.jsx`
- Delete `frontend/src/components/CoverLetters/CoverLetterCard.module.css`.

#### Step 3: Verify Parent Component Integration
**Priority**: Medium
**Dependencies**: Step 1
**Objectives**:
- [ ] Ensure `CoverLettersPage.jsx` and `CoverLetterList.jsx` correctly pass the `handleDeleteClick` function down to the card.
- [ ] Verify that the `ConfirmDialog` in `CoverLettersPage.jsx` receives the correct `coverLetter` object and displays the correct information.

**Changes Required**:
- No changes are expected in `CoverLettersPage.jsx` or `CoverLetterList.jsx`, but they must be reviewed to confirm the data flow is correct after the card is refactored.

### Implementation Checklist

#### During Implementation:
- [ ] Follow the step-by-step plan.
- [ ] **Step 1**: Modify the `CoverLetterCard` to simplify its delete handler.
- [ ] **Step 2**: Refactor the `CoverLetterCard` JSX and styling using Tailwind CSS and Heroicons.
- [ ] Delete the old CSS module file.
- [ ] **Step 3**: Manually test the entire delete flow: click button, see modal, confirm, and verify network request and UI update.

#### Code Quality:
- [ ] No hardcoded styles; use Tailwind CSS.
- [ ] Component logic is simplified and follows the "dumb component" pattern.
- [ ] No console errors or warnings.
