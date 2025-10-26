# AI Task: Implement Comprehensive Automated Testing Suite for Resumator

> **Purpose**: This document provides a systematic framework for implementing automated tests to address the critical risk identified in DEPLOYMENT.md. It guides the implementation of unit tests, integration tests, and E2E tests for all critical user flows.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Critical Infrastructure - Testing Implementation
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: CRIT-001-TESTING
- **Priority**: P0 (Critical - Highest Priority)

---

## 🎯 Feature Definition

### Feature Overview
**Comprehensive Automated Testing Suite for Production Readiness**

Implement a complete testing infrastructure covering:
- **Backend Testing**: 80%+ coverage with pytest (unit, integration, E2E)
- **Frontend Testing**: 70%+ coverage with Vitest/React Testing Library
- **CI/CD Integration**: Automated test execution on every commit/PR
- **Test Documentation**: Complete guides and examples for the team

This addresses the **#1 critical risk** identified in DEPLOYMENT.md: "Lack of Automated Tests."

### Business Problem

**Problem Statement**: 
The Resumator application is currently deployed to production with ZERO automated tests. This creates an unacceptable level of risk:
- No safety net when making code changes
- Regression bugs go undetected until production
- Impossible to confidently deploy new features
- Refactoring is dangerous without test coverage
- Manual testing is time-consuming and error-prone

**Current State**: 
- Test Coverage: **0%** (backend and frontend)
- Tests Written: **0**
- CI/CD Testing: **Not configured**
- Test Documentation: **Does not exist**
- Deployment Confidence: **Low**

**Desired State**: 
- Backend Coverage: **>80%** with comprehensive pytest suite
- Frontend Coverage: **>70%** with Vitest + React Testing Library
- All Critical Flows: **100% E2E test coverage**
- CI/CD: **Automated testing on every PR**
- Test Execution Time: **<5 minutes total**
- Deployment Confidence: **High**

### Success Metrics

**Primary Metrics**:
- [ ] Backend test coverage exceeds 80% (measured by pytest-cov)
- [ ] Frontend test coverage exceeds 70% (measured by Vitest coverage)
- [ ] All 5 critical user flows have E2E tests that pass consistently
- [ ] Test suite completes in under 5 minutes in CI/CD
- [ ] Zero P0 bugs reach production in the 30 days post-implementation

**Secondary Metrics**:
- [ ] Developer confidence in deployments increases (team survey)
- [ ] Deployment frequency increases by 50% (measured by deployment logs)
- [ ] Average time to fix bugs decreases by 40% (measured by issue tracking)
- [ ] Code review cycle time decreases by 25% (measured by PR metrics)
- [ ] Test suite reliability >99% (no flaky tests)

---

## 👥 Stakeholder Information

### Who Requested This?
- **Requester**: Engineering Team / DEPLOYMENT.md Review
- **Priority**: P0 (Critical - Highest Priority Post-Launch)
- **Business Value**: High - Foundation for all future development
- **Urgency**: Immediate - Production risk exists today

### Target Users
**Primary Users**: Development Team (all current and future developers)
**Secondary Users**: QA Team, DevOps Engineers, Tech Lead
**Beneficiaries**: End users (through improved quality and fewer bugs)

### Success Criteria

**Must Have** (MVP - Weeks 1-3):
- [x] pytest infrastructure configured with fixtures and factories
- [x] Vitest infrastructure configured with test utilities
- [x] Authentication flow fully tested (signup, login, refresh, logout)
- [x] Resume CRUD operations fully tested (create, read, update, delete, download) # Note: Upload functionality does not exist, so it's not tested.
- [ ] Cover letter CRUD operations fully tested
- [ ] Application tracking fully tested
- [x] Database test isolation (tests don't interfere with each other)
- [x] CI/CD pipeline runs tests automatically on every PR
- [ ] Test coverage reports generated and visible

**Should Have** (V1.1 - Week 4):
- [ ] Security tests (SQL injection, XSS, authorization checks)
- [ ] File upload validation tests (malicious files, size limits)
- [ ] AI service integration tests (mocked Groq API)
- [ ] Error handling and edge case tests
- [ ] Performance tests for critical endpoints (<500ms response time)

**Nice to Have** (Future):
- [ ] Visual regression testing (screenshots of UI components)
- [ ] Load testing (1000 concurrent users)
- [ ] Mutation testing (verify tests actually catch bugs)
- [ ] Contract testing (API contracts between frontend/backend)

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Resumator
Description: AI-powered resume and cover letter management platform

Technology Stack:
  Backend:
    Framework: FastAPI
    Language: Python 3.11
    Database: PostgreSQL 15
    ORM: SQLAlchemy with Alembic migrations
    Cache: Redis 7
    Background Tasks: Celery
    AI Integration: Groq API
    Testing: pytest, pytest-asyncio, pytest-cov, httpx, factory-boy
    
  Frontend:
    Framework: React 18.2.0
    Bundler: Vite 7.1.5
    Styling: TailwindCSS 3.3.6
    State Management: React Context API
    Router: React Router v6.20.1
    Testing: Vitest, @testing-library/react, @testing-library/user-event
    Code Editor: CodeMirror 6
    Markdown: react-markdown, remark-gfm
    
Project Paths:
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
  Backend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend
  Backend Tests: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/tests
  Frontend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend
  Frontend Tests: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/__tests__
  Documentation: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/.vibe
```

### Testing Philosophy
**Test Pyramid Strategy**:
```
          /\
         /E2E\         10% - Critical user flows end-to-end
        /------\
       /Integr.\      30% - API endpoints, database operations
      /----------\
     /   Unit     \   60% - Business logic, services, utilities
    /--------------\
```

**Key Principles**:
1. **Fast Feedback**: Unit tests run in milliseconds, full suite in <5 minutes
2. **Test Behavior, Not Implementation**: Focus on user-facing behavior, not internal details
3. **Arrange-Act-Assert Pattern**: All tests follow AAA structure for clarity
4. **Independence**: Each test can run in isolation without dependencies
5. **Maintainability**: Tests are as readable as production code
6. **Confidence**: Tests catch real bugs and give confidence in deployments

---

## 🔍 PHASE 1: Identify Critical User Flows

Based on project analysis, these are the **5 critical user flows** that MUST have E2E test coverage:

### Flow 1: User Authentication Journey
```
1. New User Sign Up
   → Enter email, username, password
   → Submit registration
   → Receive success confirmation
   → User created in database

2. User Login
   → Enter email and password
   → Submit login form
   → Receive JWT tokens (access + refresh)
   → Redirected to dashboard

3. Token Refresh
   → Access token expires (simulated)
   → Frontend automatically uses refresh token
   → New access token received
   → User remains authenticated

4. User Logout
   → Click logout button
   → Tokens cleared from storage
   → Redirected to login page
   → Cannot access protected routes
```

**Why Critical**: Authentication is the foundation - if this fails, users cannot use the application.

**Test Coverage Required**:
- Backend: All auth endpoints (signup, login, refresh, logout)
- Frontend: AuthForm component, useAuth hook, protected route behavior
- E2E: Complete signup → login → use app → logout flow

---

### Flow 2: Resume Creation and Management
```
1. Create Resume
   → Navigate to "Create Resume" page
   → Fill in title, content (markdown), skills
   → Submit form
   → Resume saved to database
   → User sees success message
   → Resume appears in resume list

2. Upload Resume File
   → Click "Upload File" on existing resume
   → Select PDF or DOCX file
   → File uploaded to storage
   → Resume content extracted (if supported)
   → User sees updated resume

3. Edit Resume
   → Click "Edit" on resume card
   → Modify content in editor
   → Submit changes
   → Resume updated in database
   → User sees updated content

4. Delete Resume
   → Click "Delete" on resume card
   → Confirm deletion in modal
   → Resume removed from database
   → Resume removed from list
   → User sees success message
```

**Why Critical**: Resume management is the core feature - users come to create and manage resumes.

**Test Coverage Required**:
- Backend: All resume endpoints (CRUD operations, file upload/download)
- Frontend: ResumeForm, ResumeCard, ResumeList components
- E2E: Create → upload file → edit → delete flow

---

### Flow 3: Cover Letter Generation with AI
```
1. Create Cover Letter from Resume
   → Select a resume
   → Click "Generate Cover Letter"
   → Fill in company name and position
   → Submit to AI service (Groq)
   → AI generates personalized cover letter
   → User sees generated content
   → Cover letter saved to database

2. Customize Cover Letter
   → Edit AI-generated content
   → Add personal touches
   → Preview formatted output
   → Submit changes
   → Updated cover letter saved

3. Export Cover Letter to PDF
   → Click "Export to PDF"
   → Cover letter rendered as PDF
   → PDF downloaded to user's device
   → User can use for applications
```

**Why Critical**: AI-powered cover letter generation is a key differentiator and value proposition.

**Test Coverage Required**:
- Backend: Cover letter endpoints, AI integration (mocked), PDF generation
- Frontend: CoverLetterForm, AI generation UI, export functionality
- E2E: Select resume → generate → customize → export flow

---

### Flow 4: Job Application Tracking
```
1. Track New Application
   → Navigate to "Applications" page
   → Click "Add Application"
   → Fill in company, position, status, date
   → Add notes
   → Submit form
   → Application saved to database
   → Application appears in list

2. Update Application Status
   → Click on application card
   → Change status (Applied → Interview → Offer → Rejected)
   → Add interview notes
   → Submit update
   → Status updated in database
   → Visual indicator changes

3. View Application History
   → See all applications in chronological order
   → Filter by status (Applied, Interview, etc.)
   → Sort by date
   → View statistics (total applied, response rate)
```

**Why Critical**: Helps users organize their job search - retention feature.

**Test Coverage Required**:
- Backend: Application endpoints (CRUD, status updates)
- Frontend: ApplicationForm, ApplicationCard, status filtering
- E2E: Add application → update status → view history flow

---

### Flow 5: File Upload and Security
```
1. Secure File Upload
   → User uploads resume file (PDF/DOCX)
   → File validated (type, size)
   → File stored securely (local or S3)
   → File reference saved in database
   → User can download later

2. File Download
   → User clicks "Download" on resume
   → Authorization check (user owns file)
   → File retrieved from storage
   → File sent to user's browser
   → Download starts

3. Security Checks
   → Malicious file upload blocked
   → Oversized files rejected
   → Unauthorized access prevented
   → SQL injection attempts fail
   → XSS attempts neutralized
```

**Why Critical**: File handling is high-risk - security vulnerabilities can expose user data.

**Test Coverage Required**:
- Backend: File validation, authorization checks, security tests
- Frontend: File upload UI, error handling, progress indicators
- E2E: Upload → download → security validation flow

---

## 🎨 PHASE 2: Test Architecture Design

### Backend Testing Architecture

#### Test Database Strategy
```yaml
Approach: In-memory SQLite for speed and isolation
Rationale:
  - Fast: SQLite in-memory is 10-100x faster than PostgreSQL
  - Isolated: Each test gets fresh database
  - Simple: No need to clean up between tests
  - Portable: Works on any developer machine

Implementation:
  - Use SQLite for unit and integration tests
  - Use PostgreSQL for E2E tests (more realistic)
  - Shared fixtures in conftest.py
  - Function-scoped database fixture (fresh DB per test)

Foreign Key Support:
  - Enable PRAGMA foreign_keys=ON for SQLite
  - Ensures cascade deletes work in tests

Migration Testing:
  - Run Alembic migrations in test database
  - Verify schema matches SQLAlchemy models
```

#### Test Directory Structure
```
backend/tests/
├── __init__.py
├── conftest.py                 # ⭐ Shared fixtures (db, client, auth)
├── pytest.ini                  # ⭐ Configuration
├── .coveragerc                 # Coverage settings
├── factories/                  # Test data factories (factory-boy)
│   ├── __init__.py
│   ├── user_factory.py
│   ├── resume_factory.py
│   ├── cover_letter_factory.py
│   └── application_factory.py
├── fixtures/                   # Static test files
│   ├── sample_resume.pdf
│   ├── sample_resume.docx
│   └── sample_cover_letter.pdf
├── unit/                       # 60% of tests - Fast, isolated
│   ├── __init__.py
│   ├── services/
│   │   ├── test_resume_service.py
│   │   ├── test_cover_letter_service.py
│   │   ├── test_auth_service.py
│   │   └── test_storage_service.py
│   ├── models/
│   │   ├── test_user_model.py
│   │   ├── test_resume_model.py
│   │   └── test_cover_letter_model.py
│   └── utils/
│       └── test_validation.py
├── integration/                # 30% of tests - API + DB
│   ├── __init__.py
│   ├── api/
│   │   ├── test_auth_endpoints.py
│   │   ├── test_user_endpoints.py
│   │   ├── test_resume_endpoints.py
│   │   ├── test_cover_letter_endpoints.py
│   │   └── test_application_endpoints.py
│   └── db/
│       └── test_database_operations.py
└── e2e/                        # 10% of tests - Complete flows
    ├── __init__.py
    ├── test_auth_workflow.py
    ├── test_resume_workflow.py
    └── test_cover_letter_workflow.py
```

---

### Frontend Testing Architecture

#### Component Testing Strategy
```yaml
Approach: Test components as users would interact with them
Tools: Vitest + React Testing Library + user-event

Query Priority:
  1. getByRole('button', { name: 'Submit' })     # Most semantic
  2. getByLabelText('Email')                     # Good for forms
  3. getByPlaceholderText('Enter email')         # Acceptable
  4. getByText('Welcome')                        # Content
  5. getByTestId('submit-btn')                   # Last resort

User Interactions:
  - Use userEvent.click() instead of fireEvent.click()
  - Use userEvent.type() for form inputs (more realistic)
  - Wait for async operations with waitFor()
  - Check loading states, not just final state

What to Test:
  ✅ Component renders without crashing
  ✅ Displays correct data from props
  ✅ User interactions trigger correct callbacks
  ✅ Loading states display properly
  ✅ Error states display properly
  ✅ Form validation works
  ✅ Navigation happens on success

What NOT to Test:
  ❌ Implementation details (state variable names)
  ❌ Third-party library internals
  ❌ Exact CSS styles
  ❌ Component lifecycle methods
```

#### Test Directory Structure
```
frontend/src/
├── __tests__/
│   ├── setup.js               # ⭐ Global test configuration
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginPage.test.jsx
│   │   │   └── RegisterPage.test.jsx
│   │   ├── Resumes/
│   │   │   ├── ResumeCard.test.jsx
│   │   │   ├── ResumeForm.test.jsx
│   │   │   └── ResumeList.test.jsx
│   │   ├── CoverLetters/
│   │   │   ├── CoverLetterCard.test.jsx
│   │   │   └── CoverLetterForm.test.jsx
│   │   └── Applications/
│   │       └── ApplicationCard.test.jsx
│   ├── hooks/
│   │   ├── useAuth.test.jsx
│   │   ├── useResumes.test.js
│   │   └── useCoverLetters.test.js
│   ├── services/
│   │   └── api.test.js
│   ├── pages/
│   │   ├── Login.test.jsx
│   │   ├── Dashboard.test.jsx
│   │   └── ResumesPage.test.jsx
│   └── e2e/
│       ├── signup-flow.test.jsx
│       └── resume-creation.test.jsx
└── test-utils/                 # ⭐ Test utilities
    ├── test-utils.jsx         # renderWithProviders
    ├── mocks.js               # Mock data (users, resumes, etc.)
    └── handlers.js            # MSW API handlers
```

---

## 🛠️ PHASE 3: Implementation Milestones

### Week 1: Foundation & Authentication
```
Day 1-2: Backend Test Infrastructure (8 hours)
├── ✅ Create tests/ directory structure
├── ✅ Configure pytest.ini and conftest.py
├── ✅ Set up database fixtures (in-memory SQLite)
├── ✅ Create user factory with factory-boy
├── ✅ Add sample PDF/DOCX files to fixtures/
├── ✅ Write first smoke test (health check endpoint)
└── ✅ Verify pytest runs without errors

Day 3-4: Frontend Test Infrastructure (6 hours)
├── ✅ Configure Vitest in vite.config.js
├── ✅ Create setup.js with global mocks
├── ✅ Set up test-utils/test-utils.jsx (renderWithProviders)
├── ✅ Create mock data in test-utils/mocks.js
├── ✅ Configure MSW handlers for API mocking
├── ✅ Write first component smoke test
└── ✅ Verify npm test runs without errors

Day 5: CI/CD Integration (4 hours)
├── ✅ Create .github/workflows/tests.yml
├── ✅ Configure backend test job (pytest + coverage)
├── ✅ Configure frontend test job (vitest + coverage)
├── ✅ Set up coverage reporting (Codecov)
├── ✅ Test workflow with sample PR
└── ✅ Add status badge to README.md

🎯 Milestone 1 Complete: Test infrastructure ready ✅
```

### Week 2: Authentication & Resume Tests
```
Day 1-2: Backend Auth Tests (12 hours)
├── ✅ Unit Tests:
│   ├── ✅ Password hashing (bcrypt)
│   ├── ✅ JWT token creation and validation
│   └── ✅ Token refresh logic
├── ✅ Integration Tests:
│   ├── ✅ POST /signup (success)
│   ├── ✅ POST /login (success, wrong password)
│   ├── ✅ POST /refresh (valid)
│   └── ✅ POST /logout
└── Target: 90% auth coverage

Day 3: Frontend Auth Tests (8 hours)
├── Component Tests:
│   ├── ✅ LoginForm (render, validation, submit, errors)
│   └── ✅ SignupForm (render, validation, submit, errors)
├── Hook Tests:
│   └── ✅ useAuth (login, logout, refresh, persistence)
└── Target: 85% auth coverage

Day 4-5: Backend Resume Tests (16 hours)
├── ✅ Unit Tests:
│   ├── ✅ Resume service (create, update, parse file)
│   └── ✅ File storage service (upload, download, validate)
├── ✅ Integration Tests:
│   ├── ✅ POST /resumes (create with valid/invalid data)
│   ├── ✅ GET /resumes (list, empty, pagination)
│   ├── ✅ GET /resumes/{id} (success, not found, not authorized)
│   ├── ✅ PUT /resumes/{id} (update, validation)
│   ├── ✅ DELETE /resumes/{id} (success, cascade to cover letters)
│   ├── ✅ POST /resumes/{id}/upload (PDF, DOCX, invalid file)
│   └── ✅ GET /resumes/{id}/download (success, authorization)
└── Target: 85% resume coverage

🎯 Milestone 2 Complete: Auth + Resume tests done ✅
```

### Week 3: Cover Letters & Applications
```
Day 1-2: Backend Cover Letter Tests (14 hours)
├── Unit Tests:
│   ├── AI service integration (mocked Groq API)
│   ├── PDF generation service
│   └── Content templating
├── Integration Tests:
│   ├── POST /cover-letters (create from resume)
│   ├── GET /cover-letters (list with filters)
│   ├── PUT /cover-letters/{id} (update content)
│   ├── DELETE /cover-letters/{id}
│   ├── POST /cover-letters/{id}/generate (AI generation)
│   └── POST /cover-letters/{id}/export (PDF export)
└── Target: 85% cover letter coverage

Day 3: Backend Application Tests (10 hours)
├── Integration Tests:
│   ├── POST /applications (create new)
│   ├── GET /applications (list, filter by status)
│   ├── PUT /applications/{id} (update status, notes)
│   └── DELETE /applications/{id}
└── Target: 80% application coverage

Day 4-5: Frontend Resume, Cover Letter, Application Tests (14 hours)
├── Component Tests:
│   ├── ResumeForm, ResumeCard, ResumeList
│   ├── CoverLetterForm, CoverLetterCard
│   └── ApplicationForm, ApplicationCard
├── Hook Tests:
│   ├── useResumes (CRUD operations, file upload)
│   ├── useCoverLetters (CRUD, AI generation)
│   └── useApplications (CRUD, status updates)
└── Target: 80% coverage for all

🎯 Milestone 3 Complete: All features have tests
```

### Week 4: Security, E2E & Documentation
```
Day 1: Security Tests (12 hours)
├── Backend Security:
│   ├── SQL injection prevention (parameterized queries)
│   ├── XSS prevention (input sanitization)
│   ├── Authorization checks (user can only access own data)
│   ├── File upload validation (size, type, malicious content)
│   ├── Rate limiting tests
│   └── JWT token tampering detection
├── Frontend Security:
│   ├── XSS prevention in rendered markdown
│   ├── Input sanitization before API calls
│   └── Secure file upload validation
└── Target: All security vectors covered

Day 2: E2E Tests (8 hours)
├── Backend E2E:
│   ├── Complete auth flow (signup → login → logout)
│   ├── Resume lifecycle (create → upload → edit → delete)
│   └── Cover letter workflow (create → generate → export)
├── Frontend E2E:
│   ├── New user onboarding
│   └── Complete resume creation with file upload
└── Target: All 5 critical flows covered

Day 3: Edge Cases & Error Handling (8 hours)
├── Network failures and retries
├── Invalid/malformed data
├── Concurrent operations
├── Database connection failures
├── External service timeouts (AI, storage)
└── Browser compatibility issues

Day 4: Documentation (6 hours)
├── Write TESTING.md guide
│   ├── How to run tests
│   ├── How to write tests
│   ├── Test structure explanation
│   ├── Best practices
│   └── Troubleshooting
├── Update README.md with test info
├── Create test examples/templates
└── Document CI/CD process

Day 5: Final Validation (4 hours)
├── Review all coverage reports (backend 80%+, frontend 70%+)
├── Fix any flaky tests
├── Optimize slow tests (mark with @pytest.mark.slow)
├── Run full test suite 10 times (ensure reliability)
├── Generate final test report
└── Team walkthrough and training

🎯 Milestone 4 Complete: Testing fully implemented! ✅
```

---

## 📊 PHASE 4: Configuration Templates

### Backend: pytest.ini
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --strict-markers
    --cov=app
    --cov-report=html:htmlcov
    --cov-report=term-missing:skip-covered
    --cov-fail-under=80
    --maxfail=5
    --tb=short
    -v
    -ra
markers =
    unit: Unit tests (fast, isolated)
    integration: Integration tests (database, API)
    e2e: End-to-end tests (full user flows)
    slow: Tests that take > 1 second
    security: Security-related tests

[coverage:run]
source = app
omit = 
    */tests/*
    */migrations/*
    */venv/*
    */__pycache__/*
    */conftest.py

[coverage:report]
precision = 2
show_missing = True
skip_covered = False
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstractmethod
    @overload
```

### Backend: conftest.py (Essential Fixtures)
```python
"""
Shared pytest fixtures for all tests.
These fixtures provide database, client, authentication, and test data.
"""
import os
import pytest
from typing import Generator, Dict
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from main import app

# Use in-memory SQLite for speed
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Enable foreign keys for SQLite
@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create fresh database for each test.
    Automatically creates tables, yields session, then drops tables.
    """
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    FastAPI test client with database override.
    All API calls use the test database.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user_data() -> Dict[str, str]:
    """Sample user registration data for tests."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "SecurePass123!",
        "full_name": "Test User"
    }


@pytest.fixture
def authenticated_user(client: TestClient, sample_user_data: Dict) -> Dict:
    """
    Creates a user, logs in, returns user data + auth token.
    Most tests need authenticated access, so this is very common.
    """
    # Register
    response = client.post("/api/v1/auth/signup", json=sample_user_data)
    user = response.json()
    
    # Login
    login_response = client.post("/api/v1/auth/login", json={
        "email": sample_user_data["email"],
        "password": sample_user_data["password"]
    })
    token_data = login_response.json()
    
    return {
        "user": user,
        "token": token_data["access_token"],
        "headers": {"Authorization": f"Bearer {token_data['access_token']}"}
    }


@pytest.fixture
def auth_headers(authenticated_user: Dict) -> Dict[str, str]:
    """Shortcut to get just the authorization headers."""
    return authenticated_user["headers"]


@pytest.fixture
def mock_groq_service(monkeypatch):
    """Mock Groq AI service to avoid external API calls in tests."""
    def mock_generate(*args, **kwargs):
        return "This is a mock AI-generated cover letter."
    
    monkeypatch.setattr(
        "app.services.groq_service.GroqService.generate_text",
        mock_generate
    )
```

### Frontend: vitest.config.js
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        '**/test-utils/**',
        '**/mocks/**',
        'src/main.jsx',
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Frontend: setup.js
```javascript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
};

// Mock window.scrollTo
global.scrollTo = vi.fn();
```

### Frontend: test-utils.jsx
```javascript
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Custom render with all providers.
 * Use this instead of @testing-library/react render.
 */
export function renderWithProviders(
  ui,
  {
    initialAuthState = { user: null, isAuthenticated: false },
    route = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider initialState={initialAuthState}>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
```

---

## 📝 PHASE 5: Test Writing Guidelines

### Backend Unit Test Template

```python
"""
Unit tests for [ServiceName].
Tests business logic in isolation without database or external dependencies.
"""
import pytest
from unittest.mock import Mock, patch
from app.services.example_service import ExampleService


class TestExampleService:
    """Test suite for ExampleService business logic."""
    
    @pytest.fixture
    def service(self):
        """Create service instance for each test."""
        return ExampleService()
    
    def test_method_with_valid_input_returns_expected_output(self, service):
        """
        GIVEN: Valid input data
        WHEN: Calling service method
        THEN: Should return expected output
        """
        # Arrange
        input_data = {"key": "value"}
        expected_output = {"result": "success"}
        
        # Act
        actual_output = service.process(input_data)
        
        # Assert
        assert actual_output == expected_output
    
    def test_method_with_invalid_input_raises_exception(self, service):
        """
        GIVEN: Invalid input data
        WHEN: Calling service method
        THEN: Should raise ValueError with descriptive message
        """
        # Arrange
        invalid_data = {"key": None}
        
        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            service.process(invalid_data)
        
        assert "key cannot be None" in str(exc_info.value)
    
    @pytest.mark.parametrize("input_value,expected", [
        ("test1", "result1"),
        ("test2", "result2"),
        ("test3", "result3"),
    ])
    def test_method_with_multiple_inputs(self, service, input_value, expected):
        """Test same behavior with different input values."""
        result = service.transform(input_value)
        assert result == expected
```

### Backend Integration Test Template

```python
"""
Integration tests for [API Endpoint].
Tests API endpoints with real database operations.
"""
import pytest
from fastapi.testclient import TestClient


class TestResumeEndpoints:
    """Integration tests for resume API endpoints."""
    
    def test_create_resume_with_valid_data_returns_201(
        self, 
        client: TestClient, 
        auth_headers: dict
    ):
        """
        GIVEN: Authenticated user with valid resume data
        WHEN: POST /api/v1/resumes
        THEN: Should return 201 Created with resume object
        """
        # Arrange
        resume_data = {
            "title": "Software Engineer Resume",
            "content": "## Experience\n\n- Senior Developer",
            "skills": ["Python", "FastAPI"],
            "years_experience": 5
        }
        
        # Act
        response = client.post(
            "/api/v1/resumes",
            json=resume_data,
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == resume_data["title"]
        assert "id" in data
        assert "created_at" in data
```

### Frontend Component Test Template

```javascript
/**
 * Tests for ComponentName.
 * Tests user interactions and rendering behavior.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/test-utils';
import ComponentName from '@/components/ComponentName';

describe('ComponentName', () => {
  it('should render with correct initial state', () => {
    /**
     * GIVEN: Component is rendered
     * WHEN: Component mounts
     * THEN: Should display expected elements
     */
    // Arrange & Act
    renderWithProviders(<ComponentName />);
    
    // Assert
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
  
  it('should handle user interaction correctly', async () => {
    /**
     * GIVEN: Component is rendered
     * WHEN: User clicks button
     * THEN: Should trigger expected behavior
     */
    // Arrange
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    renderWithProviders(<ComponentName onSubmit={mockCallback} />);
    
    // Act
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
```

---

## 🎯 PHASE 6: Success Validation

### Definition of Done Checklist

**Test Infrastructure:**
- [ ] pytest configured and working (backend/pytest.ini exists)
- [ ] Vitest configured and working (frontend/vitest.config.js exists)
- [ ] conftest.py has all essential fixtures (db, client, auth_headers)
- [ ] test-utils.jsx has renderWithProviders helper
- [ ] CI/CD workflow runs tests automatically (.github/workflows/tests.yml)

**Test Coverage:**
- [ ] Backend coverage ≥ 80% (run: `cd backend && pytest --cov`)
- [ ] Frontend coverage ≥ 70% (run: `cd frontend && npm test -- --coverage`)
- [ ] All auth endpoints have integration tests
- [ ] All resume endpoints have integration tests
- [ ] All cover letter endpoints have integration tests
- [ ] All application endpoints have integration tests

**Test Quality:**
- [ ] All tests pass consistently (`pytest --count=10` passes)
- [ ] No flaky tests (tests don't randomly fail)
- [ ] Test suite completes in < 5 minutes
- [ ] Tests follow naming convention (test_[action]_[condition]_[result])
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)

**E2E Coverage:**
- [ ] Authentication flow tested (signup → login → logout)
- [ ] Resume lifecycle tested (create → upload → edit → delete)
- [ ] Cover letter generation tested (create → generate → export)
- [ ] Application tracking tested (create → update → view)
- [ ] File security tested (upload validation → authorization)

**Documentation:**
- [ ] TESTING.md created and comprehensive
- [ ] README.md updated with testing section
- [ ] Test examples documented
- [ ] Troubleshooting guide available

**Process:**
- [ ] Tests required in PR template
- [ ] Tests reviewed in code review process
- [ ] CI/CD fails if tests fail
- [ ] Coverage reports visible in PRs
- [ ] Team trained on testing practices

### Validation Commands

```bash
# 1. Verify backend tests pass
cd backend
pytest -v --cov
# Expected: All tests pass, coverage ≥ 80%

# 2. Verify frontend tests pass
cd frontend
npm test -- --run --coverage
# Expected: All tests pass, coverage ≥ 70%

# 3. Verify no flaky tests (run 10 times)
cd backend
pytest --count=10 -x
# Expected: All 10 runs pass

# 4. Verify test speed
cd backend
time pytest
# Expected: < 3 minutes

cd frontend
time npm test -- --run
# Expected: < 2 minutes

# 5. Verify CI/CD works
git push origin feature-branch
# Create PR
# Expected: All CI checks pass

# 6. Check coverage reports
cd backend
pytest --cov --cov-report=html
open htmlcov/index.html

cd frontend
npm test -- --coverage
open coverage/index.html
```

---

## 📚 PHASE 7: Key Testing Principles for AI

### What the AI Must Understand

**1. Testing is Critical Infrastructure**
- Not optional or "nice to have"
- Must be implemented BEFORE considering task complete
- Quality is as important as the features themselves
- Tests prevent production incidents

**2. Test Pyramid Strategy**
- 60% unit tests: Fast, isolated, test business logic
- 30% integration tests: API + database interactions
- 10% E2E tests: Complete user workflows
- This ratio optimizes for speed and confidence

**3. Independence is Non-Negotiable**
- Each test must run in isolation
- Tests cannot depend on other tests
- No shared state between tests
- Each test creates its own test data
- Function-scoped fixtures ensure fresh state

**4. Mock External Dependencies**
- Always mock: AI services (Groq API), external APIs, file storage (when testing logic)
- Sometimes mock: Email services, payment gateways
- Never mock: Database (use test database), framework internals (FastAPI, React)
- Mocking speeds up tests and prevents external failures

**5. Test User Behavior, Not Implementation**
```javascript
// ❌ BAD - Tests implementation details
expect(component.state.isLoading).toBe(false);

// ✅ GOOD - Tests user-visible behavior
expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
```

**6. GIVEN-WHEN-THEN Pattern**
Every test should clearly state:
- GIVEN: Initial conditions/setup
- WHEN: Action being tested
- THEN: Expected outcome

**7. Accessibility in Frontend Tests**
Use accessible queries that reflect how users interact:
```javascript
// Best to worst query priority:
getByRole('button', { name: 'Submit' })  // ✅ Best
getByLabelText('Email')                  // ✅ Good
getByPlaceholderText('Enter email')      // ⚠️ OK
getByTestId('submit-button')             // ❌ Last resort
```

**8. Async Operations Need Special Handling**
```javascript
// ❌ BAD - Assumes immediate update
expect(screen.getByText('Success')).toBeInTheDocument();

// ✅ GOOD - Wait for async operation
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

**9. Test Both Success and Failure**
For every feature, test:
- Happy path (everything works)
- Error cases (validation failures, API errors)
- Edge cases (empty data, maximum values)
- Security (unauthorized access, malicious input)

**10. Fixtures and Factories Are Your Friends**
Don't manually create test data:
```python
# ❌ BAD - Manual creation is tedious and error-prone
user = User(
    email="test@example.com",
    username="testuser",
    hashed_password=hash_password("password"),
    # ... 20 more fields
)

# ✅ GOOD - Use factory
user = UserFactory()  # All fields auto-populated
user2 = UserFactory(email="specific@example.com")  # Override as needed
```

---

## 🚨 Common Pitfalls to Avoid

### Testing Anti-Patterns

**❌ Writing tests after code is "done"**
- Tests become an afterthought
- Harder to write tests for untestable code
- ✅ Solution: Write tests with or before code (TDD)

**❌ Testing implementation details**
- Tests break when refactoring
- Tests don't reflect user experience
- ✅ Solution: Test behavior and outcomes

**❌ Tolerating flaky tests**
- Destroys confidence in test suite
- Teams ignore failures
- ✅ Solution: Fix immediately or delete test

**❌ Slow test suites**
- Developers skip running tests
- CI/CD takes too long
- ✅ Solution: Optimize, parallelize, mock I/O

**❌ No test review in code review**
- Poor test quality accumulates
- Tests don't actually test anything
- ✅ Solution: Review tests as rigorously as code

**❌ Mocking too much**
- Tests pass but code is broken
- False confidence
- ✅ Solution: Only mock external dependencies

**❌ Complex test setup**
- Tests are hard to understand
- Discourages writing more tests
- ✅ Solution: Use fixtures and factories

---

## 📈 Metrics to Track Post-Implementation

### Test Health Metrics
```yaml
Coverage Metrics:
  - Backend Coverage %: Track weekly, target ≥80%
  - Frontend Coverage %: Track weekly, target ≥70%
  - Critical Path Coverage: Must be 100%

Performance Metrics:
  - Test Execution Time: Target <5 minutes total
  - Backend Tests: Target <3 minutes
  - Frontend Tests: Target <2 minutes
  - CI/CD Duration: Target <8 minutes total

Reliability Metrics:
  - Flaky Test Count: Target = 0
  - Test Pass Rate: Target = 100%
  - False Positive Rate: Target <1%

Quality Impact Metrics:
  - Bugs Caught in Tests: Count monthly
  - Production Incidents: Should decrease 70%+
  - Bug Fix Time: Should decrease 40%+
  - Deployment Frequency: Should increase 50%+
  - Rollback Rate: Should decrease 75%+

Developer Experience:
  - Time to Write Tests: Average per feature
  - Test Debugging Time: Track weekly
  - Developer Confidence: Survey quarterly
```

---

## 🎓 Resources for Implementation

### Documentation
- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Examples to Study
Look at these open-source projects for testing inspiration:
- FastAPI's own test suite
- React Testing Library examples
- pytest-django tests
- Real-world applications on GitHub

---

## ✅ Final Checklist Before Completing Task

```
Infrastructure:
[ ] pytest.ini configured with correct settings
[ ] conftest.py has db, client, auth_headers fixtures
[ ] vitest.config.js configured with coverage thresholds
[ ] setup.js has all necessary global mocks
[ ] test-utils.jsx has renderWithProviders
[ ] CI/CD workflow file exists and works

Coverage:
[ ] Backend: pytest --cov shows ≥80%
[ ] Frontend: npm test --coverage shows ≥70%
[ ] All critical paths have tests
[ ] All API endpoints have integration tests
[ ] All components have unit tests

Quality:
[ ] All tests pass: pytest && npm test
[ ] No flaky tests: pytest --count=10 passes
[ ] Fast execution: Total time <5 minutes
[ ] Follows naming conventions
[ ] Uses AAA pattern consistently

E2E:
[ ] Auth flow: signup → login → logout
[ ] Resume flow: create → upload → edit → delete
[ ] Cover letter flow: create → generate → export
[ ] Application flow: create → update → view
[ ] Security: file validation, authorization

Documentation:
[ ] TESTING.md created and comprehensive
[ ] README.md updated with testing info
[ ] Team trained on testing practices
[ ] Examples documented

Process:
[ ] PR template requires tests
[ ] Code review includes test review
[ ] CI/CD runs on every PR
[ ] Build fails if tests fail
[ ] Coverage visible in PRs

Validation:
[ ] Run validation commands above
[ ] All pass successfully
[ ] Team confident in deployment
```

---

## 🎉 Success Indicators

You'll know testing is successful when:

✅ **Developers write tests without being asked**
- Tests are part of the workflow, not an afterthought
- Team sees value in testing

✅ **Deployments are confident and frequent**
- No fear of breaking production
- Can deploy multiple times per day

✅ **Bugs are caught in tests, not production**
- CI/CD catches issues before merge
- Production is stable

✅ **Refactoring is safe and common**
- Tests provide safety net
- Code quality improves continuously

✅ **Code review focuses on design, not bugs**
- Tests verify correctness
- Reviews focus on architecture

✅ **Team trusts the test suite**
- When tests pass, code is ready
- No manual testing needed for most changes

---

## 📞 Support & Questions

### Getting Help

**During Implementation:**
- Review TESTING.md for detailed guidance
- Check test examples in codebase
- Look at similar tests for patterns
- Ask in team chat or code review

**Common Questions:**
- "How do I test this component?" → See test templates above
- "How do I mock this API?" → Use fixtures/monkeypatch
- "Why is my test flaky?" → Check for async issues, shared state
- "How do I speed up tests?" → Use in-memory DB, mock I/O

**Troubleshooting:**
See TESTING.md Section 5: Troubleshooting for common issues and solutions

---

**This document is your complete guide for implementing automated testing in Resumator. Follow the phases sequentially, validate at each milestone, and ensure all success criteria are met. Testing is not complete until all checkboxes are ✅.**

---

**Document Version**: 1.0  
**Created**: 2025-10-25  
**Type**: Critical Infrastructure Task  
**Estimated Duration**: 4 weeks (120-160 hours)  
**Priority**: P0 - Must complete before any new features**