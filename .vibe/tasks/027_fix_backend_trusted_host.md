# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: 027

---

## 🎯 Task Definition

### Issue Summary
**The backend application is rejecting requests with a "400 Bad Request: Invalid host header" because its `TrustedHostMiddleware` is not configured to accept the production domain.**

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
  Backend Main: /Users/edmundo.figuedmundo.com/projects/resumator/backend/main.py
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
#### Output Format:
```markdown
### Problem Understanding
**What**: The backend's `TrustedHostMiddleware` is rejecting requests from the frontend due to an "Invalid host header" because the production domain is not in its `allowed_hosts` list.
**Expected**: The backend should accept requests from `https://resumator.figuedmundo.com`.
**Actual**: The backend returns a 400 Bad Request with "Invalid host header".
**Type**: Configuration Issue
```

---

### Step 1.2: Identify Affected Areas
#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Backend Configuration (Pydantic Settings)
- [x] Backend Application Entry Point (FastAPI Middleware)

**Primary Files**:
- `backend/app/config/settings.py`: Where `allowed_origins` is defined.
- `backend/main.py`: Where `TrustedHostMiddleware` is configured using `settings.allowed_origins`.

**Secondary Files** (May need updates):
- `docker-compose.prod.yml`: Sets the `ALLOWED_ORIGINS` environment variable, which `settings.py` needs to consume.
```

---

### Step 1.3: Gather Project Context
#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `backend/app/config/settings.py`
**Purpose**: Defines application settings loaded from environment variables.
**Current Approach**: The `allowed_origins` list is hardcoded with development-specific `localhost` entries. It does not parse the `ALLOWED_ORIGINS` environment variable.
**Issues Found**: The `ALLOWED_ORIGINS` environment variable set in `docker-compose.prod.yml` is not being used to populate this list, leading to an incorrect `allowed_hosts` configuration for `TrustedHostMiddleware` in production.

**Key Code Snippets**:
```python
# backend/app/config/settings.py
    # CORS - Allow both HTTP and HTTPS for development
    allowed_origins: list = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "https://localhost:3000", # Production HTTPS
        "https://localhost:5173", # Production HTTPS
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://127.0.0.1:5173",  # Alternative localhost
    ]
```

**File**: `backend/main.py`
**Purpose**: FastAPI application entry point, configures middleware.
**Current Approach**: It uses `settings.allowed_origins` to configure `TrustedHostMiddleware`.
**Issues Found**: Because `settings.allowed_origins` is hardcoded, the `TrustedHostMiddleware` in production does not include `https://resumator.figuedmundo.com` in its list of allowed hosts.

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
```

---

### Step 1.4: Root Cause Analysis
#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: Backend returns "Invalid host header" (400 Bad Request).
**Immediate Cause**: The `TrustedHostMiddleware` in `backend/main.py` does not include `https://resumator.figuedmundo.com` in its `allowed_hosts` list.
**Root Cause**: The `allowed_origins` list in `backend/app/config/settings.py` is hardcoded with development URLs and does not dynamically parse the `ALLOWED_ORIGINS` environment variable, which is correctly set in `docker-compose.prod.yml` for the production domain.
**Why It Happened**: The `settings.py` file was not updated to consume the `ALLOWED_ORIGINS` environment variable for the `allowed_origins` list, leading to a mismatch between the expected host and the configured trusted hosts in production.

**Impact Chain**:
`docker-compose.prod.yml` sets `ALLOWED_ORIGINS` env var → `settings.py` hardcodes `allowed_origins` list, ignoring env var → `main.py` uses hardcoded `settings.allowed_origins` for `TrustedHostMiddleware` → `TrustedHostMiddleware` does not recognize `resumator.figuedmundo.com` → 400 Bad Request: Invalid host header.
```

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
#### Output Format:
```markdown
### Success Criteria

**Functional Requirements**:
- [x] Backend must accept API requests from `https://resumator.figuedmundo.com`.
- [x] Frontend login attempts should no longer result in a 400 Bad Request with "Invalid host header".

**Technical Requirements**:
- [x] The `settings.allowed_origins` list in `backend/app/config/settings.py` must correctly reflect the `ALLOWED_ORIGINS` environment variable.
- [x] The `TrustedHostMiddleware` must correctly validate the production host header.

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
- This approach directly addresses the root cause by ensuring the `settings.allowed_origins` list is dynamically populated from the environment variable, which is the correct way to handle environment-specific configuration in a Dockerized application.
- It maintains the security benefits of `TrustedHostMiddleware` by explicitly allowing the production host.

**Trade-offs**:
- **Pros**: Robust, secure, and follows best practices for configuration management.
- **Cons**: Requires a rebuild and redeploy of the backend service.

**Alternative Considered**: Hardcoding `https://resumator.figuedmundo.com` into `settings.py`.
**Why Not Chosen**: This would reintroduce hardcoding, making the application less flexible for different deployment environments (e.g., staging, local development with different domains). Using environment variables is the preferred method.
```

---

### Step 2.3: Break Down into Steps
#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Modify `backend/app/config/settings.py` to Parse `ALLOWED_ORIGINS`
**Priority**: Critical
**Estimated Time**: 15m
**Dependencies**: None

**Objectives**:
- [ ] Update the `allowed_origins` property in `settings.py` to parse the `ALLOWED_ORIGINS` environment variable, which is a JSON string of allowed origins.

**Changes Required**:
- `backend/app/config/settings.py`: Modify the `allowed_origins` definition.

**Deliverables**:
- [ ] An updated `settings.py` that correctly consumes the `ALLOWED_ORIGINS` environment variable.

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

### File: `backend/app/config/settings.py`

**Current Code** (Relevant Section):
```python
# backend/app/config/settings.py
    # CORS - Allow both HTTP and HTTPS for development
    allowed_origins: list = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "https://localhost:3000", # Production HTTPS
        "https://localhost:5173", # Production HTTPS
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://127.0.0.1:5173",  # Alternative localhost
    ]
```

**Issue in This Code**:
- The `allowed_origins` list is hardcoded and does not dynamically read from the `ALLOWED_ORIGINS` environment variable.

**Required Changes**:
1. Import the `json` module to parse the environment variable.
2. Modify the `allowed_origins` definition to read from the `ALLOWED_ORIGINS` environment variable, parsing it as a JSON string. Provide a default list for development if the environment variable is not set.

**Updated Code**:
```python
# backend/app/config/settings.py
import os
import json # Import the json module
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ... (other settings)

    # CORS - Allow both HTTP and HTTPS for development
    # Dynamically load from environment variable, or use development defaults
    allowed_origins: list = json.loads(os.getenv(
        "ALLOWED_ORIGINS",
        json.dumps([
            "http://localhost:3000",  # React dev server
            "http://localhost:5173",  # Vite dev server
            "https://localhost:3000", # Production HTTPS
            "https://localhost:5173", # Production HTTPS
            "http://127.0.0.1:3000",  # Alternative localhost
            "http://127.0.0.1:5173",  # Alternative localhost
        ])
    ))

    # ... (rest of the class)
```

**Explanation**:
- The `json` module is used to parse the `ALLOWED_ORIGINS` environment variable, which is expected to be a JSON string (e.g., `"["https://resumator.figuedmundo.com"]"`).
- `os.getenv("ALLOWED_ORIGINS", ...)` retrieves the environment variable. If it's not set, it defaults to a JSON string representing the development `localhost` origins.
- `json.loads()` then converts this JSON string into a Python list.

---
### Final Step: Rebuild and Deploy Backend (On your Production Server)

**Instruction**:
- After modifying `backend/app/config/settings.py`, you need to rebuild and redeploy the backend service.

**Command**:
```bash
cd /srv/apps/resumator
docker-compose -f docker-compose.prod.yml up --build -d backend
```

After the command completes, clear your browser cache and test the application login at `https://resumator.figuedmundo.com`.
