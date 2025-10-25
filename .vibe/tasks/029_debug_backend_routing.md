# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: 029

---

## 🎯 Task Definition

### Issue Summary
**The backend returns a 404 Not Found for the login endpoint (`/api/v1/auth/login`), even though the `/api/health` endpoint is working, suggesting a routing or registration issue.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: `GET https://resumator.figuedmundo.com/api/health` returns `{"status": "healthy", ...}`.
- [x] Symptom 2: `POST https://resumator.figuedmundo.com/api/v1/auth/login` returns `404 {"detail": "Not Found"}`.

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
```

### Project Paths:
```
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
  Resumator App (Prod): /srv/apps/resumator
  Global Docker (Prod): /srv/docker
  Prod Caddyfile: /srv/docker/caddy/Caddyfile
  Prod App Docker Compose: /srv/apps/resumator/docker-compose.prod.yml
  Backend Main: /Users/edmundo.figuedmundo.com/projects/resumator/backend/main.py
  Backend API Init: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/app/api/__init__.py
  Backend API V1 Init: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/app/api/v1/__init__.py
  Backend Auth Routes: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/app/api/v1/auth.py
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
#### Output Format:
```markdown
### Problem Understanding
**What**: The backend is returning a 404 for the login endpoint, despite the `/api/health` endpoint working and the routing structure appearing correct in the code.
**Expected**: The login endpoint (`/api/v1/auth/login`) should return a 200 OK or 401 Unauthorized (if credentials are bad).
**Actual**: The login endpoint returns a 404 Not Found.
**Type**: Routing / Application Logic Issue
```

---

### Step 1.2: Identify Affected Areas
#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Backend Application Entry Point (FastAPI `main.py`)
- [x] Backend API Router Definitions (`app/api/__init__.py`, `app/api/v1/__init__.py`, `app/api/v1/auth.py`)

**Primary Files**:
- `backend/main.py`: Where the main `api_router` is included.
- `backend/app/api/__init__.py`: Where `v1_router` is included into `api_router`.
- `backend/app/api/v1/__init__.py`: Where `auth.router` is included into `v1_router`.
- `backend/app/api/v1/auth.py`: Where the `/login` endpoint is defined.
```

---

### Step 1.3: Gather Project Context
#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `backend/main.py`
**Purpose**: Main FastAPI application setup.
**Current Approach**: Includes `api_router` with `prefix="/api"`.
**Issues Found**: None apparent, but this is the top-level inclusion point.

**Key Code Snippets**:
```python
# backend/main.py
    app.include_router(api_router, prefix="/api")
```

**File**: `backend/app/api/__init__.py`
**Purpose**: Aggregates v1 routes.
**Current Approach**: Includes `v1_router` with `prefix="/v1"`.
**Issues Found**: None apparent.

**Key Code Snippets**:
```python
# backend/app/api/__init__.py
from app.api.v1 import api_router as v1_router
api_router = APIRouter()
api_router.include_router(v1_router, prefix="/v1")
```

**File**: `backend/app/api/v1/__init__.py`
**Purpose**: Aggregates specific v1 module routes.
**Current Approach**: Includes `auth.router` with `prefix="/auth"`.
**Issues Found**: None apparent.

**Key Code Snippets**:
```python
# backend/app/api/v1/__init__.py
from app.api.v1 import auth
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
```

**File**: `backend/app/api/v1/auth.py`
**Purpose**: Defines authentication endpoints.
**Current Approach**: Defines `/login` endpoint with `@router.post("/login")`.
**Issues Found**: None apparent.

**Key Code Snippets**:
```python
# backend/app/api/v1/auth.py
router = APIRouter()
@router.post("/login", response_model=Token)
async def login(
    # ...
):
    # ...
```
```

---

### Step 1.4: Root Cause Analysis
#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: `POST /api/v1/auth/login` returns 404 Not Found.
**Immediate Cause**: The FastAPI application is not matching the incoming request path to the defined `/login` route within the `auth` router.
**Root Cause**: Given that `/api/health` is working, the FastAPI application is running. The issue is likely a subtle problem with how the nested routers are being included or a runtime environment issue preventing the full route registration. This could be due to: 
    1. A caching issue where an older version of the code is running.
    2. An unexpected interaction with middleware that prevents route matching.
    3. A very subtle error in the router inclusion logic that is not immediately obvious.
**Why It Happened**: The exact reason is unclear without further debugging, but the current setup of nested routers, while standard, might be encountering an edge case or an environmental factor.

**Impact Chain**:
Request for `/api/v1/auth/login` → FastAPI application receives request → Router matching fails for `/v1/auth/login` → 404 Not Found.
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

**Acceptance Tests**:
1. **Test**: Attempt to log in to the application at `https://resumator.figuedmundo.com`.
   **Expected**: The login process proceeds beyond the 404 error.
```

---

### Step 2.2: Determine Solution Approach
#### Output Format:
```markdown
### Solution Approach

**Chosen Approach**: Debugging Step (Temporary Direct Inclusion)

**Rationale**:
- Since the routing structure appears correct, the next step is to isolate the problem by simplifying the router inclusion. Directly including the `auth.router` into the main app will help determine if the issue lies in the nested inclusion logic or elsewhere.

**Trade-offs**:
- **Pros**: Quickly isolates the problem to either the nested router structure or a deeper issue.
- **Cons**: This is a temporary debugging step and not the final solution. It will require reverting the change if the issue is found elsewhere.

**Alternative Considered**: Deep dive into FastAPI internals.
**Why Not Chosen**: This is more time-consuming and less efficient for initial problem isolation.
```

---

### Step 2.3: Break Down into Steps
#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Modify `backend/main.py` for Direct Router Inclusion
**Priority**: Critical
**Estimated Time**: 15m
**Dependencies**: None

**Objectives**:
- [ ] Temporarily modify `backend/main.py` to directly include `auth.router` with the full `/api/v1/auth` prefix.
- [ ] Comment out the existing nested router inclusions.

**Changes Required**:
- `backend/main.py`: Add import for `auth.router` and modify `app.include_router` calls.

**Deliverables**:
- [ ] An updated `main.py` for debugging purposes.

**Verification**:
- [ ] The backend should start without configuration errors.

---

#### Step 2: Rebuild and Deploy the Backend Service
**Priority**: Critical
**Estimated Time**: 10m
**Dependencies**: Step 1

**Objectives**:
- [ ] Trigger a new build of the `backend` service to apply the debugging changes.
- [ ] Deploy the newly built container.

**Changes Required**:
- Execute a shell command on the production server.

**Deliverables**:
- [ ] A running backend application with simplified routing.

**Verification**:
- [ ] Attempt to log in and observe the response.
```

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide

### File: `backend/main.py`

**Current Code** (Relevant Section):
```python
# backend/main.py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.api import api_router
from app.core.database import engine, Base
from app.core.middleware import SecurityMiddleware
from app.config.settings import settings
import urllib.parse

# ... (logging and Base.metadata.create_all)

def create_application() -> FastAPI:
    # ... (app initialization)

    # Add security middleware first
    app.add_middleware(SecurityMiddleware)
    
    # Extract hostnames from allowed_origins for TrustedHostMiddleware
    trusted_hostnames = []
    for origin in settings.allowed_origins:
        parsed_uri = urllib.parse.urlparse(origin)
        if parsed_uri.hostname:
            trusted_hostnames.append(parsed_uri.hostname)

    # Add trusted host middleware
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=trusted_hostnames + ["localhost", "127.0.0.1"]
        )
    
    # Add CORS middleware with development-friendly configuration
    if settings.debug:
        # Development: More permissive CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"] if settings.debug else settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        # Production: Strict CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allow_headers=[
                "Authorization", 
                "Content-Type", 
                "Accept", 
                "Origin", 
                "User-Agent", 
                "DNT", 
                "Cache-Control",
                "X-Mx-ReqToken",
                "Keep-Alive",
                "X-Requested-With",
                "If-Modified-Since",
                "X-Security-Nonce"
            ],
            expose_headers=["X-Rate-Limit-Remaining", "X-Rate-Limit-Limit"]
        )
    
    # Include API routes
    app.include_router(api_router, prefix="/api")
    
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Welcome to Resumator API",
            "version": "1.0.0",
            "docs": "/docs" if settings.debug else "disabled",
            "health": "/api/v1/health"
        }
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy", 
            "service": "resumator-api",
            "version": "1.0.0"
        }
    
    return app


# Create the application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

**Issue in This Code**:
- The nested inclusion of routers (`app -> api_router -> v1_router -> auth.router`) might be causing an unexpected issue with route registration.

**Required Changes**:
1. Import `auth` module directly from `app.api.v1`.
2. Comment out the existing `app.include_router(api_router, prefix="/api")` line.
3. Add a new `app.include_router(auth.router, prefix="/api/v1/auth")` line to directly include the authentication routes with the full prefix.

**Updated Code**:
```python
# backend/main.py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
# from app.api import api_router # Comment out this line
from app.api.v1 import auth # Import auth directly
from app.core.database import engine, Base
from app.core.middleware import SecurityMiddleware
from app.config.settings import settings
import urllib.parse

# ... (logging and Base.metadata.create_all)

def create_application() -> FastAPI:
    # ... (app initialization)

    # Add security middleware first
    app.add_middleware(SecurityMiddleware)
    
    # Extract hostnames from allowed_origins for TrustedHostMiddleware
    trusted_hostnames = []
    for origin in settings.allowed_origins:
        parsed_uri = urllib.parse.urlparse(origin)
        if parsed_uri.hostname:
            trusted_hostnames.append(parsed_uri.hostname)

    # Add trusted host middleware
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=trusted_hostnames + ["localhost", "127.0.0.1"]
        )
    
    # Add CORS middleware with development-friendly configuration
    if settings.debug:
        # Development: More permissive CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"] if settings.debug else settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        # Production: Strict CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allow_headers=[
                "Authorization", 
                "Content-Type", 
                "Accept", 
                "Origin", 
                "User-Agent", 
                "DNT", 
                "Cache-Control",
                "X-Mx-ReqToken",
                "Keep-Alive",
                "X-Requested-With",
                "If-Modified-Since",
                "X-Security-Nonce"
            ],
            expose_headers=["X-Rate-Limit-Remaining", "X-Rate-Limit-Limit"]
        )
    
    # Include API routes (TEMPORARY DEBUGGING STEP)
    # app.include_router(api_router, prefix="/api") # Comment out this line
    app.include_router(auth.router, prefix="/api/v1/auth") # Directly include auth router
    
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Welcome to Resumator API",
            "version": "1.0.0",
            "docs": "/docs" if settings.debug else "disabled",
            "health": "/api/v1/health"
        }
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy", 
            "service": "resumator-api",
            "version": "1.0.0"
        }
    
    return app


# Create the application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

**Explanation**:
- This change bypasses the nested router structure for the authentication routes. If the login endpoint now works, it indicates that the issue lies within the `app.api/__init__.py` or `app.api/v1/__init__.py` files, or how they are interacting.

---
### Final Step: Rebuild and Deploy Backend (On your Production Server)

**Instruction**:
- After modifying `backend/main.py`, you need to rebuild and redeploy the backend service.

**Command**:
```bash
cd /srv/apps/resumator
docker-compose -f docker-compose.prod.yml up --build -d backend
```

After the command completes, clear your browser cache and test the application login at `https://resumator.figuedmundo.com`.
