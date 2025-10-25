# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: 028

---

## 🎯 Task Definition

### Issue Summary
**Despite parsing `ALLOWED_ORIGINS` correctly, the backend still returns "Invalid host header" because `TrustedHostMiddleware` expects hostnames, not full URLs.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: Frontend login attempts result in a 400 Bad Request from the backend.
- [x] Symptom 2: The backend response body contains "Invalid host header".
- [x] Symptom 3: The frontend is correctly sending requests to `https://resumator.figuedmundo.com/api/v1/auth/login`.

### User Impact
- **Severity**: Critical
- **Affected Users**: All users
- **Workaround Available**: No
- **Business Impact**: The application remains non-functional in the production environment as the backend rejects all API requests.

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
  Backend Settings: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/app/config/settings.py
  Backend Main: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/main.py
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
#### Output Format:
```markdown
### Problem Understanding
**What**: The backend's `TrustedHostMiddleware` is rejecting requests because the `allowed_hosts` list contains full URLs (e.g., `https://resumator.figuedmundo.com`) instead of just hostnames (e.g., `resumator.figuedmundo.com`).
**Expected**: The backend should accept requests from `resumator.figuedmundo.com`.
**Actual**: The backend returns a 400 Bad Request with "Invalid host header".
**Type**: Configuration / Logic Issue
```

---

### Step 1.2: Identify Affected Areas
#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Backend Application Entry Point (FastAPI Middleware)

**Primary Files**:
- `backend/main.py`: Where `TrustedHostMiddleware` is configured and `allowed_hosts` is constructed.

**Secondary Files** (May need updates):
- `backend/app/config/settings.py`: Provides the `allowed_origins` list, which is the source of the URLs.
```

---

### Step 1.3: Gather Project Context
#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `backend/main.py`
**Purpose**: FastAPI application entry point, configures middleware.
**Current Approach**: It constructs the `allowed_hosts` list for `TrustedHostMiddleware` by concatenating `settings.allowed_origins` (which contains full URLs) with `["localhost", "127.0.0.1"]`.
**Issues Found**: `TrustedHostMiddleware` expects only hostnames (e.g., `example.com`), but it's receiving full URLs (e.g., `https://example.com`).

**Key Code Snippets**:
```python
# backend/main.py
    # Add trusted host middleware
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.allowed_origins + ["localhost", "127.0.0.1"]
        )
```

**File**: `backend/app/config/settings.py`
**Purpose**: Defines application settings, including `allowed_origins`.
**Current Approach**: The `allowed_origins` list now correctly parses the `ALLOWED_ORIGINS` environment variable, which contains full URLs.
**Issues Found**: This file correctly provides the URLs, but `main.py` needs to process them further for `TrustedHostMiddleware`.

**Key Code Snippets**:
```python
# backend/app/config/settings.py
    allowed_origins: list = json.loads(os.getenv(
        "ALLOWED_ORIGINS",
        json.dumps([
            "http://localhost:3000",
            # ...
        ])
    ))
```


---

### Step 1.4: Root Cause Analysis
#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: Backend returns "Invalid host header" (400 Bad Request).
**Immediate Cause**: The `TrustedHostMiddleware` receives a list of `allowed_hosts` that includes URL schemes (e.g., `https://`) which it does not expect for host validation.
**Root Cause**: The `allowed_hosts` parameter for `TrustedHostMiddleware` in `backend/main.py` is populated directly from `settings.allowed_origins`, which contains full URLs. `TrustedHostMiddleware` expects only the hostname part of the URL for security validation.
**Why It Happened**: A misunderstanding of the exact format required by `TrustedHostMiddleware` for its `allowed_hosts` parameter, leading to passing URLs instead of just hostnames.

**Impact Chain**:
`settings.allowed_origins` contains full URLs → `main.py` passes these full URLs to `TrustedHostMiddleware` → `TrustedHostMiddleware` attempts to validate `Host: resumator.figuedmundo.com` against `https://resumator.figuedmundo.com` → Mismatch causes "Invalid host header" error.
```

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
#### Output Format:
```markdown
### Success Criteria

**Functional Requirements**:
- [x] Backend must accept API requests from `resumator.figuedmundo.com`.
- [x] Frontend login attempts should no longer result in a 400 Bad Request with "Invalid host header".

**Technical Requirements**:
- [x] The `TrustedHostMiddleware` must be configured with a list of valid hostnames (e.g., `resumator.figuedmundo.com`).
- [x] The solution should correctly extract hostnames from the `settings.allowed_origins` URLs.

**Acceptance Tests**:
1. **Test**: Attempt to log in to the application at `https://resumator.figuedmundo.com`.
   **Expected**: The login process completes successfully, and the user is authenticated.
2. **Test**: Inspect network requests in the browser developer tools during login.
   **Expected**: The `POST` request to `https://resumator.figuedmundo.com/api/v1/auth/login` returns a 200 OK status code.
```

---

### Step 2.2: Determine Solution Approach
#### Output Format:
```markdown
### Solution Approach

**Chosen Approach**: Proper Fix

**Rationale**:
- This approach directly addresses the root cause by transforming the URLs from `settings.allowed_origins` into the hostnames expected by `TrustedHostMiddleware`.
- It reuses existing configuration (`settings.allowed_origins`) and avoids introducing new environment variables for the same information.

**Trade-offs**:
- **Pros**: Precise, efficient, and leverages existing data structures.
- **Cons**: Requires a small parsing step in `main.py`.

**Alternative Considered**: Introducing a new `TRUSTED_HOSTS` environment variable.
**Why Not Chosen**: This would duplicate information already present in `ALLOWED_ORIGINS` (after parsing), leading to potential inconsistencies and increased maintenance overhead.
```

---

### Step 2.3: Break Down into Steps
#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Modify `backend/main.py` to Extract Hostnames
**Priority**: Critical
**Estimated Time**: 15m
**Dependencies**: None

**Objectives**:
- [ ] Import `urllib.parse` to extract hostnames from URLs.
- [ ] Transform the `settings.allowed_origins` list (which contains full URLs) into a list of hostnames for `TrustedHostMiddleware`.

**Changes Required**:
- `backend/main.py`: Add import and modify the `allowed_hosts` parameter for `TrustedHostMiddleware`.

**Deliverables**:
- [ ] An updated `main.py` that correctly configures `TrustedHostMiddleware`.

**Verification**:
- [ ] The backend should start without configuration errors.

---

#### Step 2: Rebuild and Deploy the Backend Service
**Priority**: Critical
**Estimated Time**: 10m
**Dependencies**: Step 1

**Objectives**:
- [ ] Trigger a new build of the `backend` service to apply the configuration changes.
- [ ] Deploy the newly built container.

**Changes Required**:
- Execute a shell command on the production server.

**Deliverables**:
- [ ] A running, functional backend application.

**Verification**:
- [ ] Perform the acceptance tests defined in the Success Criteria.
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

# ... (logging and Base.metadata.create_all)

def create_application() -> FastAPI:
    # ... (app initialization)

    # Add security middleware first
    app.add_middleware(SecurityMiddleware)
    
    # Add trusted host middleware
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.allowed_origins + ["localhost", "127.0.0.1"]
        )
    
    # Add CORS middleware with development-friendly configuration
    # ... (rest of the file)
```

**Issue in This Code**:
- The `allowed_hosts` parameter for `TrustedHostMiddleware` is receiving full URLs from `settings.allowed_origins` instead of just hostnames.

**Required Changes**:
1. Import `urllib.parse` at the top of the file.
2. Before configuring `TrustedHostMiddleware`, create a new list of `trusted_hostnames` by iterating through `settings.allowed_origins` and extracting only the hostname from each URL.
3. Pass this `trusted_hostnames` list to `TrustedHostMiddleware`.

**Updated Code**:
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
import urllib.parse # Import urllib.parse

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
    # ... (rest of the file)
```

**Explanation**:
- `urllib.parse.urlparse(origin)` is used to break down each URL in `settings.allowed_origins` into its components.
- `parsed_uri.hostname` extracts just the hostname (e.g., `resumator.figuedmundo.com`) from the parsed URL.
- These extracted hostnames are collected into `trusted_hostnames` and then passed to `TrustedHostMiddleware` along with `localhost` and `127.0.0.1`.

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
