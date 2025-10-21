# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-20
- **Project Name**: Resumator
- **Task ID**: 017

---

## 🎯 Task Definition

### Issue Summary
**Multiple bugs exist in the cover letter and application workflow, causing incorrect versioning display, missing data in application details, and state-related issues in the application edit form.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: A newly created cover letter appears as "v1", but when selecting it in the application form, it is labeled as "version 16 (Original)".
- [x] Symptom 2: After creating an application with a specific cover letter version, the application details page only displays the cover letter ID, not the selected version details.
- [x] Symptom 3: When editing an existing application, the form does not pre-select the previously saved cover letter and version.

### User Impact
- **Severity**: High
- **Affected Users**: All users
- **Workaround Available**: No
- **Business Impact**: These bugs severely degrade the user experience and functionality of the core application tracking feature, making it unreliable and confusing for users to manage their job applications.

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
**AI Instructions**: Before touching any code, thoroughly understand what's being asked.

#### Questions to Answer:
- [x] What is the exact problem being reported?
- [x] What is the expected behavior?
- [x] What is the current (incorrect) behavior?
- [x] Are there multiple related issues, or just one?
- [x] Is this a bug fix, refactoring, or both?

#### Output Format:
```markdown
### Problem Understanding
**What**: The application and cover letter features are not correctly handling cover letter versions, leading to data inconsistencies and a broken user experience during application creation, viewing, and editing.
**Expected**: 
1. Cover letter versions should be consistently numbered and labeled.
2. The application details page should display the full information of the selected cover letter version.
3. The application edit form should be pre-populated with the currently saved application data, including the selected cover letter and version.
**Actual**: 
1. A new cover letter is "v1" but appears as "version 16 (Original)" in dropdowns.
2. The application details page shows only a cover letter ID.
3. The application edit form is empty for the cover letter selection.
**Type**: Bug / UX / Data Integrity
```

---

### Step 1.2: Identify Affected Areas
**AI Instructions**: Determine which parts of the codebase are involved.

#### Analysis Checklist:
- [x] Which features/modules are affected? (Applications, Cover Letters)
- [x] Which layers are involved? (UI, API, Database, Service)
- [x] Are there related components that might be affected? (Yes, anything consuming application or cover letter data)
- [x] Could this be a systemic issue affecting other areas? (Yes, the versioning logic might be flawed, but the user states resume versioning is fine).

#### Files to Investigate:
1. **Primary Files**: Files directly mentioned or obviously related
2. **Secondary Files**: Dependencies and consumers of primary files
3. **Configuration Files**: Settings that might affect behavior
4. **Test Files**: Existing tests that might need updates

#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Frontend UI Components
- [x] Frontend State Management
- [x] Frontend API Service
- [x] Backend API Endpoints
- [x] Backend Service Layer
- [x] Backend Database Models

**Primary Files**:
- `frontend/src/pages/ApplicationForm/ApplicationForm.jsx`: Logic for creating and editing applications.
- `frontend/src/pages/ApplicationDetail/ApplicationDetail.jsx`: Displays the details of a single application.
- `frontend/src/components/Applications/CoverLetterSelector.jsx`: Dropdown component for selecting cover letters and their versions.
- `backend/app/api/v1/applications.py`: API endpoints for applications (create, get, update).
- `backend/app/services/application_service.py`: Business logic for applications.
- `backend/app/schemas/application.py`: Pydantic schemas for application data.
- `backend/app/services/cover_letter_service.py`: Business logic for cover letters, especially versioning.

**Secondary Files** (May need updates):
- `frontend/src/services/api.js`: Frontend API service.
- `frontend/src/hooks/useAuth.jsx`: Auth hook, as context might be involved.
- `backend/app/models/application.py`: SQLAlchemy model for applications.
- `backend/app/models/cover_letter.py`: SQLAlchemy model for cover letters and versions.
```

---

### Step 1.3: Gather Project Context
**AI Instructions**: Read the necessary files to understand current implementation.

#### Current Implementation Analysis

**File**: `frontend/src/components/Applications/CoverLetterSelector.jsx`
**Purpose**: Renders a dropdown to select a master cover letter.
**Current Approach**: Fetches all master cover letters and allows selecting one, returning the `cover_letter_id`. It has no concept of versions.
**Issues Found**: This is the primary source of the bugs. It does not allow version selection, which is required by the backend. It needs to be completely redesigned to support a two-level selection (cover letter -> version).

**File**: `frontend/src/pages/ApplicationForm/ApplicationForm.jsx`
**Purpose**: Handles the creation and editing of job applications.
**Current Approach**: Uses the flawed `CoverLetterSelector`. The form state manages `cover_letter_id` but not `cover_letter_version_id` correctly for the UI. When editing, it fetches application data but fails to populate the cover letter selectors because the state management and component structure are incorrect for handling nested version data.
**Issues Found**:
- Does not manage `cover_letter_version_id` in the state for UI selection.
- Fails to pre-populate the cover letter and version selectors when editing an application.

**File**: `frontend/src/pages/ApplicationDetail/ApplicationDetail.jsx`
**Purpose**: Displays the details of a single job application.
**Current Approach**: It fetches the application data and renders it. For the cover letter, it explicitly displays the `cover_letter_version_id`.
**Issues Found**: The component correctly receives the full `cover_letter_version` object from the API but ignores it, choosing to render only the ID. This is a simple rendering bug.

**File**: `backend/app/schemas/application.py`
**Purpose**: Defines the data structures for API requests and responses.
**Current Approach**: The schemas are correctly defined. `ApplicationCreate` and `ApplicationUpdate` accept `cover_letter_version_id`. `ApplicationResponse` correctly includes the nested `cover_letter_version: Optional[CoverLetterVersionResponse]`.
**Issues Found**: No issues found. The backend schema supports the expected functionality.

**File**: `backend/app/services/application_service.py`
**Purpose**: Contains the business logic for managing applications.
**Current Approach**: The service correctly uses `joinedload` to fetch the `cover_letter_version` along with the application, ensuring the data is available. The create and update logic correctly handles the `cover_letter_version_id`.
**Issues Found**: No issues found. The backend service logic appears correct.

---

### Step 1.4: Root Cause Analysis
**AI Instructions**: Dig deep to find the TRUE cause, not just symptoms.

#### Root Cause 1: Flawed Frontend Component for Cover Letter Selection

**Symptom**: Incorrect versioning display ("version 16 (Original)"), inability to select a specific version.
**Immediate Cause**: The `CoverLetterSelector.jsx` component is only designed to select a master cover letter ID, not a version ID. The `ApplicationForm.jsx` does not have a mechanism to select a version.
**Root Cause**: **A critical frontend component was designed without considering the versioning requirement.** The data model (master/version) is not reflected in the UI components responsible for selection, leading to incorrect data being sent to the backend. The "version 16" is likely a symptom of the frontend grabbing an unrelated or default ID when the expected data is not found.
**Impact Chain**:
`Flawed CoverLetterSelector` → `ApplicationForm sends only cover_letter_id (or nothing)` → `Backend receives incomplete data` → `Application is created with incorrect or missing cover letter version` → `User sees inconsistent and wrong data`.

#### Root Cause 2: Incorrect Data Rendering in Application Details

**Symptom**: Application details page shows "Cover Letter Version ID: X" instead of the version's actual information (e.g., version name).
**Immediate Cause**: The JSX in `ApplicationDetail.jsx` is hardcoded to display the `application.cover_letter_version_id` property.
**Root Cause**: **A simple frontend rendering error.** The developer failed to access the nested `application.cover_letter_version` object (e.g., `application.cover_letter_version.version`) which is already being provided by the backend API.
**Impact Chain**:
`Backend sends full version object` → `Frontend component ignores the object` → `Component renders only the ID` → `User is shown a useless ID instead of meaningful information`.

#### Root Cause 3: Broken State Initialization in Edit Form

**Symptom**: When editing an application, the cover letter dropdown is empty.
**Immediate Cause**: The `ApplicationForm.jsx` does not correctly populate its state to reflect the selected cover letter and version when it fetches the application data.
**Root Cause**: **Poor state management and component design.** The form's `useEffect` hook fetches the application data but does not have the logic to parse the `cover_letter_version` and set the state for a two-level selector (because one doesn't exist). The existing `CoverLetterSelector` is bound to `formData.cover_letter_id`, which may not be correctly set or available on the initial load of the application data.
**Impact Chain**:
`User enters edit mode` → `Form fetches application data` → `State update logic fails to handle cover letter version` → `Selectors are not populated with existing data` → `User is confused and may accidentally overwrite the selection`.

---

### Step 1.5: Identify Dependencies and Side Effects
**AI Instructions**: Map out what else might be affected.

#### Output Format:
```markdown
### Dependencies & Side Effects

**Upstream Dependencies** (What this code depends on):
- Backend API: `/api/v1/cover-letters` and a new `/api/v1/cover-letters/{id}/versions` endpoint.
- Data Schema: `ApplicationResponse`, `CoverLetterResponse`, `CoverLetterVersionResponse`.

**Downstream Consumers** (What depends on this code):
- The entire application creation and editing flow.
- Any future feature that might reference an application's associated cover letter.

**Potential Side Effects**:
- ⚠️ **High Risk**: Refactoring the `ApplicationForm` is a significant change. If not handled carefully, it could break the creation or editing of applications entirely.
- ⚠️ The new two-level selector adds complexity to the form state. Thorough testing is required to prevent new bugs.
- ✅ The fix to `ApplicationDetail.jsx` is low-risk as it's a simple display change.
- ✅ Deleting the old `CoverLetterSelector.jsx` is low-risk as it will be replaced entirely.

**Similar Patterns in Codebase**:
- The resume and resume version selectors in `ApplicationForm.jsx` provide a perfect template for the new cover letter and version selectors.
```

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
**AI Instructions**: Clearly define what "done" looks like.

#### Output Format:
```markdown
### Success Criteria

**Functional Requirements**:
- [ ] Users can select a master cover letter from a dropdown in the application form.
- [ ] Upon selecting a master cover letter, a second dropdown is populated with its available versions.
- [ ] The selected `cover_letter_version_id` is correctly sent to the backend when creating or updating an application.
- [ ] When editing an application, the form correctly pre-selects the saved master cover letter and its version.
- [ ] The application details page displays the cover letter title and version name (e.g., "Cover Letter for Google (v2 - Google)").

**Technical Requirements**:
- [ ] A new API endpoint `GET /api/v1/cover-letters/{id}/versions` is created and functions correctly.
- [ ] The `ApplicationResponse` schema in the backend includes the `cover_letter_title`.
- [ ] The old `CoverLetterSelector.jsx` component is removed.
- [ ] All existing tests pass, and new tests are added for the updated components.

**UX Requirements**:
- [ ] The cover letter selection process is intuitive and consistent with the resume selection process.
- [ ] Loading states are shown when cover letter versions are being fetched.
- [ ] User receives clear feedback on success or failure.
```

---

### Step 2.2: Determine Solution Approach
**AI Instructions**: Choose the best approach to solve the problem.

#### Output Format:
```markdown
### Solution Approach

**Chosen Approach**: Refactor

**Rationale**:
- The core of the problem lies in a fundamentally flawed component (`CoverLetterSelector.jsx`) and incorrect state management in the `ApplicationForm.jsx`. A simple bug fix is insufficient.
- A refactor is necessary to align the cover letter selection with the existing, working pattern used for resume selection. This ensures consistency, maintainability, and prevents future bugs.
- This approach addresses all three reported bugs at their root cause.

**Trade-offs**:
- **Pros**: Provides a robust, long-term solution. Improves code quality and user experience significantly.
- **Cons**: Higher effort than a quick patch. Involves changes to multiple frontend components and potentially minor backend adjustments.

**Alternative Considered**: Quick Fix (patching the existing components).
**Why Not Chosen**: It would lead to complex, messy code that would be hard to maintain and likely introduce new bugs. It would not solve the root problem of a poor component design.
```

---

### Step 2.3: Break Down into Steps
**AI Instructions**: Divide the work into logical, manageable steps.

#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Backend - Create API Endpoint for Versions
**Priority**: Critical
**Estimated Time**: 30m
**Dependencies**: None

**Objectives**:
- [ ] Create a new API endpoint `GET /api/v1/cover-letters/{cover_letter_id}/versions`.
- [ ] This endpoint should return all versions for a given master cover letter, verifying user ownership.

**Changes Required**:
- `backend/app/api/v1/cover_letters.py`: Add the new endpoint and its logic, following the pattern of the resume versioning endpoint.
- `backend/app/services/cover_letter_service.py`: Add a `list_versions` method if it doesn't already exist.

**Verification**:
- [ ] Manually test the endpoint using the API docs to ensure it returns the correct versions for a cover letter.

---

#### Step 2: Backend - Enhance Application API Response
**Priority**: High
**Estimated Time**: 15m
**Dependencies**: None

**Objectives**:
- [ ] Ensure the `GET /api/v1/applications/{id}` response includes the cover letter's title for easy display on the frontend.

**Changes Required**:
- `backend/app/schemas/application.py`: Add `cover_letter_title: Optional[str] = None` to the `ApplicationResponse` schema.
- `backend/app/services/application_service.py`: In the `get_application` and `list_user_applications` methods, populate this new field by accessing the title from the loaded cover letter relationship.

**Verification**:
- [ ] Check the API response for an application to confirm the `cover_letter_title` field is present and correct.

---

#### Step 3: Frontend - Refactor `ApplicationForm.jsx`
**Priority**: Critical
**Estimated Time**: 1.5h
**Dependencies**: Step 1

**Objectives**:
- [ ] Replace the old `CoverLetterSelector` with a new two-dropdown system.
- [ ] Fix state management for creating and editing applications.

**Changes Required**:
- `frontend/src/pages/ApplicationForm/ApplicationForm.jsx`:
  1. Remove `<CoverLetterSelector />`.
  2. Add state for `coverLetters` and `coverLetterVersions`.
  3. Add a `<select>` for master cover letters.
  4. Add a second `<select>` for versions, which is populated by an API call when a master is selected.
  5. Update `formData` state to correctly track `cover_letter_id` and `cover_letter_version_id`.
  6. In the `useEffect` for edit mode, add logic to fetch the application's full cover letter data, populate both dropdowns, and set their initial values correctly.
- `frontend/src/services/api.js`: Add a new function `getCoverLetterVersions(coverLetterId)` to call the new backend endpoint.

**Verification**:
- [ ] In create mode, selecting a cover letter populates the version dropdown.
- [ ] In edit mode, the form loads with the correct cover letter and version pre-selected.
- [ ] Submitting the form sends the correct `cover_letter_version_id`.

---

#### Step 4: Frontend - Fix `ApplicationDetail.jsx`
**Priority**: High
**Estimated Time**: 15m
**Dependencies**: Step 2

**Objectives**:
- [ ] Display the cover letter title and version name instead of just the ID.

**Changes Required**:
- `frontend/src/pages/ApplicationDetail/ApplicationDetail.jsx`: Modify the rendering logic to use the newly available `application.cover_letter_title` and `application.cover_letter_version.version` fields.

**Verification**:
- [ ] Navigate to the details page of an application with a cover letter and verify the full, readable information is displayed.

---

#### Step 5: Frontend - Cleanup
**Priority**: Medium
**Estimated Time**: 10m
**Dependencies**: Step 3

**Objectives**:
- [ ] Remove the obsolete `CoverLetterSelector` component.

**Changes Required**:
- Delete file: `frontend/src/components/Applications/CoverLetterSelector.jsx`
- Delete file: `frontend/src/components/Applications/CoverLetterSelector.module.css`

**Verification**:
- [ ] The application runs without errors after the files are deleted.
```

---

### Step 2.4: Risk Assessment
**AI Instructions**: Identify potential problems before they occur.

*This section will be filled in after the plan is approved.*

---

### Step 2.5: Create Implementation Checklist
**AI Instructions**: Provide a comprehensive checklist for the implementer.

*This section will be filled in after the plan is approved.*


---

## 🛠️ PHASE 3: Implementation Guidance

*This phase will be detailed after the analysis is complete.*

---

## 📊 PHASE 4: Deliverables

*This phase will be detailed after the analysis is complete.*

---

## 📝 PHASE 5: Summary & Documentation

*This phase will be detailed after the analysis is complete.*
