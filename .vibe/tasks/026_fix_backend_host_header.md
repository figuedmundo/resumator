# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: 026

---

## 🎯 Task Definition

### Issue Summary
**After fixing the frontend API URL, the backend is now rejecting requests with a "400 Bad Request: Invalid host header" error.**

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
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
#### Output Format:
```markdown
### Problem Understanding
**What**: The backend is rejecting API requests from the frontend due to an "Invalid host header".
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
- [x] Reverse Proxy (Caddy)
- [x] Backend API (FastAPI host validation)

**Primary Files**:
- `/srv/docker/caddy/Caddyfile`: The global Caddy configuration for routing requests.
- `docker-compose.prod.yml`: Defines the backend service and its `ALLOWED_ORIGINS`.

**Secondary Files** (May need updates):
- None directly, but the backend's host validation logic is implicitly affected.
```

---

### Step 1.3: Gather Project Context
#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `/srv/docker/caddy/Caddyfile` (Relevant Section for Resumator)
**Purpose**: Caddy acts as a reverse proxy, routing external requests to internal Docker services.
**Current Approach**: The `handle_path /api/*` block proxies requests to `resumator-backend:8000`.
**Issues Found**: The `reverse_proxy` directive, by default, might not forward the original `Host` header from the client. Instead, it might send the internal service name (`resumator-backend`) as the `Host` header to the backend.

**Key Code Snippets**:
```caddy
# Resumator Application
{$RESUMATOR_DOMAIN} {
    # API traffic goes to the backend container
    handle_path /api/* {
        reverse_proxy resumator-backend:8000
    }
    # ...
}
```

**File**: `docker-compose.prod.yml` (Relevant Section for Backend)
**Purpose**: Defines the backend service and its environment variables.
**Current Approach**: The `ALLOWED_ORIGINS` environment variable is set to `["https://${RESUMATOR_DOMAIN}"]`.
**Issues Found**: The backend is configured to expect `resumator.figuedmundo.com` as the origin/host, but it's likely receiving `resumator-backend` due to Caddy's default proxy behavior.

**Key Code Snippets**:
```yaml
  backend:
    # ...
    environment:
      # ...
      - ALLOWED_ORIGINS=["https://${RESUMATOR_DOMAIN}"]
    # ...
```


---

### Step 1.4: Root Cause Analysis
#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: Backend returns "Invalid host header" (400 Bad Request).
**Immediate Cause**: The FastAPI backend receives a `Host` header that does not match its configured `ALLOWED_ORIGINS` or internal host validation rules.
**Root Cause**: The Caddy reverse proxy, when forwarding requests to the `resumator-backend` service, is not preserving the original `Host` header from the client's browser (`resumator.figuedmundo.com`). Instead, it's likely sending the internal Docker service name (`resumator-backend`) as the `Host` header to the backend.
**Why It Happened**: Caddy's default `reverse_proxy` behavior, without explicit `header_up` directives, can sometimes rewrite the `Host` header to the upstream server's address, which is not desired when the backend performs host validation based on the external domain.

**Impact Chain**:
Client sends request with `Host: resumator.figuedmundo.com` → Caddy proxies request, potentially rewriting `Host` to `resumator-backend` → Backend receives `Host: resumator-backend` → Backend's host validation fails (expects `resumator.figuedmundo.com`) → 400 Bad Request: Invalid host header.
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
- [x] The Caddy reverse proxy must correctly forward the original `Host` header to the `resumator-backend` service.
- [x] The solution should be implemented within the existing Caddyfile structure.

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
- This approach directly addresses the root cause by ensuring the correct `Host` header is passed through the reverse proxy.
- It aligns with standard reverse proxy configurations for applications that perform host validation.
- It is a minimal and targeted change to the Caddyfile.

**Trade-offs**:
- **Pros**: Simple, effective, and standard practice for Caddy configurations.
- **Cons**: Requires a reload of the Caddy service, which might briefly interrupt other proxied services (though typically very short).

**Alternative Considered**: Modifying backend code to relax host header validation.
**Why Not Chosen**: This would be a security risk, as it could make the backend vulnerable to Host header attacks. It's better to fix the proxy configuration than to weaken backend security.
```

---

### Step 2.3: Break Down into Steps
#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Modify the Global Caddyfile
**Priority**: Critical
**Estimated Time**: 5m
**Dependencies**: None

**Objectives**:
- [ ] Add a `header_up Host {http.request.host}` directive to the `reverse_proxy` block for the `resumator-backend` service in the global Caddyfile.

**Changes Required**:
- `/srv/docker/caddy/Caddyfile`: Add the header directive.

**Deliverables**:
- [ ] An updated Caddyfile on the production server.

**Verification**:
- [ ] The Caddyfile syntax is valid.

---

#### Step 2: Reload the Caddy Service
**Priority**: Critical
**Estimated Time**: 2m
**Dependencies**: Step 1

**Objectives**:
- [ ] Apply the changes to the running Caddy service.

**Changes Required**:
- Execute a shell command on the production server.

**Deliverables**:
- [ ] Caddy service running with the updated configuration.

**Verification**:
- [ ] Caddy logs show a successful reload.
- [ ] Perform the acceptance tests defined in the Success Criteria.
```

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide

### File: `/srv/docker/caddy/Caddyfile` (On your Production Server)

**Current Code** (Relevant Section):
```caddy
# Resumator Application
{$RESUMATOR_DOMAIN} {
    # API traffic goes to the backend container
    handle_path /api/* {
        reverse_proxy resumator-backend:8000
    }

    # All other traffic goes to the frontend container
    handle {
        reverse_proxy resumator-frontend:80
    }
}
```

**Issue in This Code**:
- The `reverse_proxy` directive for the backend does not explicitly forward the original `Host` header.

**Required Changes**:
1. Add a `header_up Host {http.request.host}` line within the `reverse_proxy` block for the `resumator-backend`.

**Updated Code**:
```caddy
# Resumator Application
{$RESUMATOR_DOMAIN} {
    # API traffic goes to the backend container
    handle_path /api/* {
        reverse_proxy resumator-backend:8000 {
            header_up Host {http.request.host}
        }
    }

    # All other traffic goes to the frontend container
    handle {
        reverse_proxy resumator-frontend:80
    }
}
```

---
### Final Step: Reload Caddy (On your Production Server)

**Instruction**:
- After modifying the Caddyfile, you need to reload the Caddy service to apply the changes.

**Command**:
```bash
cd /srv/docker
docker-compose restart caddy
```

After Caddy has reloaded, clear your browser cache and test the application login at `https://resumator.figuedmundo.com`.
