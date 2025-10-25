# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: 031

---

## 🎯 Task Definition

### Issue Summary
**The backend continues to return a 404 Not Found for the login endpoint (`/api/v1/auth/login`), despite previous debugging steps, indicating a deeper issue with route registration or discovery.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: `GET https://resumator.figuedmundo.com/api/health` returns `{"status": "healthy", ...}`.
- [x] Symptom 2: `POST https://resumator.figuedmundo.com/api/v1/auth/login` returns `404 {"detail": "Not Found"}`.
- [x] Symptom 3: Removing Gunicorn's `--preload` flag did not resolve the 404.
- [x] Symptom 4: Directly including `auth.router` in `main.py` did not resolve the 404.

### User Impact
- **Severity**: Critical
- **Affected Users**: All users
- **Workaround Available**: No
- **Business Impact**: The application is non-functional as users cannot authenticate.

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Resumator
Technology Stack:
  Frontend: React 18.2.0, Vite, TailwindCSS 3.3.6
  Backend: FastAPI, Python 3.11, PostgreSQL
  Containerization: Docker, Docker Compose
  Reverse Proxy: Caddy
  Web Server: Gunicorn with UvicornWorker
```

### Project Paths:
```
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
  Resumator App (Prod): /srv/apps/resumator
  Backend Dockerfile: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/Dockerfile.prod
  Backend Main: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/main.py
  Backend Auth Routes: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/app/api/v1/auth.py
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
#### Output Format:
```markdown
### Problem Understanding
**What**: The backend is returning a 404 for the login endpoint, despite the `/api/health` endpoint working and all previous debugging steps. This indicates a fundamental issue with how the login route is being registered or discovered by FastAPI.
**Expected**: The login endpoint (`/api/v1/auth/login`) should return a 200 OK or 401 Unauthorized (if credentials are bad).
**Actual**: The login endpoint returns a 404 Not Found.
**Type**: Application Logic / Environment Issue
```

---

### Step 1.2: Identify Affected Areas
#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Backend Application Entry Point (FastAPI `main.py`)
- [x] Backend Router Definitions (`app/api/v1/auth.py`)
- [x] Python Module Import Mechanism within Docker

**Primary Files**:
- `backend/main.py`: Where routers are included.
- `backend/app/api/v1/auth.py`: Where the login route is defined.
```

---

### Step 1.3: Gather Project Context
#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `backend/main.py` (after debugging step 029)
**Purpose**: Main FastAPI application setup.
**Current Approach**: Directly includes `auth.router` with `prefix="/api/v1/auth"`.
**Issues Found**: Despite this direct inclusion, the login route is still not found.

**Key Code Snippets**:
```python
# backend/main.py (current state after Task 029)
# ...
from app.api.v1 import auth # Import auth directly
# ...
    app.include_router(auth.router, prefix="/api/v1/auth") # Directly include auth router
# ...
```

**Observation**: The `/api/health` endpoint works, indicating the FastAPI application is running and basic routes are registered. The persistent 404 for `/api/v1/auth/login` suggests that the `auth.router` (or its contents) are not being correctly loaded or registered by the FastAPI instance, even when directly included.


---

### Step 1.4: Root Cause Analysis
#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: `POST /api/v1/auth/login` returns 404 Not Found, while `/api/health` works.
**Immediate Cause**: The `/login` route from `auth.router` is not present in the FastAPI application's routing table at runtime.
**Root Cause**: This is highly indicative of a Python module import issue or a problem with how the `APIRouter` instance in `auth.py` is being created or populated. If `auth.py` is not fully executed or if `router = APIRouter()` is somehow re-initialized or not correctly referenced, its routes would not be registered. Given the Docker environment, it could be related to Python's module loading mechanism or a subtle interaction with the Gunicorn/Uvicorn setup.
**Why It Happened**: The exact reason is still elusive, but the persistence of the 404 suggests a deeper problem than simple prefixing or Gunicorn preloading.

**Impact Chain**:
Backend starts → `main.py` attempts to include `auth.router` → `auth.router` (or its routes) not correctly loaded/registered → Request for `/api/v1/auth/login` arrives → FastAPI cannot find matching route → 404 Not Found.
```

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
#### Output Format:
```markdown
### Success Criteria

**Functional Requirements**:
- [x] `POST https://resumator.figuedmundo.com/api/v1/auth/login` must return a 200 OK or 401 Unauthorized (if credentials are bad).

**Technical Requirements**:
- [x] The login endpoint must be correctly registered and accessible.
- [x] Debugging information in logs should confirm router registration.

**Acceptance Tests**:
1. **Test**: Attempt to log in to the application at `https://resumator.figuedmundo.com`.
   **Expected**: The login process proceeds beyond the 404 error.
```

---

### Step 2.2: Determine Solution Approach
#### Output Format:
```markdown
### Solution Approach

**Chosen Approach**: Debugging Step (Add Logging for Router Registration)

**Rationale**:
- Since the problem persists despite simplifying the routing and addressing Gunicorn preloading, the next logical step is to add explicit logging to confirm whether the `auth.router` is being created and its routes are being registered as expected within the running application instance.

**Trade-offs**:
- **Pros**: Provides direct visibility into the router registration process, which is crucial for diagnosing this type of persistent 404.
- **Cons**: Requires modifying code for debugging, which will need to be reverted later. Adds temporary verbosity to logs.

**Alternative Considered**: Random changes or guessing.
**Why Not Chosen**: Ineffective and time-consuming for a persistent, subtle issue.
```

---

### Step 2.3: Break Down into Steps
#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Add Debugging Logs to `backend/main.py` and `backend/app/api/v1/auth.py`
**Priority**: Critical
**Estimated Time**: 15m
**Dependencies**: None

**Objectives**:
- [ ] Add `logger.info` statements in `main.py` to confirm `auth.router` import and inclusion.
- [ ] Add `logger.info` statements in `auth.py` to confirm `APIRouter()` instantiation and route definition.

**Changes Required**:
- `backend/main.py`: Add logging statements.
- `backend/app/api/v1/auth.py`: Add logging statements.

**Deliverables**:
- [ ] Updated Python files with debugging logs.

**Verification**:
- [ ] The backend should start and produce the new log messages.

---

#### Step 2: Rebuild and Deploy the Backend Service and Check Logs
**Priority**: Critical
**Estimated Time**: 10m
**Dependencies**: Step 1

**Objectives**:
- [ ] Trigger a new build of the `backend` service to apply the debugging changes.
- [ ] Deploy the newly built container.
- [ ] Examine the backend container logs for the new debugging messages.

**Changes Required**:
- Execute shell commands on the production server.

**Deliverables**:
- [ ] Log output that confirms or denies router registration.

**Verification**:
- [ ] Analyze logs for expected messages.
```

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide

### File: `backend/main.py`

**Current Code** (Relevant Section - after Task 029):
```python
# backend/main.py
import logging
from fastapi import FastAPI
# ... other imports
from app.api.v1 import auth # Import auth directly
# ...
logger = logging.getLogger(__name__)
# ...
def create_application() -> FastAPI:
    # ...
    app = FastAPI(...)
    # ...
    # Include API routes (TEMPORARY DEBUGGING STEP)
    # app.include_router(api_router, prefix="/api") # Comment out this line
    app.include_router(auth.router, prefix="/api/v1/auth") # Directly include auth router
    
    @app.get("/")
    # ...
    @app.get("/health")
    # ...
    return app
```

**Issue in This Code**:
- We need to confirm that `auth.router` is being imported and included as expected.

**Required Changes**:
1. Add a `logger.info` statement after importing `auth`.
2. Add a `logger.info` statement after including `auth.router`.
3. Add a `logger.info` statement to print all registered routes of the `app` instance.

**Updated Code**:
```python
# backend/main.py
import logging
from fastapi import FastAPI
# ... other imports
from app.api.v1 import auth # Import auth directly
# ...
logger = logging.getLogger(__name__)
# ...
def create_application() -> FastAPI:
    # ...
    app = FastAPI(...)
    # ...
    logger.info(f"Imported auth module: {auth}")

    # Include API routes (TEMPORARY DEBUGGING STEP)
    # app.include_router(api_router, prefix="/api") # Comment out this line
    app.include_router(auth.router, prefix="/api/v1/auth") # Directly include auth router
    logger.info(f"Included auth.router with prefix /api/v1/auth. Router routes: {auth.router.routes}")
    
    # Log all registered routes in the app
    logger.info("All registered routes in app:")
    for route in app.routes:
        logger.info(f"  Route: {route.path}, Methods: {route.methods if hasattr(route, 'methods') else 'N/A'}")

    @app.get("/")
    # ...
    @app.get("/health")
    # ...
    return app
```

---
### File: `backend/app/api/v1/auth.py`

**Current Code** (Relevant Section):
```python
# backend/app/api/v1/auth.py
import logging
from fastapi import APIRouter
# ... other imports

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
# ...

@router.post("/login", response_model=Token)
# ...
```

**Issue in This Code**:
- We need to confirm that the `APIRouter` instance is created and that the routes are being added to it.

**Required Changes**:
1. Add a `logger.info` statement after `router = APIRouter()`.
2. Add a `logger.info` statement after the `@router.post("/login")` decorator.

**Updated Code**:
```python
# backend/app/api/v1/auth.py
import logging
from fastapi import APIRouter
# ... other imports

logger = logging.getLogger(__name__)
router = APIRouter()
logger.info(f"APIRouter instance created in auth.py: {router}")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    # ...
):
    logger.info("Register route defined.")
    # ...

@router.post("/login", response_model=Token)
async def login(
    # ...
):
    logger.info("Login route defined.")
    # ...
```

**Explanation**:
- These logging statements will provide detailed output in the backend container logs, showing the exact state of router creation and registration. This will help us pinpoint if the `auth.router` is not being created, if its routes are not being added, or if the main application is not correctly including it.

---
### Final Step: Rebuild and Deploy Backend (On your Production Server) and Check Logs

**Instruction**:
- After modifying `backend/main.py` and `backend/app/api/v1/auth.py`, you need to rebuild and redeploy the backend service. Then, crucially, you must check the logs of the backend container.

**Command to rebuild and deploy**:
```bash
cd /srv/apps/resumator
docker-compose -f docker-compose.prod.yml up --build -d backend
```

**Command to check logs**:
```bash
docker logs resumator-backend
```

Look for the `logger.info` messages you added. They will tell us if the `auth` module is imported, if its router is created, if the login route is defined, and if the main app registers it. Clear your browser cache and test the application login at `https://resumator.figuedmundo.com` after redeploying.
