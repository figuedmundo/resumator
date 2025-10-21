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

**Project Name**: Resumator

**Technology Stack**:
- **Frontend**: React 18.2.0, Vite 7.1.5, TailwindCSS 3.3.6
- **Backend**: FastAPI, Python 3.11, PostgreSQL
- **State Management**: React Context API
- **Testing**: Vitest, React Testing Library, Pytest
- **UI Components**: HeroIcons, Custom Components
- **Code Editor**: CodeMirror 6
- **Markdown**: react-markdown, remark-gfm
- **HTTP Client**: Axios 1.6.2
- **Utilities**: clsx, date-fns, DOMPurify

**Project Paths**:
- **Root**: `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator`
- **Backend**: `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend`
- **Frontend**: `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend`
- **Docs**: `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/.vibe`
- **Templates**: `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/.vibe/templates`
- **TailwindConfig**: `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/tailwind.config.js`
- **ViteConfig**: `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/vite.config.mjs`

---

### Project Standards & Guidelines

#### Coding Standards

##### Frontend

**Component Style**: Functional Components with Hooks
- Use `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`
- Always functional, never class components

**Styling Approach**: CSS Modules + TailwindCSS utility classes
- Combine CSS Modules for component-specific styles
- Use Tailwind utilities for common patterns

**File Naming**:
- Components: `PascalCase.jsx` (e.g., `CoverLetterCard.jsx`)
- Utilities: `camelCase.js` (e.g., `apiService.js`)
- Styles: `ComponentName.module.css`

**Import Order**:
1. React imports
2. Third-party libraries (heroicons, clsx, axios, etc.)
3. Local components
4. Hooks and utilities
5. CSS Module styles

**State Management**: React Context API with custom hooks
- Use `useAuth` for authentication state
- Context providers at app root
- Custom hooks for reusable logic

**Props Validation**: PropTypes for all components
- Document all props with descriptions
- Mark required vs optional props

**Naming Conventions**:
- **Event handlers**: `handleEventName` (e.g., `handleDelete`, `handleSubmit`, `handleChange`)
- **Boolean props**: `isLoading`, `hasError`, `canEdit`, `showModal`
- **State variables**: Descriptive names (e.g., `coverLetters`, `isDeleting`, `errorMessage`)

**Code Organization**:
- One component per file
- Extract complex logic into custom hooks
- Keep components under 300 lines
- Break large components into smaller ones

**Error Handling**:
- Always use try-catch for async operations
- Display user-friendly error messages
- Log errors to console for debugging
- Never let errors crash the app

---

##### Backend

**Code Style**: PEP 8 compliant, formatted with Black
- Use Black formatter for consistent code style
- Maximum line length: 88 characters
- Follow PEP 8 naming conventions

**Python Version**: 3.11+

**API Pattern**: RESTful with FastAPI
- Use standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- Consistent response formats

**Error Handling**:
- Custom exceptions: `ValidationError`, `NotFoundError`
- Proper HTTP status codes:
  - `200`: Success (GET, PUT)
  - `201`: Created (POST)
  - `204`: No Content (DELETE)
  - `400`: Bad Request
  - `401`: Unauthorized
  - `404`: Not Found
  - `422`: Validation Error
  - `500`: Internal Server Error
- Structured error responses with `detail` field

**Validation**: Pydantic schemas for all request/response models
- Define schemas for every API endpoint
- Use Pydantic validation features
- Clear error messages for validation failures

**Logging**: Structured logging with structlog
- Use appropriate levels: INFO, WARNING, ERROR
- Include context in log messages
- Never log sensitive data (passwords, tokens)

**Documentation**:
- Docstrings for all public methods (Google style)
- Type hints for all function signatures
- API endpoint descriptions in FastAPI decorators
- Keep docs in sync with code

**Security**:
- JWT tokens with access + refresh pattern
- Argon2/bcrypt password hashing (never plain text)
- Rate limiting with Redis
- Input validation and sanitization
- CORS configured properly
- Never trust user input

**Database**:
- SQLAlchemy ORM for models
- Alembic for migrations
- Relationship definitions with proper cascades
- Use transactions for multi-step operations

**Background Tasks**:
- Celery for async operations
- Redis as message broker
- Proper error handling in tasks

---

#### UI/UX Standards

##### Design System

**Component Library**: Custom components with shadcn/ui-inspired design

**Color Palette**:
- **Primary Blue**: `#3b82f6`, `#2563eb`, `#1d4ed8` - Trust, professionalism
- **Secondary Gray**: `#6b7280`, `#4b5563`, `#374151` - Neutral elements
- **Success Green**: `#10b981` - Positive actions, confirmations
- **Warning Yellow**: `#f59e0b` - Cautions, alerts
- **Danger Red**: `#ef4444` - Destructive actions, errors
- **Background**: White/Gray-50 (`#ffffff`, `#f9fafb`)

**Typography**:
- **Font Family**: Inter (fallback: ui-sans-serif, system-ui)
- **Headings**: `font-semibold` to `font-bold`
- **Body**: `font-normal`
- **Sizes**: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`

**Spacing System**: Tailwind default (4px base unit)
- **Padding**: `p-4` (16px), `p-6` (24px), `p-8` (32px)
- **Margins**: `mb-4` (16px), `mb-6` (24px), `mb-8` (32px)
- **Gaps**: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px)

**Icons**: HeroIcons
- Import from `@heroicons/react/24/outline` (thin) or `/24/solid` (filled)
- Consistent icon size within sections
- Use semantic icons (trash for delete, pencil for edit, etc.)

**Borders**:
- **Cards**: `rounded-lg` (8px)
- **Buttons**: `rounded-md` (6px)
- **Border colors**: `border-gray-200`, `border-gray-300`

**Shadows**:
- **Cards hover**: `shadow-sm` → `shadow-md` transition
- **Modals**: `shadow-lg`
- **Buttons hover**: `shadow-sm`

---

##### Interaction Patterns

**Loading States**:
- **Component-level**: LoadingSpinner component (sizes: sm, md, lg)
- **Button loading**: Disable button + spinner + "Loading..." text
- **Skeleton screens**: For list loading, shows placeholder layout
- **Page-level**: Centered spinner with `size="lg"`

**Error Display**:
- **Toast notifications**: Auto-dismiss after 3-5 seconds for non-critical errors
- **Inline errors**: Below form fields with red text
- **Error alerts**: Red banner at top of page/section with icon
- **Modal alerts**: For critical errors requiring acknowledgment

**Confirmations**:
- **ConfirmDialog** component for destructive actions (delete, archive)
- **Two-button layout**: Cancel (secondary) + Confirm (danger/primary)
- **Clear messaging**: "Are you sure you want to delete [item]?"
- **Disable buttons** while processing to prevent double-submission

**Feedback**:
- **Success messages**: Green toast/banner, auto-dismiss after 3 seconds
- **Error messages**: Red alert, manual dismiss or auto-dismiss after 5 seconds
- **Loading indicators**: Spinners, disabled states, skeleton UI
- **Hover states**: All interactive elements show visual feedback
- **Focus states**: Visible outline for keyboard navigation

**Animations**:
- **Fade in**: 0.3s ease-in-out for appearing elements
- **Slide up**: 0.3s ease-out for modals from bottom
- **Smooth transitions**: `transition-colors`, `transition-shadow` with `duration-200`
- **Keep subtle**: Avoid jarring or distracting animations

---

##### Accessibility (WCAG AA Compliance)

**Keyboard Navigation**: Required for all interactive elements
- Tab order logical and intuitive
- Focus visible with outline (never `outline-none` without replacement)
- Escape key closes modals/dialogs
- Enter key submits forms
- Arrow keys for navigation where appropriate

**Screen Reader Support**: Required
- ARIA labels on icon-only buttons
- ARIA-live regions for dynamic content updates
- Semantic HTML (`nav`, `main`, `article`, `button`, etc.)
- Alt text for all images
- Proper heading hierarchy (h1, h2, h3...)

**Color Contrast**:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: 3:1 minimum
- **Use color AND text/icons** for status (never color alone)

**Form Accessibility**:
- Labels associated with inputs (`htmlFor` attribute)
- Error messages linked with `aria-describedby`
- Required fields marked visually and with `aria-required`
- Clear error states with both color and text

---

##### Component Patterns

**Cards**:
```
bg-white
border border-gray-200
rounded-lg
hover:shadow-md transition-shadow
p-4 to p-6
```

**Buttons**:
- **Primary**: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md`
- **Secondary**: `bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md`
- **Danger**: `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md`
  - OR: `bg-red-100 hover:bg-red-200 text-red-700` (subtle variant)
- **Disabled**: Add `opacity-50 cursor-not-allowed`
- **Sizes**: 
  - Small: `px-3 py-2 text-sm`
  - Default: `px-4 py-2`
  - Large: `px-6 py-3 text-lg`
- **Icons with text**: `flex items-center gap-2`

**Forms**:
- **Input fields**: `border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2`
- **Labels**: `font-medium text-gray-700 mb-1 block`
- **Error states**: `border-red-500 text-red-600`
- **Helper text**: `text-sm text-gray-500 mt-1`

**Lists**:
- **Grid layout for cards**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **List layout**: `divide-y divide-gray-200`
- **Empty states**: Centered with icon, title, description, CTA button

**Modals/Dialogs**:
- **Backdrop**: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center`
- **Container**: `bg-white rounded-lg shadow-xl max-w-md w-full mx-4`
- **Header**: `font-semibold text-lg border-b px-6 py-4`
- **Body**: `px-6 py-4`
- **Footer**: `border-t px-6 py-4 flex justify-end gap-3`
- **Close button**: Top-right with X icon

---

#### Testing Standards

##### Frontend Testing (Vitest + React Testing Library)

**Coverage Target**: > 80% for critical components

**Test Types**:
- **Unit tests**: Individual component behavior in isolation
- **Integration tests**: Component interactions and data flow
- **User event tests**: Simulating real user interactions

**Testing Patterns**:
- **Arrange-Act-Assert** structure for all tests
- **Mock API calls** with test data (don't hit real APIs)
- **Test user-visible behavior**, not implementation details
- **Use data-testid sparingly**, prefer accessible queries (getByRole, getByLabelText)

**What to Test**:
- Component renders correctly with different props
- User interactions trigger expected callbacks with correct parameters
- Loading/error states display properly
- Form validation works correctly
- Conditional rendering based on props/state
- Accessibility features (ARIA labels, keyboard navigation)

**What NOT to Test**:
- Implementation details (state variable names, function names)
- Third-party library internals
- CSS styles (rely on visual testing/screenshots)
- Exact DOM structure (brittle tests)

---

##### Backend Testing (Pytest + Pytest-asyncio)

**Coverage Target**: > 85% for services and API endpoints

**Test Types**:
- **Unit tests**: Service methods and utility functions
- **Integration tests**: API endpoints with database
- **Security tests**: Authentication, authorization, input validation

**Testing Patterns**:
- **Use fixtures** for database sessions and test data
- **Mock external services** (AI APIs, storage, email)
- **Test happy path AND error cases**
- **Verify HTTP status codes** and response structure

**What to Test**:
- API endpoints return correct status codes
- Request validation (Pydantic schemas) catches invalid data
- Database operations (CRUD) work correctly
- Business logic in services produces expected results
- Authentication and authorization work properly
- Error handling returns appropriate messages

**Test Data**:
- Use factories/fixtures for consistent test data
- Clear test database between tests (isolation)
- Use realistic but anonymized data
- Cover edge cases (empty strings, null, very large values, special characters)

---

#### Documentation Standards

##### Code Documentation

**JSDoc/Docstrings**: Required for all public APIs and exported functions
- Document purpose, parameters, return values
- Include usage examples where helpful
- Keep in sync with code changes

**Inline Comments**:
- **For complex logic only** (explain why, not what)
- Explain non-obvious decisions or algorithms
- Document workarounds and known issues with TODO/FIXME
- Keep comments up-to-date with code

**README Files**:
- Each major module/feature should have a README.md
- Include: Purpose, Usage, Examples, API reference
- Installation/setup instructions if needed

**API Documentation**:
- FastAPI auto-generates OpenAPI/Swagger docs
- Add descriptions to endpoints and schemas
- Document query parameters and request bodies
- Include example requests and responses

**Component Documentation**:
- PropTypes with descriptions
- Usage examples in component comments
- Document complex state management
- Note any non-obvious behavior

---

##### Change Documentation

**Commit Messages**:
- **Format**: `type: description` (e.g., "fix: resolve delete bug in CoverLetterCard")
- **Types**: 
  - `fix`: Bug fix
  - `feat`: New feature
  - `refactor`: Code refactoring (no functional change)
  - `test`: Adding or updating tests
  - `docs`: Documentation only
  - `style`: Code style (formatting, no logic change)
  - `chore`: Build, dependencies, tooling
- **Keep under 72 characters** for the subject line
- **Reference issue numbers** when applicable: "fix: resolve #123"

**PR Descriptions** (include these sections):
- **What**: What was changed (brief summary)
- **Why**: Why the change was needed (problem being solved)
- **How**: How it was implemented (approach taken)
- **Testing**: How to verify the change works
- **Screenshots**: For UI changes, include before/after screenshots

**Changelog**: Keep CHANGELOG.md updated with notable changes (if exists in project)

---

## 🔍 PHASE 1: Initial Analysis
[... rest of the template remains the same ...]
