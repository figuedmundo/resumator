# AI Task Planning Template - Frontend Refactoring

> **About This Template:** This is a systematic framework for planning and executing technical projects with AI assistance. Use this structure to break down complex features, improvements, or fixes into manageable, trackable tasks that AI agents can execute effectively.

---

## 1. Task Overview

### Task Title
**Title:** Refactor Frontend Pages and CSS to Improve Componentization and Style Reusability

### Goal Statement
**Goal:** To refactor the frontend of the Resumator application to improve its maintainability, reusability, and testability. This will be achieved by separating business logic from UI components, creating reusable components, establishing clear patterns for state management and data fetching, and consolidating duplicated CSS into a global, reusable system.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** React 18.2.0, Vite
- **Language:** JavaScript (ES6+)
- **UI & Styling:** Tailwind CSS 3.3.6, CSS Modules
- **Routing:** `react-router-dom` 6.20.1
- **API Communication:** `axios` 1.6.2
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
- **Key Architectural Patterns:** Component-based architecture, service layer for API calls.

### Current State
The current frontend implementation mixes presentation and business logic within the page components. Pages like `CoverLettersPage.jsx` and `ResumesPage.jsx` handle data fetching, state management, and user interactions directly. Additionally, CSS is duplicated across multiple `module.css` files, with inconsistent styling approaches (some use `@apply`, others use standard CSS). This leads to code duplication, inconsistency, and makes components difficult to test and maintain.

## 3. Context & Problem Definition

### Problem Statement
The tight coupling of UI and business logic in page components makes the codebase rigid and hard to scale. Common functionalities and styles are reimplemented across different pages, violating the DRY (Don't Repeat Yourself) principle. This increases the likelihood of bugs, creates visual inconsistencies, and makes the development process slower.

### Success Criteria
- [ ] Business logic is extracted from pages into custom hooks (e.g., `useCollection`).
- [ ] Reusable UI components are created for common elements (e.g., `PageHeader`, `Alert`, `ConfirmDialog`).
- [ ] Duplicated styles from `module.css` files are removed and replaced with global CSS classes defined in `globals.css`.
- [ ] Inline styles are eliminated, except where necessary for dynamic properties.
- [ ] Page components are simplified, focusing on layout and composition.
- [ ] The application's functionality and visual appearance remain consistent after the refactoring.

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Existing application in development.
- **Breaking Changes:** Should be avoided. Refactoring should not disrupt the user experience.
- **Data Handling:** No changes to the data model are expected.
- **User Base:** Developers working on the project.
- **Priority:** Stability and code quality are prioritized over speed.

---

## 5. Technical Requirements

### Functional Requirements
- The application must continue to fetch and display data correctly.
- User interactions (e.g., deletions, navigation) must function as before.
- UI must provide feedback for loading, success, and error states.

### Non-Functional Requirements
- **Performance:** No negative impact on performance.
- **Usability:** Consistent user experience.
- **Code Quality:** The refactored code should be modular, reusable, and follow a single, consistent styling approach.
- **Styling:** A clear, centralized styling system should be established, leveraging Tailwind CSS and global classes.

### Technical Constraints
- Must use the existing tech stack.
- Must maintain compatibility with the existing backend API.

---

## 6. Data & Database Changes

None.

---

## 7. API & Backend Changes

None.

---

## 8. Frontend Changes

### New Components
- **`hooks/useCollection.js`:** A generic hook to manage a collection of items (fetch, add, update, delete).
- **`components/common/Alert.jsx`:** A reusable component to display success and error messages, using the global `alert` classes.
- **`components/common/ConfirmDialog.jsx`:** A reusable confirmation dialog component.
- **`components/common/PageHeader.jsx`:** A reusable component for page headers.

### CSS Refactoring
- **`styles/globals.css`:** Enhance this file to become the single source of truth for common component styles. Consolidate duplicated styles from various `module.css` files into this global file using Tailwind's `@layer components`.
- **`*.module.css` files:** Remove duplicated styles that have been moved to `globals.css`. These modules should only contain styles that are truly specific to their respective components.

### Page Updates
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Dashboard/DashboardPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterEditorPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationDetail/ApplicationDetailPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/components/ApplicationForm.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/components/ApplicationWizard.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/ApplicationsPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/components/ApplicationList.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/components/ConfirmDialog.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/auth/Login/LoginPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/auth/Register/RegisterPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterListPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLettersPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/NotFound/NotFoundPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Profile/ProfilePage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/components/AIProgressIndicator.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/components/ResumeCustomizer.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/ResumeCustomizePage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/components/FileUploadZone.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/components/MarkdownToolbar.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/ResumeEditorPage_OLD.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Resumes/ResumesPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/PDFPreview.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateCard.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateSelector.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/ResumeViewPage.jsx`

---

## 9. Implementation Plan

1.  **CSS Refactoring:**
    *   Identify and consolidate duplicated styles from all `*.module.css` files under `frontend/src/pages` into `frontend/src/styles/globals.css`.
    *   Define clear, reusable component classes (e.g., `.page-header`, `.stat-card`, `.empty-state`) using `@apply`.
2.  **Create Common Components:**
    *   Create `frontend/src/components/common/PageHeader.jsx`.
    *   Create `frontend/src/components/common/Alert.jsx`.
    *   Move `frontend/src/pages/Applications/components/ConfirmDialog.jsx` to `frontend/src/components/common/ConfirmDialog.jsx` and generalize it.
3.  **Create `useCollection` Hook:**
    *   Create `frontend/src/hooks/useCollection.js`.
    *   Implement the generic logic for managing data collections (fetch, add, update, delete).
4.  **Refactor Pages and Components:**
    *   For each of the following files, apply the new hooks and common components, and replace specific styles with global CSS classes:
        *   `frontend/src/pages/Applications/components/ApplicationList.jsx`
        *   `frontend/src/pages/CoverLetters/CoverLettersPage.jsx`
        *   `frontend/src/pages/Resumes/ResumesPage.jsx`
        *   `frontend/src/pages/Dashboard/DashboardPage.jsx`
        *   `frontend/src/pages/ApplicationDetail/ApplicationDetailPage.jsx`
        *   `frontend/src/pages/ApplicationForm/components/ApplicationForm.jsx`
        *   `frontend/src/pages/ApplicationForm/components/ApplicationWizard.jsx`
        *   `frontend/src/pages/CoverLetters/CoverLetterEditorPage.jsx`
        *   `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`
        *   `frontend/src/pages/CoverLetters/CoverLetterListPage.jsx`
        *   `frontend/src/pages/ResumeCustomize/ResumeCustomizePage.jsx`
        *   `frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`
        *   `frontend/src/pages/ResumeView/ResumeViewPage.jsx`
5.  **Testing:**
    *   Thoroughly test all refactored pages to ensure everything works and looks as expected.

---

## 10. Task Completion Tracking

- [ ] CSS styles consolidated into `globals.css`.
- [ ] Common components (`PageHeader`, `Alert`, `ConfirmDialog`) created.
- [ ] `hooks/useCollection.js` created.
- [ ] `pages/Resumes/ResumesPage.jsx` refactored.
- [ ] `pages/CoverLetters/CoverLettersPage.jsx` refactored.
- [ ] `pages/Applications/components/ApplicationList.jsx` refactored.
- [ ] Manual testing passed.

---

## 11. File Structure & Organization

### New Files
- `frontend/src/hooks/useCollection.js`
- `frontend/src/components/common/Alert.jsx`
- `frontend/src/components/common/ConfirmDialog.jsx`
- `frontend/src/components/common/PageHeader.jsx`

### Modified Files
- `frontend/src/styles/globals.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Dashboard/DashboardPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterEditorPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterEditorPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterListPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterViewPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationDetail/ApplicationDetailPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationDetail/ApplicationDetailPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/ApplicationFormPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/ApplicationFormPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/components/ApplicationForm.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/components/ApplicationForm.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/components/ApplicationWizard.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ApplicationForm/components/ApplicationWizard.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/ApplicationsPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/ApplicationsPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/components/ApplicationList.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/components/ApplicationList.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/components/ConfirmDialog.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Applications/components/ConfirmDialog.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/auth/Login/LoginPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/auth/Login/LoginPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/auth/Register/RegisterPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/auth/Register/RegisterPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterGeneratePage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLetterListPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLettersPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/CoverLetters/CoverLettersPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Dashboard/DashboardPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/NotFound/NotFoundPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/NotFound/NotFoundPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Profile/ProfilePage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Profile/ProfilePage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/components/AIProgressIndicator.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/components/AIProgressIndicator.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/components/ResumeCustomizer.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/components/ResumeCustomizer.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/ResumeCustomizePage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeCustomize/ResumeCustomizePage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/components/FileUploadZone.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/components/FileUploadZone.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/components/MarkdownToolbar.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/components/MarkdownToolbar.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/ResumeEditorPage_OLD.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeEditor/ResumeEditorPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Resumes/ResumesPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/Resumes/ResumesPage.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/PDFPreview.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/PDFPreview.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateCard.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateCard.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateSelector.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateSelector.module.css`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/ResumeViewPage.jsx`
- `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/ResumeViewPage.module.css`


---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  Begin with the CSS refactoring.
2.  Create the new common components and the `useCollection` hook.
3.  Refactor one page at a time, ensuring both logic and styling are updated.
4.  Provide clear descriptions for each modification.

### Communication Preferences
- Summarize changes after each major step.
- Ask for confirmation before proceeding to the next step.

### Code Quality Standards
- Follow existing coding style.
- Use global CSS classes for all common styles.
- Add JSDoc comments to new hooks and components.

---

## 13. Second-Order Impact Analysis

### Impact Assessment
- **Positive:** A more consistent and maintainable frontend. Faster development of new features due to reusable components and hooks. A single source of truth for styling will prevent visual inconsistencies.
- **Negative:** Requires careful testing to avoid regressions. The initial time investment is significant, but the long-term benefits are substantial.
