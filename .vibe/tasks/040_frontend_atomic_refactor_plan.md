# AI Task Template: Frontend Atomic Refactoring

> **Purpose**: This document provides a systematic framework to refactor large, monolithic frontend components into smaller, reusable "atomic" components, reducing technical debt and improving the overall quality and maintainability of the Resumator frontend codebase.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Refactoring
- **Last Updated**: 2025-10-29
- **Project Name**: Resumator
- **Task ID**: 040_frontend_atomic_refactor_plan

---

## AI Please Remember
- We are focusing in the refactor, so the tests are on the refactored components and pages, because the old components have issues that we are going to solve in the moment of refactor

## 🎯 Task Definition

### Issue Summary
**The frontend codebase contains large, monolithic components with significant duplicated logic and UI structure, leading to high technical debt, poor maintainability, and slow development velocity.**

### Reported Symptoms
This is a code quality and technical debt issue, not a traditional bug. The symptoms are observable in the codebase:
- [x] **Large Component Files**: Many components, especially pages and complex forms, exceed 300-500 lines of code.
- [x] **Duplicated Logic & JSX**: Similar or identical code for form fields, loading states, and error display exists in multiple components.
- [x] **High Component Complexity**: Single components are responsible for state management, data fetching, validation, and rendering, violating the Single Responsibility Principle.
- [x] **Difficult Testing**: It is hard to write focused unit tests for small pieces of functionality as they are entangled within larger components.

### Developer Impact
- **Severity**: High (in terms of technical debt)
- **Affected Users**: Developers
- **Workaround Available**: No (The workaround is to continue accumulating debt, which is not sustainable).
- **Business Impact**: Increased development time for new features, higher likelihood of introducing new bugs, and a steeper learning curve for new developers.

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Resumator
Technology Stack:
  Frontend: React 18.2.0, Vite 7.1.5, TailwindCSS 3.3.6
  Backend: FastAPI, Python 3.11, PostgreSQL
  State Management: React Context API & React Hooks
  Testing: Vitest, React Testing Library
  HTTP Client: Axios 1.6.2
  Utilities: clsx, date-fns
```

### Project Standards & Guidelines
*(Referencing the project's established standards for component design, styling, and testing is critical for this task.)*

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Problem Understanding
**What**: The current frontend architecture relies on large, feature-specific components rather than small, reusable, generic ones. `ApplicationForm.jsx` is a prime example, containing over 400 lines of code with repetitive JSX for each form field and coupled logic for data fetching, validation, and state management.
**Expected**: A more "atomic" component architecture where complex views are composed of small, independent, and reusable components (e.g., `Input`, `Select`, `Card`, `FormField`).
**Actual**: Monolithic components handle everything, making code hard to reuse, test, and maintain.
**Type**: Code Quality / Technical Debt

### Step 1.2: Identify Affected Areas

**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend State Management (React Hooks)
- [x] Frontend API Service interactions

**Primary Candidates for Refactoring**:
- `frontend/src/pages/ApplicationForm/components/ApplicationForm.jsx`: **(Initial Target)** A large form with many repetitive fields.
- `frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`: Complex UI with many controls.
- `frontend/src/pages/CoverLetters/CoverLetterEditorPage.jsx`: Similar to the resume editor.
- `frontend/src/pages/Resumes/ResumesPage.jsx`: Contains list/card rendering logic that can be generalized.
- `frontend/src/pages/Applications/ApplicationsPage.jsx`: Similar list/card structure.

**Secondary Files** (Will be created or modified):
- `frontend/src/components/common/`: A new directory for shared, atomic components.
- `frontend/src/components/forms/`: A new directory for generic form components.
- `frontend/src/hooks/`: Existing directory where new custom hooks for logic extraction will be placed.

### Step 1.3: Current Implementation Analysis

**File**: `frontend/src/pages/ApplicationForm/components/ApplicationForm.jsx`
**Purpose**: Renders a form to create or edit a job application.
**Current Approach**: A single functional component that manages all state (form data, errors, multiple loading states), fetches all required data (resumes, versions), performs validation, and renders the entire form using repetitive JSX blocks for each field.
**Issues Found**:
1.  **Repetitive JSX**: The structure for a label, input, and error message is repeated for every single form field.
2.  **Coupled Logic**: Data fetching, validation, and submission logic are all tightly coupled within the component.
3.  **Bloated State**: The component manages at least 6-7 different pieces of state, making it difficult to follow.
4.  **Specialized Logic in Place**: The resume and version dropdowns have their own loading indicators and conditional logic embedded directly in the form's JSX.

**Key Code Snippets (Problem examples)**:
```javascript
// 1. Repetitive structure for each input field
<div className={styles.fieldGroup}>
  <label htmlFor="company" className={clsx(styles.label, styles.labelRequired)}>
    Company
  </label>
  <input
    type="text"
    id="company"
    name="company"
    value={formData.company}
    onChange={handleChange}
    className={clsx(
      styles.input,
      errors.company ? styles.inputError : styles.inputDefault
    )}
    placeholder="Enter company name"
    required
  />
  {errors.company && (
    <p className={styles.errorText}>{errors.company}</p>
  )}
</div>

// 2. Complex, specialized select with embedded loading logic
<div className={clsx(styles.resumeSelector, loadingResumes && styles.resumeSelectorLoading)}>
    <select ... disabled={loadingResumes}>
        ...
    </select>
    {loadingResumes && (
        <div className={styles.loadingOverlay}>
        <LoadingSpinner size="sm" />
        </div>
    )}
</div>
```

### Step 1.4: Root Cause Analysis

**Symptom**: Large, unmaintainable components.
**Immediate Cause**: Adding features by expanding existing components instead of composing them from smaller units.
**Root Cause**: Lack of a shared/common component library and a disciplined, composition-first approach during initial development. This is a natural outcome of rapid prototyping that now needs to be addressed to ensure future scalability.

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria

**Functional Requirements**:
- [ ] All existing functionality of the refactored components must be preserved.
- [ ] The application must look and behave identically to the user.

**Technical Requirements**:
- [ ] A new `frontend/src/components/forms` directory is created for atomic form components (`Input`, `Select`, `Textarea`, `FormGroup`).
- [ ] The `ApplicationForm` component is refactored to be composed of these new atomic components.
- [ ] The line count of `ApplicationForm.jsx` is significantly reduced (e.g., by > 50%).
- [ ] Logic is extracted into one or more custom hooks (e.g., `useApplicationForm`).
- [ ] New atomic components are generic and reusable.
- [ ] New components have dedicated Vitest tests with high coverage (>80%).
- [ ] All existing tests for the refactored pages continue to pass.

### Step 2.2: Determine Solution Approach

**Chosen Approach**: **Refactor**

**Rationale**: A full "Redesign" is not necessary. The core application logic is sound. The primary issue is the lack of code reuse and separation of concerns at the component level. A systematic, iterative refactoring approach will deliver the most value with manageable risk. We will tackle one component at a time.

### Step 2.3: Break Down into Steps

This will be an iterative process. We will start with `ApplicationForm.jsx` as the pilot.

#### **Iteration 1: Refactor `ApplicationForm.jsx`**

---

#### Step 1: Create Generic Form Components
**Priority**: Critical
**Estimated Time**: 2 hours

**Objectives**:
- [ ] Create a new directory: `frontend/src/components/forms`.
- [ ] Create a `FormGroup.jsx` component to provide consistent layout and spacing.
- [ ] Create a generic `Input.jsx` component that handles text, date, etc. It will manage its own label, error display, and required indicator.
- [ ] Create a generic `Textarea.jsx` component.
- [ ] Create a generic `Select.jsx` component that accepts an `options` array and handles loading/disabled states.

**Deliverables**:
- New files: `forms/FormGroup.jsx`, `forms/Input.jsx`, `forms/Textarea.jsx`, `forms/Select.jsx`.
- Unit tests for each new component.

---

#### Step 2: Create Specialized Selector Components
**Priority**: High
**Estimated Time**: 1.5 hours
**Dependencies**: Step 1

**Objectives**:
- [ ] Create a `ResumeSelect.jsx` component that fetches the list of resumes and uses the generic `Select` component to render them.
- [ ] Create a `ResumeVersionSelect.jsx` component that takes a `resumeId`, fetches the relevant versions, and renders them using the generic `Select` component.

**Deliverables**:
- New files: `components/applications/ResumeSelect.jsx`, `components/applications/ResumeVersionSelect.jsx`.
- Unit tests for these new components.

---

#### Step 3: (Optional but Recommended) Create `useApplicationForm` Hook
**Priority**: High
**Estimated Time**: 2 hours

**Objectives**:
- [ ] Create a new `useApplicationForm.js` hook in `frontend/src/hooks/`.
- [ ] Move all logic from `ApplicationForm.jsx` into this hook: state management, data fetching (`loadResumes`, `loadApplication`), validation (`validateForm`), and submission (`handleSubmit`).
- [ ] The hook should return the necessary state and handlers for the component to use.

**Deliverables**:
- New file: `hooks/useApplicationForm.js`.
- Unit tests for the custom hook.

---

#### Step 4: Refactor the `ApplicationForm` Component
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Step 1, 2, 3

**Objectives**:
- [ ] Rewrite the `ApplicationForm.jsx` component.
- [ ] It should now call the `useApplicationForm` hook to get its state and logic.
- [ ] The JSX should be declarative and composed of the new `FormGroup`, `Input`, `Textarea`, `ResumeSelect`, and `ResumeVersionSelect` components.
- [ ] Remove all local state management and logic that was moved to the hook.

**Deliverables**:
- A much smaller, cleaner `ApplicationForm.jsx` file.
- Updated integration tests for the form to ensure it still works as a whole.

---

### Step 2.5: Create Implementation Checklist

#### Before Starting:
- [ ] Create a new feature branch: `refactor/atomic-frontend-components`.
- [ ] Set up a new directory `frontend/src/components/forms`.

#### During Implementation:
- [ ] Create one component at a time, including its test file.
- [ ] Ensure new components are fully generic and receive all data and callbacks as props.
- [ ] Use `clsx` for conditional classes as is the standard.
- [ ] Adhere to existing styling patterns (`styles.module.css`).

#### Testing:
- [ ] Write unit tests for every new component and hook.
- [ ] Test for props handling, user events, and loading/error states.
- [ ] After refactoring `ApplicationForm`, run the entire frontend test suite to catch any regressions.
- [ ] Manually test the Create and Edit Application flows in the browser.

---

## 🛠️ PHASE 3: Implementation Guidance

### File-by-File Implementation Guide (Example)

#### New File: `frontend/src/components/forms/Input.jsx`

**Purpose**: A reusable text input component for forms.

**Proposed Code**:
```javascript
import clsx from 'clsx';
import styles from './Forms.module.css'; // A new shared CSS module for forms

const Input = ({ label, name, type = 'text', value, onChange, error, required, placeholder, disabled }) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={clsx(styles.label, required && styles.labelRequired)}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={clsx(styles.input, error && styles.inputError)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default Input;
```

**Testing This Change**:
- Write a Vitest test for `Input.jsx`.
- Test that it renders the label, input, and error message correctly.
- Test that the `onChange` callback is fired.
- Test that the `disabled` and `required` attributes are applied.

#### Refactored File: `frontend/src/pages/ApplicationForm/components/ApplicationForm.jsx`

**Current Code**: *(See analysis above)*

**Required Changes**:
1.  Remove all `useState` hooks and logic functions.
2.  Import and call the `useApplicationForm` hook.
3.  Import the new form components.
4.  Rewrite the JSX to be a clean composition of the new components.

**Updated Code (Conceptual)**:
```javascript
import { useApplicationForm } from '@/hooks/useApplicationForm';
import Input from '@/components/forms/Input';
import Textarea from '@/components/forms/Textarea';
import ResumeSelect from '@/components/applications/ResumeSelect';
// ... other imports

const ApplicationForm = ({ applicationId, onSuccess }) => {
  const {
    formData,
    errors,
    loading,
    loadingResumes,
    resumes,
    handleChange,
    handleSubmit,
  } = useApplicationForm(applicationId, onSuccess);

  if (loadingResumes) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && <div className="error-alert">{errors.general}</div>}
      
      <Input
        label="Company"
        name="company"
        value={formData.company}
        onChange={handleChange}
        error={errors.company}
        required
      />
      
      <Input
        label="Position"
        name="position"
        value={formData.position}
        onChange={handleChange}
        error={errors.position}
        required
      />

      <Textarea
        label="Job Description"
        name="job_description"
        value={formData.job_description}
        onChange={handleChange}
        error={errors.job_description}
      />

      <ResumeSelect
        value={formData.resume_id}
        onChange={handleChange}
        error={errors.resume_id}
        required
      />
      
      {/* ... other fields ... */}

      <div className="actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Application'}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
```

---
## 📝 PHASE 5: Summary & Documentation

### Change Summary

This task initiates a strategic refactoring of the Resumator frontend. The plan is to systematically dismantle large, monolithic components, starting with `ApplicationForm.jsx`, and rebuild them by composing smaller, single-purpose, reusable components. This will be achieved by creating a new library of generic form controls and extracting business logic into custom hooks.

The immediate goal is to refactor `ApplicationForm.jsx`. The long-term goal is to apply this pattern across the entire application, significantly reducing technical debt and improving developer velocity and code quality.






##  PHASE 6: AI Report of progress 

### Iteration 1: Refactor `ApplicationForm.jsx` - ✅ **Completed**

This iteration focused on refactoring the `ApplicationForm` component, which was a large, monolithic component with significant technical debt. The refactoring was successful and the component is now much cleaner, more maintainable, and easier to test.

#### Work Completed

*   **Created Generic Form Components**: A new set of reusable, atomic form components were created in `frontend/src/components/forms`:
    *   `Input.jsx`
    *   `Textarea.jsx`
    *   `Select.jsx`
    *   `FormGroup.jsx`
*   **Created Specialized Selector Components**: New components were created in `frontend/src/components/applications` to handle the specific logic for selecting resumes and resume versions:
    *   `ResumeSelect.jsx`
    *   `ResumeVersionSelect.jsx`
*   **Created `useApplicationForm` Hook**: The business logic of the `ApplicationForm` was extracted into a new custom hook in `frontend/src/hooks/useApplicationForm.js`.
*   **Refactored `ApplicationForm`**: The `ApplicationForm` component was rewritten to use the new hook and atomic components.
*   **Fixed a lot of tests**: The tests for the new components and the `ApplicationForm` were created and fixed, ensuring that the refactoring was successful and did not introduce any regressions.

#### Testing

To test the refactored `ApplicationForm` component, you can run the following command:

```bash
npm test -- --run src/__tests__/pages/ApplicationForm/components/ApplicationForm.test.jsx
```

This will run the tests for the `ApplicationForm` component, which should all pass.

To manually test the changes, you can run the application and navigate to the "Create Application" page. The form should look and behave identically to the user.

---