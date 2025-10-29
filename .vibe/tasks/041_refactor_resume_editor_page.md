# AI Task Template: Frontend Atomic Refactoring (Resume Editor)

> **Purpose**: This document outlines the plan to refactor the monolithic `ResumeEditorPage.jsx` component into smaller, reusable "atomic" components, following the strategy established in the parent task `040_frontend_atomic_refactor_plan`.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Refactoring
- **Last Updated**: 2025-10-29
- **Project Name**: Resumator
- **Task ID**: 041_refactor_resume_editor_page

---

## 🎯 Task Definition

### Issue Summary
**The `ResumeEditorPage.jsx` component is a large, monolithic component (600+ lines) that violates the Single Responsibility Principle, leading to high technical debt and poor maintainability.**

### Reported Symptoms
This is a code quality and technical debt issue. The symptoms are observable in the codebase:
- [x] **Large Component File**: The component exceeds 600 lines of code.
- [x] **Bloated State**: The component manages over 15 distinct pieces of state using `useState`, making it difficult to reason about.
- [x] **High Component Complexity**: A single component is responsible for state management, data fetching, auto-saving, version control, file uploads, keyboard shortcuts, and rendering.
- [x] **Difficult Testing**: It is nearly impossible to write focused unit tests for individual pieces of functionality.

### Developer Impact
- **Severity**: High (in terms of technical debt)
- **Affected Users**: Developers
- **Workaround Available**: No (The workaround is to continue accumulating debt).
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

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Problem Understanding
**What**: The `ResumeEditorPage.jsx` component is a monolithic entity that handles all state, data fetching, business logic, and rendering for the entire resume editor feature.
**Expected**: A clean "container" component that composes smaller, specialized child components (like a dedicated header) and sources its logic and state from a custom hook (`useResumeEditor`).
**Actual**: A single 600+ line file with tightly interwoven logic and rendering, making it difficult to maintain, test, or extend.
**Type**: Code Quality / Technical Debt

### Step 1.2: Identify Affected Areas

**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend State Management (React Hooks)
- [x] Frontend API Service interactions

**Primary File for Refactoring**:
- `frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`

**Files to be Created**:
- `frontend/src/hooks/useResumeEditor.js`: To encapsulate all business logic and state management.
- `frontend/src/pages/ResumeEditor/components/ResumeEditorHeader.jsx`: To encapsulate the header UI and its controls.

### Step 1.3: Current Implementation Analysis

**File**: `frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx`
**Purpose**: Renders a full-page editor for creating and editing resumes in Markdown.
**Current Approach**: A single functional component that manages all state (content, title, loading, saving, versions, UI toggles), fetches all data from the API, handles auto-saving, processes file uploads, and renders the entire UI including the header, editor, preview, and modals.
**Issues Found**:
1.  **Massive State**: Over 15 `useState` hooks for various concerns.
2.  **Coupled Logic**: `useEffect` hooks mix data fetching, state updates, and side effects like timers.
3.  **Bloated Render Method**: The `return` block is over 200 lines long, with complex conditional rendering for different views and states.
4.  **No Separation of Concerns**: The component does everything, making it brittle and hard to debug.

### Step 1.4: Root Cause Analysis

**Symptom**: Large, unmaintainable component.
**Immediate Cause**: Adding features by expanding the existing component instead of composing it from smaller units.
**Root Cause**: Lack of a shared/common component library and a disciplined, composition-first approach during initial development. This is a natural outcome of rapid prototyping that now needs to be addressed.

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria

**Functional Requirements**:
- [ ] All existing functionality of the resume editor must be preserved.
- [ ] The application must look and behave identically to the user.

**Technical Requirements**:
- [ ] A new `useResumeEditor.js` hook is created and contains the majority of the business logic and state.
- [ ] A new `ResumeEditorHeader.jsx` component is created and used by the main page.
- [ ] The line count of `ResumeEditorPage.jsx` is significantly reduced (e.g., by > 60%).
- [ ] New components and the hook have dedicated Vitest tests with high coverage (>80%).
- [ ] All existing tests for the refactored page continue to pass.

### Step 2.2: Determine Solution Approach

**Chosen Approach**: **Refactor**

**Rationale**: The core application logic is sound. The primary issue is the lack of code reuse and separation of concerns. A systematic, iterative refactoring approach will deliver the most value with manageable risk, following the pattern already established.

### Step 2.3: Break Down into Steps

#### Step 1: Create `useResumeEditor` Hook
**Priority**: Critical
**Estimated Time**: 2 hours

**Objectives**:
- [ ] Create a new `useResumeEditor.js` hook in `frontend/src/hooks/`.
- [ ] Move all logic from `ResumeEditorPage.jsx` into this hook: state management, data fetching, auto-saving, version handling, file uploads, and keyboard shortcuts.
- [ ] The hook should return a clean, organized object with the necessary state and handlers for the component to use.

**Deliverables**:
- New file: `hooks/useResumeEditor.js`.
- Unit tests for the custom hook.

---

#### Step 2: Create `ResumeEditorHeader` Component
**Priority**: High
**Estimated Time**: 1 hour
**Dependencies**: Step 1

**Objectives**:
- [ ] Create a new directory: `frontend/src/pages/ResumeEditor/components`.
- [ ] Create a `ResumeEditorHeader.jsx` component.
- [ ] Move all JSX and logic related to the page header into this new component.
- [ ] The component will receive all its data and handlers as props from the parent.

**Deliverables**:
- New files: `pages/ResumeEditor/components/ResumeEditorHeader.jsx`.
- Unit tests for the new component.

---

#### Step 3: Refactor the `ResumeEditorPage` Component
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Step 1, 2

**Objectives**:
- [ ] Rewrite the `ResumeEditorPage.jsx` component.
- [ ] It should call the `useResumeEditor` hook to get its state and logic.
- [ ] The JSX should be declarative and composed of the new `ResumeEditorHeader` and existing child components (`MarkdownToolbar`, `CodeMirror`, etc.).
- [ ] Remove all local state management and logic that was moved to the hook.

**Deliverables**:
- A much smaller, cleaner `ResumeEditorPage.jsx` file.
- Updated integration tests for the page to ensure it still works as a whole.

---

## 🛠️ PHASE 3: Implementation Guidance

### Conceptual Implementation

#### New File: `frontend/src/hooks/useResumeEditor.js` (Conceptual)
```javascript
export const useResumeEditor = (resumeId) => {
  // All 15+ useState hooks go here...
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  // ...etc

  // All useEffect hooks for data loading and auto-saving go here...
  useEffect(() => {
    // Logic to load resume metadata and versions
  }, [resumeId]);

  // All handler functions go here...
  const handleManualSave = async () => { /* ... */ };
  const handleContentChange = (newContent) => { setContent(newContent); };

  // Return a clean interface
  return {
    state: { content, title, saveStatus, isLoading, isSaving, error, viewMode, versions, ... },
    handlers: { handleManualSave, handleContentChange, setTitle, setViewMode, ... }
  };
};
```

#### New File: `frontend/src/pages/ResumeEditor/components/ResumeEditorHeader.jsx` (Conceptual)
```javascript
const ResumeEditorHeader = ({ state, handlers }) => {
  // Destructure needed state and handlers
  const { title, saveStatus, isSaving, viewMode } = state;
  const { handleManualSave, setTitle, setViewMode } = handlers;

  return (
    <div className={styles.header}>
      {/* All header JSX from the original file goes here */}
      {/* Back button, Title input, Save status, View mode toggle, Action buttons */}
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <span>{saveStatus}</span>
      <button onClick={handleManualSave} disabled={isSaving}>Save</button>
    </div>
  );
};

export default ResumeEditorHeader;
```

#### Refactored File: `frontend/src/pages/ResumeEditor/ResumeEditorPage.jsx` (Conceptual)
```javascript
import { useResumeEditor } from '@/hooks/useResumeEditor';
import ResumeEditorHeader from './components/ResumeEditorHeader';
import MarkdownToolbar from './components/MarkdownToolbar';
import CodeMirror from '@uiw/react-codemirror';
// ... other imports

export default function ResumeEditorPage() {
  const { id } = useParams();
  const { state, handlers } = useResumeEditor(id);

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.pageContainer}>
      <ResumeEditorHeader state={state} handlers={handlers} />
      
      {state.error && <div className="error-alert">{state.error}</div>}

      {state.viewMode === 'edit' && <MarkdownToolbar onInsert={handlers.insertMarkdown} />}

      <div className={styles.mainContent}>
        {/* Logic for showing version sidebar */}
        <div className={styles.editorArea}>
          {state.viewMode === 'edit' ? (
            <CodeMirror
              value={state.content}
              onChange={handlers.handleContentChange}
              // ...other props
            />
          ) : (
            <ReactMarkdown>{state.content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
```

---
## 📝 PHASE 5: Summary & Documentation

### Change Summary

This task will refactor the `ResumeEditorPage.jsx` component by extracting all business logic and state management into a `useResumeEditor` custom hook, and by decomposing the UI into smaller pieces, starting with a `ResumeEditorHeader` component. This will align the component with the project's new atomic architecture, significantly reducing its complexity and improving maintainability and testability.
