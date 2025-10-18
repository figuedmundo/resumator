# AI Task Planning Template - Refactor Cover Letter Generation

---

## 1. Task Overview

### Task Title
**Title:** Refactor Cover Letter Generation Page

### Goal Statement
**Goal:** The goal is to refactor the `CoverLetterGeneratePage` to improve the user experience by replacing the multi-step wizard with a single-page interface, similar to the `ResumeCustomizePage`.

---

## 2. Strategic Analysis & Solution Options

The user has requested a refactor of the `CoverLetterGeneratePage` to be more like the `ResumeCustomizePage`. This is a clear direction, so no strategic analysis of alternative solutions is needed. The main challenge will be to create a new design that is both user-friendly and technically feasible.

### Analysis of Inputs:

*   **Select a resume:** Necessary. The AI needs the user's resume content to tailor the cover letter.
*   **Company name, Position title, Job description:** Necessary. These are essential for creating a targeted cover letter.
*   **Template:** Useful, but should be optional and presented in a non-intrusive way.
*   **Select a cover letter:** Useful, but should also be optional.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** React 18.2.0 (with Vite), FastAPI, Python 3.9+
- **Language:** JavaScript (ES6+), Python 3.9+
- **Database & ORM:** PostgreSQL with SQLAlchemy
- **UI & Styling:** Tailwind CSS, CSS Modules
- **Authentication:** JWT
- **Key Architectural Patterns:** Service Layer, Dependency Injection, Component-Based UI

### Current State
The `CoverLetterGeneratePage` is a 5-step wizard that is cumbersome and not visually appealing. The user has to go through multiple steps to generate a cover letter, which is a poor user experience.

---

## 4. Context & Problem Definition

### Problem Statement
The current `CoverLetterGeneratePage` uses a multi-step wizard that is not user-friendly. The user has requested a refactor to a single-page interface, similar to the `ResumeCustomizePage`, to streamline the process of generating a cover letter.

### Success Criteria
- [ ] The `CoverLetterGeneratePage` is refactored into a single-page interface.
- [ ] The new page has a layout and style similar to the `ResumeCustomizePage`.
- [ ] The user can select a resume and an optional existing cover letter.
- [ ] The user can input the company name, position title, and job description.
- [ ] The user can select an optional template.
- [ ] The generated cover letter is displayed on the same page.
- [ ] The new page is visually appealing and easy to use.

---

## 5. Development Mode Context

- **🚨 Project Stage:** Development
- **Breaking Changes:** The UI will change significantly, but the underlying functionality will remain the same.
- **Data Handling:** No data migration needed.
- **User Base:** All users.
- **Priority:** High.

---

## 6. Technical Requirements

### Functional Requirements
- The page must load all necessary data (resumes, cover letters, templates) on mount.
- The user must be able to select a resume.
- The user must be able to input job details.
- The user must be able to select an optional cover letter and template.
- The user must be able to trigger the AI generation process.
- The generated cover letter must be displayed on the page.

### Non-Functional Requirements
- **Performance:** The page should load quickly, and the AI generation should provide feedback to the user (e.g., a loading spinner).
- **Usability:** The page should be intuitive and easy to use.
- **Responsive Design:** The page should be responsive and work well on different screen sizes.

### Technical Constraints
- Must use existing components where possible.
- Must follow the existing coding style.

---

## 7. Data & Database Changes

None

---

## 8. API & Backend Changes

None

---

## 9. Frontend Changes

### New Components
- It may be necessary to create new components to support the single-page layout.

### Page Updates
- `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`: This page will be completely refactored.

### State Management
- The state management will be simplified as it will all be contained within a single component.

---

## 10. Implementation Plan

1.  **Rename Existing Page:** Rename `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx` to `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.old.jsx`.
2.  **Create New Page:** Create a new `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx` file.
3.  **Layout:** Create a two-column layout. The left column will be for inputs, and the right column will be for the output.
4.  **Inputs:**
    *   Add a dropdown to select a resume.
    *   Add a dropdown to select an optional cover letter.
    *   Add input fields for company name, position title, and job description.
    *   Add a dropdown to select an optional template.
5.  **Output:**
    *   Add a preview component to display the generated cover letter.
6.  **Data Fetching:** Fetch all necessary data in a `useEffect` hook on component mount.
7.  **AI Generation:**
    *   Add a button to trigger the AI generation.
    *   Display a loading spinner while the AI is working.
8.  **Styling:** Apply styles to match the `ResumeCustomizePage` and ensure the page is visually appealing.
9.  **Cleanup:** Once the new page is complete, delete the old `CoverLetterGeneratePage.old.jsx` file.

---

## 11. Task Completion Tracking

Progress will be tracked by commenting on the implementation plan tasks as they are completed.

---

## 12. File Structure & Organization

- **Files to create:**
    - `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx` (new version)
- **Files to rename:**
    - `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx` to `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.old.jsx`

---

## 13. AI Agent Instructions

### Implementation Workflow
- Follow the implementation plan to refactor the page.
- Pay close attention to the styling and layout to ensure a high-quality user experience.
- Reuse existing components where possible.

### Communication Preferences
- Provide updates after each major step in the implementation plan.

### Code Quality Standards
- Follow the existing coding style.
- Ensure there are no linting errors.

---

## 13. Second-Order Impact Analysis

### Impact Assessment
- This is a major UI refactor, so it will require careful testing to ensure that all functionality is preserved.
