# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: 030

---

## 🎯 Task Definition

### Issue Summary
**The backend returns a 404 Not Found for the login endpoint (`/api/v1/auth/login`), even after extensive routing debugging, suggesting a potential issue with Gunicorn's `--preload` flag.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: `GET https://resumator.figuedmundo.com/api/health` returns `{"status": "healthy", ...}`.
- [x] Symptom 2: `POST https://resumator.figuedmundo.com/api/v1/auth/login` returns `404 {"detail": "Not Found"}`.
- [x] Symptom 3: Direct inclusion of `auth.router` in `main.py` did not resolve the 404.

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
**What**: The backend is returning a 404 for the login endpoint, despite the `/api/health` endpoint working and the routing structure appearing correct. This suggests a deeper issue with how the application is loaded or routes are registered.
**Expected**: The login endpoint (`/api/v1/auth/login`) should return a 200 OK or 401 Unauthorized (if credentials are bad).
**Actual**: The login endpoint returns a 404 Not Found.
**Type**: Application Loading / Configuration Issue
```

---

### Step 1.2: Identify Affected Areas
#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Backend Dockerfile (Gunicorn CMD)
- [x] Backend Application Loading (FastAPI/Gunicorn interaction)

**Primary Files**:
- `backend/Dockerfile.prod`: Contains the Gunicorn command that starts the FastAPI application.

**Secondary Files** (May need updates):
- None directly, but the behavior of the FastAPI application at runtime is affected.
```

---

### Step 1.3: Gather Project Context
#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `backend/Dockerfile.prod`
**Purpose**: Defines how the production backend Docker image is built and run.
**Current Approach**: Uses `gunicorn` with `uvicorn.workers.UvicornWorker` and the `--preload` flag.
**Issues Found**: The `--preload` flag can sometimes cause issues with FastAPI applications, especially when routes are registered dynamically or if there are side effects during module imports that are not compatible with preloading. This can lead to routes not being properly registered in worker processes.

**Key Code Snippets**:
```dockerfile
# backend/Dockerfile.prod
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--preload", "--max-requests", "1000", "--max-requests-jitter", "100"]
```

**Observation**: The `/api/health` endpoint works, which is a simple `@app.get` route defined directly in `main.py`. More complex routes, especially those included via `APIRouter`, might be more susceptible to issues with `--preload`.
```

---

### Step 1.4: Root Cause Analysis
#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: `POST /api/v1/auth/login` returns 404 Not Found, while `/api/health` works.
**Immediate Cause**: The `/api/v1/auth/login` route is not being registered or is not accessible in the Gunicorn worker processes.
**Root Cause**: The `--preload` flag in the Gunicorn command is a strong suspect. When `--preload` is used, the application is loaded once in the master process, and then worker processes are forked. If route registration or other application setup has side effects that are not correctly handled during this forking, some routes might not be available in the worker processes that actually handle requests.
**Why It Happened**: The `--preload` flag is often used for performance, but it can introduce complexities with certain application architectures, including some FastAPI setups.

**Impact Chain**:
Gunicorn `--preload` flag → FastAPI application loaded once in master process → Worker processes forked → Routes from `APIRouter` (like `/api/v1/auth/login`) not correctly registered/available in worker processes → Request to `/api/v1/auth/login` reaches worker → Worker cannot find route → 404 Not Found.
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
- [x] The Gunicorn command should be robust for FastAPI applications.

**Acceptance Tests**:
1. **Test**: Attempt to log in to the application at `https://resumator.figuedmundo.com`.
   **Expected**: The login process proceeds beyond the 404 error.
```

---

### Step 2.2: Determine Solution Approach
#### Output Format:
```markdown
### Solution Approach

**Chosen Approach**: Proper Fix (Remove `--preload`)

**Rationale**:
- Removing `--preload` is a common and recommended practice for debugging and often resolving route registration issues in Gunicorn/FastAPI setups. It ensures each worker loads the application independently, avoiding potential conflicts from preloading.

**Trade-offs**:
- **Pros**: High likelihood of resolving the 404 issue. Simplifies application loading for workers.
- **Cons**: May slightly increase memory usage (each worker loads the app) and potentially startup time (though often negligible for FastAPI). This is generally a safer default for FastAPI.

**Alternative Considered**: Further deep dive into FastAPI internals with `--preload`.
**Why Not Chosen**: This is significantly more complex and time-consuming. Removing `--preload` is a standard first debugging step for such issues.
```

---

### Step 2.3: Break Down into Steps
#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Modify `backend/Dockerfile.prod` to Remove `--preload`
**Priority**: Critical
**Estimated Time**: 5m
**Dependencies**: None

**Objectives**:
- [ ] Remove the `--preload` flag from the Gunicorn `CMD` instruction in `backend/Dockerfile.prod`.

**Changes Required**:
- `backend/Dockerfile.prod`: Edit the `CMD` line.

**Deliverables**:
- [ ] An updated `Dockerfile.prod` with a modified Gunicorn command.

**Verification**:
- [ ] The Dockerfile should build successfully.

---

#### Step 2: Rebuild and Deploy the Backend Service
**Priority**: Critical
**Estimated Time**: 10m
**Dependencies**: Step 1

**Objectives**:
- [ ] Trigger a new build of the `backend` service to apply the Dockerfile changes.
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

### File: `backend/Dockerfile.prod`

**Current Code** (Relevant Section):
```dockerfile
# backend/Dockerfile.prod
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--preload", "--max-requests", "1000", "--max-requests-jitter", "100"]
```

**Issue in This Code**:
- The `--preload` flag might be interfering with route registration in Gunicorn worker processes.

**Required Changes**:
1. Remove the `--preload` flag from the `CMD` instruction.

**Updated Code**:
```dockerfile
# backend/Dockerfile.prod
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--max-requests", "1000", "--max-requests-jitter", "100"]
```

**Explanation**:
- Removing `--preload` ensures that each Gunicorn worker process loads the FastAPI application independently. This can resolve issues where routes or other application components are not correctly initialized or registered when the application is preloaded in the master process and then forked to workers.

---
### Final Step: Rebuild and Deploy Backend (On your Production Server)

**Instruction**:
- After modifying `backend/Dockerfile.prod`, you need to rebuild and redeploy the backend service.

**Command**:
```bash
cd /srv/apps/resumator
docker-compose -f docker-compose.prod.yml up --build -d backend
```

After the command completes, clear your browser cache and test the application login at `https://resumator.figuedmundo.com`.
