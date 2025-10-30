# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: [DATE]
- **Project Name**: [PROJECT_NAME]
- **Task ID**: [TASK_ID or TICKET_NUMBER]

---

## 🎯 Task Definition

### Issue Summary
**[Provide a clear, one-sentence description of the bug or refactoring need]**

Example: "CoverLetterCard component has outdated UI and DELETE endpoint returns 422 error"

### Reported Symptoms
List all observable problems:
- [ ] Symptom 1: [e.g., "JavaScript alert() appears instead of modal"]
- [ ] Symptom 2: [e.g., "DELETE returns 422 with 'undefined' in URL"]
- [ ] Symptom 3: [e.g., "UI doesn't match app design standards"]

### User Impact
- **Severity**: [Critical / High / Medium / Low]
- **Affected Users**: [All users / Specific user group / Edge case]
- **Workaround Available**: [Yes / No]
- **Business Impact**: [Describe impact on business/users]

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
  - Architecture & Design Patterns:
      * **Logic in Hooks**: All business logic, state management, and API calls must be encapsulated in custom hooks (e.g., `useResumes`, `useCoverLetterEditor`). Page components should be simple consumers of these hooks.
      * **Component-First Approach**: Before writing new UI, always check for a reusable component in `src/components/common/` (`PageLayout`, `BaseCard`, `Alert`, `EmptyState`, `Pagination`).
      * **Global State**: Use React Context (`src/contexts/`) for global state. The `ThemeContext` manages dark/light mode application-wide.
      * **Layouts**: All top-level page components must be wrapped in the `PageLayout` component to ensure consistent page width and padding.
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
- [ ] What is the exact problem being reported?
- [ ] What is the expected behavior?
- [ ] What is the current (incorrect) behavior?
- [ ] Are there multiple related issues, or just one?
- [ ] Is this a bug fix, refactoring, or both?

#### Output Format:
```markdown
### Problem Understanding
**What**: [Concise description of the problem]
**Expected**: [What should happen]
**Actual**: [What currently happens]
**Type**: [Bug / Performance / UX / Code Quality]
```

**Example - Good Output**:
```markdown
### Problem Understanding
**What**: CoverLetterCard delete function passes undefined ID to API
**Expected**: DELETE /api/v1/cover-letters/{id} should receive valid cover letter ID
**Actual**: DELETE /api/v1/cover-letters/undefined returns 422 error
**Type**: Bug (Data handling issue)
```

**Example - Bad Output**:
```markdown
### Problem Understanding
The delete button doesn't work properly.
```

---

### Step 1.2: Identify Affected Areas
**AI Instructions**: Determine which parts of the codebase are involved.

#### Analysis Checklist:
- [ ] Which features/modules are affected?
- [ ] Which layers are involved? (UI, API, Database, Service, etc.)
- [ ] Are there related components that might be affected?
- [ ] Could this be a systemic issue affecting other areas?

#### Files to Investigate:
1. **Primary Files**: Files directly mentioned or obviously related
2. **Secondary Files**: Dependencies and consumers of primary files
3. **Configuration Files**: Settings that might affect behavior
4. **Test Files**: Existing tests that might need updates

#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [ ] Frontend UI Components
- [ ] Frontend State Management
- [ ] Frontend API Service
- [ ] Backend API Endpoints
- [ ] Backend Service Layer
- [ ] Backend Database Models
- [ ] Other: [specify]

**Primary Files**:
- `path/to/file1.jsx` - [Brief description of role]
- `path/to/file2.py` - [Brief description of role]

**Secondary Files** (May need updates):
- `path/to/related1.jsx` - [Why it might be affected]
- `path/to/related2.py` - [Why it might be affected]
```

---

### Step 1.3: Gather Project Context
**AI Instructions**: Read the necessary files to understand current implementation.

#### Reading Strategy:
```
Priority 1: Files directly mentioned in the bug report
Priority 2: Main implementation files (components, services, APIs)
Priority 3: Related files (parent components, consumers)
Priority 4: Configuration and schema files
Priority 5: Tests and documentation
```

#### What to Look For:
- [ ] Current implementation approach
- [ ] Data structures and types
- [ ] Error handling patterns
- [ ] Existing tests
- [ ] TODO comments or known issues
- [ ] Design patterns in use
- [ ] Dependencies and imports

#### Tools to Use:
```bash
# Directory structure
directory_tree: Get overview of project structure

# File listing
list_directory: See what's in a specific folder

# File search
search_files: Find files by name/pattern

# Read single file
read_file: Read one file completely

# Read multiple files
read_multiple_files: Efficient batch reading (use when reading 2-10 files)
```

#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `path/to/component.jsx`
**Purpose**: [What this file does]
**Current Approach**: [How it currently works]
**Issues Found**: [Problems identified in this file]
**Dependencies**: [What it depends on]

**Key Code Snippets**:
```javascript
// Relevant code showing the issue
const handleDelete = () => {
  onDelete(coverLetter.title); // BUG: Should be coverLetter.id
}
```

**Notes**:
- [Observation 1]
- [Observation 2]

---

### Step 1.4: Root Cause Analysis
**AI Instructions**: Dig deep to find the TRUE cause, not just symptoms.

#### Analysis Questions:
1. **What** is failing? (Symptom)
2. **Where** is it failing? (Location in code)
3. **Why** is it failing? (Root cause)
4. **When** does it fail? (Conditions)
5. **How** did it happen? (Origin - was it always broken or introduced recently?)

#### Root Cause Categories:
- [ ] **Data Issue**: Wrong data structure, missing fields, type mismatch
- [ ] **Logic Error**: Incorrect algorithm, wrong condition, missing validation
- [ ] **Integration Issue**: API contract mismatch, incorrect data transformation
- [ ] **Configuration Issue**: Wrong settings, missing environment variables
- [ ] **Design Flaw**: Architectural problem, wrong pattern usage
- [ ] **Dependency Issue**: Third-party library bug or incompatibility

#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: [Observable problem]
**Immediate Cause**: [Direct technical reason]
**Root Cause**: [Underlying reason]
**Why It Happened**: [How this was introduced]

**Evidence**:
1. [Finding 1 supporting the root cause]
2. [Finding 2 supporting the root cause]

**Impact Chain**:
[Root Cause] → [Intermediate Effect] → [Observable Symptom]

Example:
Backend schema changed to master/version pattern → Frontend still expects flat structure → Delete passes wrong identifier → 422 error
```

**Example - Good Analysis**:
```markdown
### Root Cause Analysis

**Symptom**: DELETE endpoint returns 422 with undefined ID
**Immediate Cause**: onDelete callback receives undefined instead of cover letter ID
**Root Cause**: Backend changed to master/version architecture returning only metadata, but frontend component still expects old flat structure with direct content access

**Evidence**:
1. Backend returns CoverLetterResponse with only: id, user_id, title, is_default, timestamps
2. Frontend CoverLetterCard tries to access coverLetter.content which doesn't exist
3. Delete function references coverLetter.title instead of coverLetter.id

**Impact Chain**:
Backend schema migration → API response structure changed → Frontend data mapping broken → Wrong parameter passed to delete function → API validation fails with 422
```

**Example - Bad Analysis**:
```markdown
### Root Cause Analysis
The delete button is broken because the ID is undefined.
```

---

### Step 1.5: Identify Dependencies and Side Effects
**AI Instructions**: Map out what else might be affected.

#### Dependency Analysis:
- [ ] What components consume this code?
- [ ] What services does this code depend on?
- [ ] What shared utilities are involved?
- [ ] What database tables/models are affected?
- [ ] What tests cover this functionality?

#### Side Effect Analysis:
- [ ] Will fixing this break anything else?
- [ ] Are there other places with the same pattern?
- [ ] Do other features use similar data structures?
- [ ] Are there cached values that need invalidation?

#### Output Format:
```markdown
### Dependencies & Side Effects

**Upstream Dependencies** (What this code depends on):
- Backend API: `/api/v1/cover-letters` endpoint
- Data Schema: `CoverLetterResponse` model
- Auth Service: User authentication token

**Downstream Consumers** (What depends on this code):
- CoverLettersPage: Parent component managing delete flow
- CoverLetterList: List component passing data down
- Applications feature: May reference cover letters

**Potential Side Effects**:
- ⚠️ Changing data structure may affect other components
- ⚠️ API changes require frontend-backend coordination
- ✅ Delete is isolated, low risk of side effects

**Similar Patterns in Codebase**:
- ResumeCard: Uses similar master/version pattern (reference implementation)
- ApplicationCard: May need similar updates
```

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
**AI Instructions**: Clearly define what "done" looks like.

#### Success Criteria Template:
```markdown
### Success Criteria

**Functional Requirements**:
- [ ] Requirement 1: [Specific, measurable outcome]
- [ ] Requirement 2: [Specific, measurable outcome]

**Technical Requirements**:
- [ ] No console errors or warnings
- [ ] All existing tests pass
- [ ] New tests added for bug fix
- [ ] Code follows project standards
- [ ] Performance not degraded

**UX Requirements**:
- [ ] User can complete the action successfully
- [ ] Appropriate feedback is shown (loading, success, error)
- [ ] Accessible (keyboard, screen reader)
- [ ] Responsive on all breakpoints

**Acceptance Tests**:
1. **Test**: [Specific user action]
   **Expected**: [What should happen]
   
2. **Test**: [Another specific user action]
   **Expected**: [What should happen]
```

**Example - Good Success Criteria**:
```markdown
### Success Criteria

**Functional Requirements**:
- [ ] DELETE /api/v1/cover-letters/{id} completes successfully with valid ID
- [ ] UI shows loading state during delete operation
- [ ] Success message appears after successful deletion
- [ ] Cover letter is removed from the list immediately
- [ ] Error message appears if deletion fails

**Technical Requirements**:
- [ ] No 422 errors in console
- [ ] CoverLetterCard receives correct data structure
- [ ] onDelete callback receives valid cover letter ID
- [ ] API response properly handled in all cases
- [ ] Code follows React Hooks best practices

**UX Requirements**:
- [ ] User sees confirmation dialog before delete
- [ ] Loading spinner appears on delete button
- [ ] Success toast notification appears
- [ ] Card fades out smoothly on delete
- [ ] Error handling with retry option

**Acceptance Tests**:
1. **Test**: User clicks delete on a cover letter card
   **Expected**: Confirmation dialog appears

2. **Test**: User confirms deletion
   **Expected**: API receives correct ID, 204 response, card removed from UI

3. **Test**: API returns error
   **Expected**: Error message shown, card remains in list, user can retry
```

---

### Step 2.2: Determine Solution Approach
**AI Instructions**: Choose the best approach to solve the problem.

#### Approach Options to Consider:
1. **Quick Fix**: Minimal changes to resolve immediate issue
2. **Proper Fix**: Address root cause completely
3. **Refactor**: Fix issue while improving code quality
4. **Redesign**: Major changes to prevent similar issues

#### Decision Matrix:
```markdown
| Approach | Pros | Cons | Effort | Risk |
|----------|------|------|--------|------|
| Quick Fix | Fast, low risk | Technical debt | Low | Low |
| Proper Fix | Solves root cause | More changes | Medium | Medium |
| Refactor | Improves quality | More testing needed | High | Medium |
| Redesign | Future-proof | Significant changes | Very High | High |
```

#### Recommended Approach:
**AI Instructions**: Choose based on:
- Severity of the bug
- Time available
- Technical debt concerns
- User impact
- Team capacity

#### Output Format:
```markdown
### Solution Approach

**Chosen Approach**: [Quick Fix / Proper Fix / Refactor / Redesign]

**Rationale**:
- [Reason 1 for this choice]
- [Reason 2 for this choice]

**Trade-offs**:
- **Pros**: [What we gain]
- **Cons**: [What we sacrifice]

**Alternative Considered**: [Other approach]
**Why Not Chosen**: [Reasoning]
```

---

### Step 2.3: Break Down into Steps
**AI Instructions**: Divide the work into logical, manageable steps.

#### Step Breakdown Principles:
- Each step should be independently completable
- Steps should be ordered by priority and dependency
- Each step should have clear deliverables
- Include time estimates
- Mark dependencies between steps

#### Output Format:
```markdown
### Implementation Steps

#### Step 1: [Step Name]
**Priority**: [Critical / High / Medium / Low]
**Estimated Time**: [30m / 1h / 2h / etc.]
**Dependencies**: [None / Step X / Step Y]

**Objectives**:
- [ ] Objective 1
- [ ] Objective 2

**Changes Required**:
- File 1: [What changes]
- File 2: [What changes]

**Deliverables**:
- [ ] Deliverable 1
- [ ] Deliverable 2

**Verification**:
- [ ] How to verify step is complete

---

#### Step 2: [Step Name]
[Same format as above]
```

**Example - Good Step Breakdown**:
```markdown
### Implementation Steps

#### Step 1: Fix Backend API Data Structure
**Priority**: Critical
**Estimated Time**: 30 minutes
**Dependencies**: None

**Objectives**:
- [ ] Ensure GET /cover-letters returns correct data structure
- [ ] Verify DELETE endpoint accepts and validates ID correctly
- [ ] Add proper error handling for invalid IDs

**Changes Required**:
- `backend/app/api/v1/cover_letters.py`: Verify DELETE endpoint validation
- `backend/app/schemas/cover_letter.py`: Ensure CoverLetterResponse matches expectations

**Deliverables**:
- [ ] Backend returns consistent ID field in all responses
- [ ] DELETE endpoint properly validates ID as integer
- [ ] API documentation updated if needed

**Verification**:
- [ ] curl DELETE /api/v1/cover-letters/123 returns 204
- [ ] curl DELETE /api/v1/cover-letters/invalid returns 422 with clear error
- [ ] GET /cover-letters returns list with valid ID fields

---

#### Step 2: Update Frontend Data Handling
**Priority**: Critical
**Estimated Time**: 1 hour
**Dependencies**: Step 1 (Backend fix must be deployed)

**Objectives**:
- [ ] Update CoverLetterCard to use correct data structure
- [ ] Fix delete function to pass correct ID
- [ ] Handle case where content is not in list view

**Changes Required**:
- `frontend/src/components/CoverLetters/CoverLetterCard.jsx`: Use coverLetter.id for delete
- `frontend/src/components/CoverLetters/CoverLetterList.jsx`: Pass correct props
- `frontend/src/pages/CoverLetters/CoverLettersPage.jsx`: Handle API response correctly

**Deliverables**:
- [ ] CoverLetterCard receives and uses correct ID
- [ ] Delete function calls API with valid integer ID
- [ ] PropTypes/comments document expected data structure

**Verification**:
- [ ] No console errors when rendering cover letter list
- [ ] Delete button passes correct ID (check network tab)
- [ ] No "undefined" in API URLs
```

---

### Step 2.4: Risk Assessment
**AI Instructions**: Identify potential problems before they occur.

#### Risk Categories:
- **Technical Risks**: Breaking changes, performance issues, edge cases
- **User Impact Risks**: Downtime, data loss, UX degradation
- **Process Risks**: Testing gaps, deployment issues, communication failures

#### Risk Assessment Template:
```markdown
### Risk Assessment

#### Risk 1: [Risk Description]
**Likelihood**: [High / Medium / Low]
**Impact**: [High / Medium / Low]
**Category**: [Technical / User Impact / Process]

**Potential Consequences**:
- [What could go wrong]

**Mitigation Strategy**:
- [How to prevent or minimize]

**Contingency Plan**:
- [What to do if it happens]

---

[Repeat for each identified risk]
```

**Example - Good Risk Assessment**:
```markdown
### Risk Assessment

#### Risk 1: Breaking Changes to Other Features
**Likelihood**: Medium
**Impact**: High
**Category**: Technical

**Potential Consequences**:
- Applications feature may break if it relies on old cover letter structure
- Other components consuming cover letter data may fail

**Mitigation Strategy**:
- Search codebase for all cover letter data consumers
- Test all related features after changes
- Keep backward compatibility where possible
- Add data transformation layer if needed

**Contingency Plan**:
- Have rollback procedure ready
- Deploy during low-traffic period
- Monitor error logs closely post-deployment

---

#### Risk 2: Frontend-Backend Sync Issues
**Likelihood**: Low
**Impact**: High
**Category**: Process

**Potential Consequences**:
- Frontend deployed before backend = 422 errors continue
- Backend deployed before frontend = users see wrong data structure

**Mitigation Strategy**:
- Deploy backend changes first
- Verify backend works before frontend deployment
- Use feature flags if available
- Coordinate deployment timing

**Contingency Plan**:
- Quick rollback procedure documented
- On-call engineer available during deployment
```

---

### Step 2.5: Create Implementation Checklist
**AI Instructions**: Provide a comprehensive checklist for the implementer.

#### Output Format:
```markdown
### Implementation Checklist

#### Before Starting:
- [ ] Read all relevant code and documentation
- [ ] Understand the root cause completely
- [ ] Review project coding standards
- [ ] Set up development environment
- [ ] Create feature branch: `fix/[issue-description]`

#### During Implementation:
- [ ] Follow the step-by-step plan
- [ ] Write code following project standards
- [ ] Add/update tests for each change
- [ ] Test locally after each step
- [ ] Commit regularly with clear messages
- [ ] Document complex decisions in code comments

#### Code Quality:
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Accessibility considerations (ARIA, keyboard nav)
- [ ] Responsive design verified
- [ ] No console errors or warnings
- [ ] Code is self-documenting with clear naming

#### Testing:
- [ ] All existing tests pass
- [ ] New tests added for bug fix
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Integration tests updated
- [ ] Manual testing completed

#### Documentation:
- [ ] Code comments added where needed
- [ ] JSDoc/docstrings updated
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Changelog entry added

#### Before Submitting:
- [ ] Self-review the changes
- [ ] Run full test suite
- [ ] Check code coverage
- [ ] Verify success criteria met
- [ ] Test in multiple browsers (if frontend)
- [ ] Test on mobile (if UI changes)
- [ ] Prepare clear PR description

#### After Deployment:
- [ ] Monitor error logs
- [ ] Verify in production
- [ ] Check analytics/metrics
- [ ] Update documentation if needed
- [ ] Close related tickets
```

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide
**AI Instructions**: Provide specific guidance for each file that needs changes.

#### Template for Each File:
```markdown
### File: `path/to/file.ext`

**Current Code** (Relevant Section):
```language
[Show the current code that needs changing]
```

**Issue in This Code**:
- [Explain what's wrong]
- [Why it's wrong]

**Required Changes**:
1. [Change 1 description]
2. [Change 2 description]

**Updated Code**:
```language
[Show the corrected code]
```

**Explanation**:
- [Why this change fixes the issue]
- [How it works]
- [Any trade-offs or considerations]

**Testing This Change**:
```language
// Example test or manual verification
```
```

**Example - Good Implementation Guide**:
```markdown
### File: `frontend/src/components/CoverLetters/CoverLetterCard.jsx`

**Current Code** (Lines 15-22):
```javascript
const handleDelete = async () => {
  if (window.confirm(`Delete cover letter for ${coverLetter.title}?`)) {
    setIsDeleting(true);
    try {
      await onDelete(coverLetter.id);
    } finally {
      setIsDeleting(false);
    }
  }
};
```

**Issues in This Code**:
1. Uses `window.confirm()` instead of proper modal (inconsistent with app UX)
2. No error handling for failed delete
3. Delete confirmation moved to parent component but not removed here
4. Loading state management could be improved

**Required Changes**:
1. Remove `window.confirm()` call (parent handles confirmation)
2. Add try-catch with error handling
3. Simplify function since confirmation is external
4. Ensure loading state is set correctly

**Updated Code**:
```javascript
const handleDelete = async () => {
  setIsDeleting(true);
  try {
    await onDelete(coverLetter.id);
    // Success handled by parent component
  } catch (error) {
    console.error('Failed to delete cover letter:', error);
    // Error displayed by parent component
  } finally {
    setIsDeleting(false);
  }
};
```

**Explanation**:
- Removed `window.confirm()` because parent (CoverLettersPage) shows ConfirmDialog
- Added try-catch for proper error handling
- Loading state correctly reset in finally block
- Function now only manages its own loading state
- Parent component handles success/error messaging

**Testing This Change**:
```javascript
// Unit test
test('handleDelete calls onDelete with correct ID', async () => {
  const mockOnDelete = jest.fn().mockResolvedValue();
  const coverLetter = { id: 123, title: 'Test' };
  
  render(<CoverLetterCard coverLetter={coverLetter} onDelete={mockOnDelete} />);
  
  const deleteButton = screen.getByText('Delete');
  await userEvent.click(deleteButton);
  
  expect(mockOnDelete).toHaveBeenCalledWith(123);
});
```

---

### Step 3.2: Common Patterns and Best Practices
**AI Instructions**: Reference patterns used elsewhere in the project.

#### Output Format:
```markdown
### Patterns to Follow

#### Pattern 1: [Pattern Name]
**Used In**: [Where this pattern is used in the codebase]
**Purpose**: [Why this pattern is used]

**Example**:
```language
[Code example showing the pattern]
```

**When to Use**:
- [Situation 1]
- [Situation 2]

**When NOT to Use**:
- [Situation where it doesn't apply]

**Example**:

#### Patterns to Follow

##### Pattern 1: Delete Confirmation Flow
**Used In**: ResumesPage, ApplicationsPage, CoverLettersPage
**Purpose**: Consistent user experience for destructive actions

**Example** (from ResumesPage.jsx):
```javascript
// 1. State for confirmation dialog
const [deleteConfirm, setDeleteConfirm] = useState(null);

// 2. Handler to show dialog
const handleDeleteClick = (item) => {
  setDeleteConfirm(item);
};

// 3. Handler to execute delete
const handleDeleteConfirm = async () => {
  if (!deleteConfirm) return;
  try {
    await apiService.deleteItem(deleteConfirm.id);
    // Update local state
    setItems(items.filter(item => item.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  } catch (err) {
    setError(err.message);
  }
};

// 4. Render dialog
<ConfirmDialog
  isOpen={!!deleteConfirm}
  onClose={() => setDeleteConfirm(null)}
  onConfirm={handleDeleteConfirm}
  title="Delete Item"
  message={`Delete ${deleteConfirm?.name}?`}
/>
```

**When to Use**:
- Any destructive action (delete, archive, reset)
- Actions that can't be easily undone
- When user data is at risk

**When NOT to Use**:
- Non-destructive actions (save, cancel, close)
- Actions with undo capability
- Low-stakes operations


---

### Step 3.3: Edge Cases to Handle
**AI Instructions**: List edge cases and how to handle them.

#### Template:

#### Edge Cases
##### Edge Case 1: [Scenario]
**Condition**: [When this happens]
**Current Behavior**: [What happens now]
**Expected Behavior**: [What should happen]
**Solution**: [How to handle it]

**Code Example**:
```language
[Code showing how to handle this edge case]
```


**Example**:

#### Edge Cases
##### Edge Case 1: Deleting Already Deleted Item
**Condition**: User clicks delete, another user deletes same item, first user confirms
**Current Behavior**: 404 error, confusing error message
**Expected Behavior**: Graceful handling with clear message
**Solution**: Check for 404 in delete handler, show appropriate message

**Code Example**:
```javascript
const handleDeleteConfirm = async () => {
  try {
    await apiService.deleteCoverLetter(deleteConfirm.id);
    setCoverLetters(prev => prev.filter(cl => cl.id !== deleteConfirm.id));
    setSuccessMessage('Cover letter deleted successfully');
  } catch (err) {
    if (err.response?.status === 404) {
      // Item already deleted
      setCoverLetters(prev => prev.filter(cl => cl.id !== deleteConfirm.id));
      setSuccessMessage('Cover letter was already deleted');
    } else {
      setError('Failed to delete cover letter. Please try again.');
    }
  } finally {
    setDeleteConfirm(null);
  }
};
```

---

## 📊 PHASE 4: Deliverables

### Step 4.1: Expected Output Formats
**AI Instructions**: Clearly define what artifacts should be produced.

#### Code Changes:

#### Code Deliverables

For each changed file, provide:

1. **Full Updated File Content**
   - Complete, working code
   - Properly formatted
   - With all imports
   - Ready to copy-paste

2. **Change Summary**
   - What was changed
   - Why it was changed
   - Impact of the change

3. **Diff View** (Optional but helpful)
   ```diff
   - old code line
   + new code line
   ```

Example Format:
#### File: `src/components/CoverLetterCard.jsx`

**Changes Made**:
- Removed window.confirm() usage
- Fixed delete to use coverLetter.id instead of title
- Added proper error handling
- Improved loading states

#### Documentation:

##### Documentation Deliverables

1. **Code Comments**
   - JSDoc for functions
   - Inline comments for complex logic

2. **README Updates**
   - If component behavior changed
   - If new patterns introduced

3. **API Documentation**
   - If API contracts changed
   - If new endpoints added

4. **Migration Guide** (if applicable)
   - Breaking changes
   - How to migrate existing code

---

### Step 4.2: Quality Standards
**AI Instructions**: Ensure all deliverables meet quality standards.

#### Code Quality Checklist:

#### Code Quality Standards

##### Readability:
- [ ] Clear, descriptive variable names
- [ ] Functions are small and focused
- [ ] Complex logic has explanatory comments
- [ ] Consistent formatting throughout

##### Maintainability:
- [ ] No code duplication (DRY principle)
- [ ] Proper separation of concerns
- [ ] Reusable utilities extracted
- [ ] Magic numbers replaced with named constants

##### Performance:
- [ ] No unnecessary re-renders (React.memo, useMemo)
- [ ] Efficient algorithms chosen
- [ ] Proper data structure usage
- [ ] No memory leaks

##### Security:
- [ ] Input validation implemented
- [ ] XSS prevention (sanitize user input)
- [ ] SQL injection prevention (parameterized queries)
- [ ] Sensitive data not logged

##### Accessibility:
- [ ] Semantic HTML used
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Screen reader compatible

##### Error Handling:
- [ ] All error cases handled
- [ ] User-friendly error messages
- [ ] Errors logged appropriately
- [ ] Graceful degradation implemented


---

### Step 4.3: Review Checkpoints
**AI Instructions**: Define checkpoints for review before marking complete.

#### Checkpoint Template:

##### Review Checkpoints

###### Checkpoint 1: Code Review
**Reviewer**: [Self / Peer / AI]
**Focus Areas**:
- [ ] Code follows project standards
- [ ] All acceptance criteria met
- [ ] No obvious bugs or issues
- [ ] Test coverage adequate
- [ ] Documentation complete

**Review Notes**:
[Record any findings or improvements]

#### Checkpoint 3: Documentation Review
**Reviewer**: [Self / Tech Writer / AI]
**Focus Areas**:
- [ ] Code comments clear and accurate
- [ ] API docs updated
- [ ] README reflects changes
- [ ] Examples provided where needed

**Documentation Status**:
[Record documentation completeness]

#### Checkpoint 4: Final Verification
**Reviewer**: [Senior Developer / AI]
**Focus Areas**:
- [ ] Solution addresses root cause
- [ ] No regressions introduced
- [ ] Success criteria met
- [ ] Ready for deployment

**Sign-off**:
[Record final approval]


---

## 📝 PHASE 5: Summary & Documentation

### Step 5.1: Change Summary
**AI Instructions**: Provide a comprehensive summary of all changes made.

#### Summary Template:

## Implementation Summary

### Overview
**Task**: [Brief description]
**Status**: [Complete / In Progress / Blocked]
**Time Taken**: [Actual time spent]
**Completed By**: [AI Assistant / Developer name]


### Changes Made

#### Backend Changes
**Files Modified**: [Number] files

1. **File**: `path/to/file.py`
   - **Change**: [Description]
   - **Reason**: [Why this change was needed]
   - **Impact**: [What this affects]

2. **File**: `path/to/another.py`
   - **Change**: [Description]
   - **Reason**: [Why this change was needed]
   - **Impact**: [What this affects]

**Database Changes**:
- [ ] Schema migrations needed: [Yes / No]
- [ ] Data migrations needed: [Yes / No]
- [ ] Migration scripts: [List if applicable]


#### Frontend Changes
**Files Modified**: [Number] files

1. **File**: `path/to/component.jsx`
   - **Change**: [Description]
   - **Reason**: [Why this change was needed]
   - **Impact**: [What this affects]

2. **File**: `path/to/styles.css`
   - **Change**: [Description]
   - **Reason**: [Why this change was needed]
   - **Impact**: [What this affects]

**UI/UX Changes**:
- [ ] Visual changes: [Describe]
- [ ] Interaction changes: [Describe]
- [ ] New components added: [List]

#### Configuration Changes
**Files Modified**: [Number] files

1. **File**: `config/settings.py`
   - **Change**: [Description]
   - **Reason**: [Why needed]

#### Test Changes
**Files Added/Modified**: [Number] files

1. **File**: `tests/test_feature.py`
   - **Tests Added**: [Number]
   - **Coverage**: [Percentage]

### Bug Fixes Applied

#### Bug 1: [Bug Description]
**Severity**: [Critical / High / Medium / Low]
**Root Cause**: [Brief explanation]
**Fix**: [How it was fixed]
**Verification**: [How to verify it's fixed]

#### Bug 2: [Another Bug]
[Same format]

---

### Improvements Made

1. **Improvement**: [Description]
   **Benefit**: [What this improves]

2. **Improvement**: [Description]
   **Benefit**: [What this improves]

---

### Technical Debt

#### Addressed:
- [Technical debt item that was fixed]

#### Introduced:
- [Any new technical debt - should be minimal]

#### Remaining:
- [Known issues or improvements for future]

---

### Breaking Changes
**Are there breaking changes?**: [Yes / No]

If Yes:
1. **Change**: [Description of breaking change]
   **Affects**: [Who/what is affected]
   **Migration**: [How to handle the change]

---

### Dependencies

#### New Dependencies Added:
- [ ] Package name @ version: [Purpose]

#### Dependencies Updated:
- [ ] Package name: old version → new version

#### Dependencies Removed:
- [ ] Package name: [Reason for removal]

---

### Performance Impact

**Before**: [Baseline metrics]
**After**: [New metrics]
**Improvement**: [Percentage or description]

Metrics measured:
- [ ] Page load time
- [ ] API response time
- [ ] Memory usage
- [ ] Bundle size
- [ ] Other: [Specify]

---

### Security Impact

**Security Considerations**:
- [ ] No new vulnerabilities introduced
- [ ] Input validation added/improved
- [ ] Authentication/authorization unchanged
- [ ] Sensitive data handling proper

**Security Scan Results**:
[Results from security scanning tools if applicable]

---

### Communication

**Notification Template**:
`````
Subject: [Deployment] Cover Letter Delete Bug Fix

Hi team,

We've deployed a fix for the cover letter delete functionality.

What changed:
- Fixed 422 error when deleting cover letters
- Improved error handling
- Updated UI to match app standards

Impact:
- Users can now delete cover letters without errors
- Better user experience with modern UI


Please let us know if you see any issues.

Thanks,
[Your name]

---

## 🏁 PHASE 6: Finalization

### Step 6.1: Final Summary
**AI Instructions**: After all implementation and verification steps are complete, provide one final, concise summary of the work done. This summary should be the last thing you output before stopping.

### Step 6.2: Stop and Await Instructions
**AI Instructions**: Once the final summary is provided, the task is considered complete. **DO NOT** repeat the summary, ask to update the task document again, or attempt any further actions. Simply stop and wait for the user's next command.
