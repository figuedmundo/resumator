# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-23
- **Project Name**: Resumator
- **Task ID**: 023

---

## 🎯 Task Definition

### Issue Summary
**Cover letter editor save is missing the cover letter version.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: `PUT /api/v1/cover-letters/{id}` is missing the `version` in the payload from `CoverLetterEditorPage`.

### User Impact
- **Severity**: High
- **Affected Users**: All users
- **Workaround Available**: No
- **Business Impact**: Users cannot save updated versions of their cover letters correctly, leading to potential data loss or versioning issues.

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

#### Coding Standards
```yaml
Frontend:
  - Component Style: Functional Components with Hooks (useState, useEffect, useContext, useMemo, useCallback)
  - Styling Approach: CSS Modules + TailwindCSS utility classes
  - File Naming: 
      * PascalCase for components (e.g., CoverLetterCard.jsx)
      * camelCase for utilities (e.g., apiService.js)
      * Component styles: ComponentName.module.css
  - Import Order: 
      1. React imports
      2. Third-party libraries (heroicons, clsx, axios, etc.)
      3. Local components
      4. Hooks and utilities
      5. Styles (module.css)
  - State Management: React Context API with custom hooks (useAuth)
  - Props Validation: PropTypes for all components
  - Naming Conventions:
      * Event handlers: handleEventName (e.g., handleDelete, handleSubmit)
      * Boolean props: isLoading, hasError, canEdit
      * State variables: descriptive names (e.g., coverLetters, isDeleting)
  - Code Organization:
      * One component per file
      * Extract complex logic into custom hooks
      * Keep components under 300 lines
  - Error Handling:
      * try-catch for async operations
      * Display user-friendly error messages
      * Log errors to console for debugging

Backend:
  - Code Style: PEP 8 compliant, formatted with Black
  - Python Version: 3.11+
  - API Pattern: RESTful with FastAPI
  - Error Handling: 
      * Custom exceptions (ValidationError, NotFoundError)
      * Proper HTTP status codes (200, 201, 204, 400, 401, 404, 422, 500)
      * Structured error responses with detail field
  - Validation: Pydantic schemas for all request/response models
  - Logging: Structured logging with structlog (INFO, WARNING, ERROR levels)
  - Documentation: 
      * Docstrings for all public methods (Google style)
      * Type hints for all function signatures
      * API endpoint descriptions in FastAPI decorators
  - Security:
      * JWT tokens with access + refresh pattern
      * Argon2/bcrypt password hashing
      * Rate limiting with Redis
      * Input validation and sanitization
      * CORS configured properly
  - Database:
      * SQLAlchemy ORM for models
      * Alembic for migrations
      * Relationship definitions with proper cascades
  - Background Tasks:
      * Celery for async operations
      * Redis as message broker
```

#### UI/UX Standards
```yaml
Design System:
  - Component Library: Custom components with shadcn/ui-inspired design
  - Color Palette:
      * Primary: Blue (#3b82f6, #2563eb, #1d4ed8) - Trust, professionalism
      * Secondary: Gray (#6b7280, #4b5563, #374151) - Neutral elements
      * Success: Green (#10b981) - Positive actions, confirmations
      * Warning: Yellow (#f59e0b) - Cautions, alerts
      * Danger: Red (#ef4444) - Destructive actions, errors
      * Background: White/Gray-50 (#ffffff, #f9fafb)
  - Typography:
      * Font Family: Inter (fallback: ui-sans-serif, system-ui)
      * Headings: font-semibold to font-bold
      * Body: font-normal
      * Sizes: text-sm, text-base, text-lg, text-xl, text-2xl
  - Spacing System: Tailwind default (4px base unit)
      * Consistent padding: p-4, p-6, p-8
      * Consistent margins: mb-4, mb-6, mb-8
      * Gaps in flex/grid: gap-2, gap-4, gap-6
  - Icons: HeroIcons (@heroicons/react/24/outline and /24/solid)
  - Borders: 
      * Border radius: rounded-lg (8px) for cards, rounded-md (6px) for buttons
      * Border colors: border-gray-200, border-gray-300
  - Shadows:
      * Card hover: shadow-sm → shadow-md transition
      * Modals: shadow-lg
      * Buttons: shadow-sm on hover
  
Interaction Patterns:
  - Loading States:
      * Component-level: LoadingSpinner component (sizes: sm, md, lg)
      * Button loading: Disable button + spinner + "Loading..." text
      * Skeleton screens for list loading
      * Page-level: Centered spinner with size="lg"
  - Error Display:
      * Toast notifications: Auto-dismiss after 3-5 seconds
      * Inline errors: Below form fields with red text
      * Error alerts: Red banner at top of page/section with icon
      * Modal alerts: For critical errors requiring acknowledgment
  - Confirmations:
      * ConfirmDialog component for destructive actions (delete, archive)
      * Two-button layout: Cancel (secondary) + Confirm (danger/primary)
      * Clear messaging: "Are you sure you want to delete [item]?"
      * Disable buttons while processing
  - Feedback:
      * Success messages: Green toast/banner, auto-dismiss 3 seconds
      * Error messages: Red alert, manual dismiss or auto-dismiss 5 seconds
      * Loading indicators: Spinners, disabled states, skeleton UI
      * Hover states: All interactive elements (shadow, background change)
      * Focus states: Visible outline for keyboard navigation
  - Animations:
      * Fade in: 0.3s ease-in-out for appearing elements
      * Slide up: 0.3s ease-out for modals
      * Smooth transitions: transition-colors, transition-shadow (duration-200)
      * Avoid jarring animations: Keep subtle and purposeful
  
Accessibility:
  - WCAG Level: AA compliance target
  - Keyboard Navigation: Required for all interactive elements
      * Tab order logical and intuitive
      * Focus visible with outline
      * Escape key closes modals/dialogs
      * Enter key submits forms
  - Screen Reader Support: Required
      * ARIA labels on icon-only buttons
      * ARIA-live regions for dynamic content
      * Semantic HTML (nav, main, article, button, etc.)
      * Alt text for images
  - Color Contrast:
      * Text: Minimum 4.5:1 for normal text, 3:1 for large text
      * Interactive elements: 3:1 minimum
      * Use color AND text/icons for status (not color alone)
  - Form Accessibility:
      * Labels associated with inputs
      * Error messages linked with aria-describedby
      * Required fields marked
      * Clear error states

Component Patterns:
  - Cards:
      * White background (bg-white)
      * Border (border border-gray-200)
      * Rounded corners (rounded-lg)
      * Shadow on hover (hover:shadow-md transition-shadow)
      * Padding (p-4 to p-6)
  - Buttons:
      * Primary: bg-blue-600 hover:bg-blue-700 text-white
      * Secondary: bg-gray-200 hover:bg-gray-300 text-gray-900
      * Danger: bg-red-600 hover:bg-red-700 text-white OR bg-red-100 hover:bg-red-200 text-red-700
      * Disabled: opacity-50 cursor-not-allowed
      * Size: px-3 py-2 (small), px-4 py-2 (default), px-6 py-3 (large)
      * Icons with text: Use flex items-center gap-2
  - Forms:
      * Input fields: border-gray-300 focus:ring-2 focus:ring-blue-500
      * Labels: font-medium text-gray-700 mb-1
      * Error states: border-red-500 text-red-600
      * Helper text: text-sm text-gray-500
  - Lists:
      * Grid layout for cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
      * List layout: divide-y divide-gray-200
      * Empty states: Centered with icon, title, description, CTA
  - Modals/Dialogs:
      * Backdrop: fixed inset-0 bg-black bg-opacity-50
      * Container: Centered, max-width, rounded-lg, shadow-xl
      * Header: font-semibold text-lg border-b
      * Footer: border-t with action buttons
      * Close button: Top-right with X icon
```

#### Testing Standards
```yaml
Frontend Testing:
  - Framework: Vitest + React Testing Library
  - Coverage Target: > 80% for critical components
  - Test Types:
      * Unit tests: Individual component behavior
      * Integration tests: Component interactions
      * User event tests: Simulating user actions
  - Testing Patterns:
      * Arrange-Act-Assert structure
      * Mock API calls with test data
      * Test user-visible behavior, not implementation
      * Use data-testid sparingly, prefer accessible queries
  - What to Test:
      * Component renders correctly with props
      * User interactions trigger expected callbacks
      * Loading/error states display properly
      * Form validation works
      * Conditional rendering based on props/state
  - What NOT to Test:
      * Implementation details (state names, function names)
      * Third-party library internals
      * CSS styles (rely on visual testing)

Backend Testing:
  - Framework: Pytest + Pytest-asyncio
  - Coverage Target: > 85% for services and API endpoints
  - Test Types:
      * Unit tests: Service methods, utilities
      * Integration tests: API endpoints with database
      * Security tests: Auth, permissions, input validation
  - Testing Patterns:
      * Use fixtures for database sessions
      * Mock external services (AI, storage)
      * Test happy path and error cases
      * Verify HTTP status codes and response structure
  - What to Test:
      * API endpoints return correct status codes
      * Request validation (Pydantic schemas)
      * Database operations (CRUD)
      * Business logic in services
      * Authentication and authorization
      * Error handling
  
Test Data:
  - Use factories/fixtures for consistent test data
  - Clear test database between tests
  - Use realistic but anonymized data
  - Cover edge cases (empty, null, invalid)
```

#### Documentation Standards
```yaml
Code Documentation:
  - JSDoc/Docstrings: Required for all public APIs and exported functions
  - Inline Comments: 
      * For complex logic only (why, not what)
      * Explain non-obvious decisions
      * Document workarounds and known issues
      * Keep comments up-to-date with code
  - README Files: 
      * Each major module/feature has README.md
      * Include: Purpose, Usage, Examples, API
  - API Documentation: 
      * FastAPI auto-generates OpenAPI docs
      * Add descriptions to endpoints and schemas
      * Document query parameters and request bodies
  - Component Documentation:
      * PropTypes with descriptions
      * Usage examples in comments
      * Document complex state management

Change Documentation:
  - Commit Messages: 
      * Format: "type: description" (e.g., "fix: resolve delete bug")
      * Types: fix, feat, refactor, test, docs, style, chore
      * Keep under 72 characters
      * Reference issue numbers when applicable
  - PR Descriptions: 
      * What: What was changed
      * Why: Why the change was needed
      * How: How it was implemented
      * Testing: How to verify the change
      * Screenshots for UI changes
  - Changelog: Keep CHANGELOG.md (if exists) updated with notable changes
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request

### Problem Understanding
**What**: When saving an edited cover letter from the `CoverLetterEditorPage`, the `version` of the cover letter is not being sent in the `PUT` request payload.
**Expected**: The `PUT` request to `/api/v1/cover-letters/{id}` should include the `version` number of the cover letter being edited.
**Actual**: The payload only contains `title` and `content`, but not `version`.
**Type**: Bug

---

### Step 1.2: Identify Affected Areas

### Affected Areas

**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend State Management

**Primary Files**:
- `frontend/src/pages/CoverLetters/CoverLetterEditorPage.jsx` - This component contains the save logic that needs to be fixed.

**Secondary Files** (May need updates):
- `frontend/src/services/secureApi.js` - To check how the `updateCoverLetter` function is implemented.

---

### Step 1.4: Root Cause Analysis

### Root Cause Analysis

**Symptom**: The backend does not update the correct version of the cover letter because the version number is missing from the payload.
**Immediate Cause**: The `handleSave` function in `CoverLetterEditorPage.jsx` constructs a payload for the `updateCoverLetter` API call that omits the `version` field.
**Root Cause**: The logic for saving the cover letter was not updated to include the version when the versioning feature was added. The cover letter state being tracked likely holds the version number, but it's not being included in the API call.

**Evidence**:
1. User report indicates the payload is `{"title": "...", "content": "..."}`.
2. The expected payload for updating a versioned resource should include a version identifier.

**Impact Chain**:
User edits a cover letter -> Clicks "Save" -> `handleSave` is called -> API call is made without `version` -> Backend receives an incomplete request -> A new "default" version might be created, or the update might be applied incorrectly, leading to data inconsistency.

---

### Step 1.5: Identify Dependencies and Side Effects

### Dependencies & Side Effects

**Upstream Dependencies** (What this code depends on):
- Backend API: `/api/v1/cover-letters/{id}` endpoint must be able to handle the `version` in the payload.
- Data Schema: The `coverLetter` state object in the frontend must contain the `version` number.

**Downstream Consumers** (What depends on this code):
- None. This is a specific page's save functionality.

**Potential Side Effects**:
- Low risk. The change is localized to the save function. If the backend expects the version, this will fix the issue. If not, the backend might ignore the extra field, but that seems unlikely given the context of versioning.

**Similar Patterns in Codebase**:
- Resume editing might have a similar pattern for saving versions. It would be good to check `ResumeEditor` page.

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria

### Success Criteria

**Functional Requirements**:
- [ ] When a user saves an edited cover letter, the `PUT` request to `/api/v1/cover-letters/{id}` must include the correct `version` number in the payload.
- [ ] The correct version of the cover letter is updated in the database.

**Technical Requirements**:
- [ ] The `handleSave` function in `CoverLetterEditorPage.jsx` correctly reads the `version` from its state and includes it in the API call.
- [ ] No console errors or warnings.
- [ ] All existing tests pass.

**Acceptance Tests**:
1. **Test**: Open a specific version of a cover letter in the editor, make a change, and click save.
   **Expected**: The network tab shows a `PUT` request to `/api/v1/cover-letters/{id}` with a JSON body containing `title`, `content`, and `version`. The backend should respond with a success status.

---

### Step 2.2: Determine Solution Approach

### Solution Approach

**Chosen Approach**: Proper Fix

**Rationale**:
- The fix is small and directly addresses the root cause.
- It aligns the frontend with the expected backend API contract for versioned documents.

**Trade-offs**:
- **Pros**: Corrects the behavior permanently and prevents data corruption.
- **Cons**: None.

---

### Step 2.3: Break Down into Steps

### Implementation Steps

#### Step 1: Update `handleSave` in `CoverLetterEditorPage.jsx`
**Priority**: Critical
**Estimated Time**: 30m

**Objectives**:
- [ ] Get the current `version` of the cover letter from the component's state.
- [ ] Include the `version` in the payload sent to the `updateCoverLetter` API call.

**Changes Required**:
- `frontend/src/pages/CoverLetters/CoverLetterEditorPage.jsx`: Modify the `handleSave` function.

**Deliverables**:
- [ ] Updated `CoverLetterEditorPage.jsx` file.

**Verification**:
- [ ] Manually test the save functionality and inspect the network request to confirm the `version` is present in the payload.

---

### Step 2.4: Risk Assessment

### Risk Assessment

#### Risk 1: Backend API does not expect the version field
**Likelihood**: Low
**Impact**: Medium
**Category**: Technical

**Potential Consequences**:
- The API call might fail if the backend schema does not expect the `version` field in the PUT request.

**Mitigation Strategy**:
- The user's report implies versioning is in place. We are assuming the backend is ready. If not, the fix will be ineffective but shouldn't break anything else. The backend will likely need a fix as well.

**Contingency Plan**:
- Revert the frontend change if it causes issues and coordinate with the backend team.
