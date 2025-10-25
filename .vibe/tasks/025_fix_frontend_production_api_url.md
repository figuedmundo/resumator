# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-25
- **Project Name**: Resumator
- **Task ID**: 025

---

## 🎯 Task Definition

### Issue Summary
**The frontend application, when deployed to production, makes API calls to `http://localhost:8000` instead of the correct production domain, causing all API requests to fail.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: Logging in on the production website fails.
- [x] Symptom 2: Browser developer console shows `POST http://localhost:8000/api/v1/auth/login` resulting in a network error.
- [x] Symptom 3: The application is unusable as it cannot communicate with its backend.

### User Impact
- **Severity**: Critical
- **Affected Users**: All users
- **Workaround Available**: No
- **Business Impact**: The application is completely non-functional in the production environment.

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
  Frontend Dockerfile: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/Dockerfile.prod
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
#### Output Format:
```markdown
### Problem Understanding
**What**: The frontend JavaScript code is attempting to contact the API at `http://localhost:8000`, which is inaccessible from the user's browser in a production environment.
**Expected**: The frontend should make API calls to the publicly accessible production URL, which is `https://resumator.figuedmundo.com/api`.
**Actual**: API calls are incorrectly directed to `http://localhost:8000/api`, resulting in connection failures.
**Type**: Bug / Configuration Issue
```

---

### Step 1.2: Identify Affected Areas
#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Frontend UI Components (Specifically the API service)
- [x] Frontend Build Process (Dockerfile)
- [x] Deployment Configuration (docker-compose.prod.yml, .env)

**Primary Files**:
- `frontend/src/services/api.js`: Where the API base URL is defined.
- `frontend/Dockerfile.prod`: The script that builds the production frontend container.
- `docker-compose.prod.yml`: The deployment script that orchestrates the build.

**Secondary Files** (May need updates):
- `.env` file on the production server: To provide the necessary configuration.
```

---

### Step 1.3: Gather Project Context
#### Output Format:
```markdown
### Current Implementation Analysis

**File**: `frontend/src/services/api.js`
**Purpose**: This file centralizes all frontend API communication.
**Current Approach**: It creates an `axios` instance. The `baseURL` is determined by the `VITE_API_URL` environment variable, but it falls back to a hardcoded `http://localhost:8000` if the variable is not present.
**Issues Found**: The fallback to `localhost:8000` is designed for local development but is incorrectly being used in the production build.

**Key Code Snippets**:
```javascript
// frontend/src/services/api.js
this.api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  // ...
});
```

**File**: `frontend/Dockerfile.prod`
**Purpose**: To build the static frontend assets and package them into an Nginx container.
**Current Approach**: It runs `npm run build`. This command bundles all the JavaScript.
**Issues Found**: The Dockerfile does not provide any mechanism to pass the `VITE_API_URL` environment variable to the `npm run build` command. Therefore, Vite is unaware of the production API URL, and the code defaults to `localhost:8000`.

**Key Code Snippets**:
```dockerfile
# frontend/Dockerfile.prod
# ...
COPY . .
RUN npm run build
# ...
```
---

### Step 1.4: Root Cause Analysis
#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: API calls fail in production, pointing to `localhost`.
**Immediate Cause**: The `import.meta.env.VITE_API_URL` variable is `undefined` during the frontend build process.
**Root Cause**: The production Docker build process for the frontend (`docker-compose -f docker-compose.prod.yml up --build`) does not pass the required public-facing API URL to the Vite build script (`npm run build`). Vite, in turn, cannot embed the correct URL into the static JavaScript files, so the code executes its fallback logic, hardcoding the incorrect `http://localhost:8000` URL.
**Why It Happened**: The deployment configuration assumes the build environment will magically know the runtime environment, but Vite requires this information to be explicitly provided at build time.

**Impact Chain**:
Missing build-time configuration → `VITE_API_URL` is undefined → `api.js` uses fallback URL `'http://localhost:8000'` → Vite embeds this incorrect URL into the production JS files → Browser loads the app and makes API calls to `localhost`, which fails.
```

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
#### Output Format:
```markdown
### Success Criteria

**Functional Requirements**:
- [x] Users can successfully log in to the application at `https://resumator.figuedmundo.com`.
- [x] All API requests from the frontend must be directed to `https://resumator.figuedmundo.com/api/...`.
- [x] The application must be fully functional in the production environment.

**Technical Requirements**:
- [x] The `VITE_API_URL` variable must be correctly passed during the `docker-compose build` process.
- [x] The solution should not involve hardcoding the production URL directly into the source code (`api.js`).
- [x] The solution must rely on environment variables for flexible configuration.

**Acceptance Tests**:
1. **Test**: Open `https://resumator.figuedmundo.com/login` in an incognito browser window.
   **Expected**: The page loads without errors in the console.
2. **Test**: Open the browser's network tab and attempt to log in with valid credentials.
   **Expected**: A `POST` request is sent to `https://resumator.figuedmundo.com/api/v1/auth/login`, and the login succeeds.
```

---

### Step 2.2: Determine Solution Approach
#### Output Format:
```markdown
### Solution Approach

**Chosen Approach**: Proper Fix

**Rationale**:
- This approach correctly injects the API URL at build-time, which is the standard practice for Vite applications.
- It keeps configuration separate from the code, allowing the same Dockerfile to be used for different environments (e.g., staging) just by changing an environment variable.
- It is a robust and scalable solution that aligns with Docker best practices.

**Trade-offs**:
- **Pros**: Clean, configurable, and professional. Follows the "twelve-factor app" methodology.
- **Cons**: Slightly more complex than a "quick fix" like manually creating a file, but the added reliability is worth it.

**Alternative Considered**: Manually creating a `.env.production` file on the server.
**Why Not Chosen**: This is brittle. It requires manual file management on the server and mixes source-controlled files with manually created ones. If someone else tries to deploy the project, they wouldn't know they need to create this file. The build-arg approach is self-documenting within the `docker-compose.prod.yml`.
```

---

### Step 2.3: Break Down into Steps
#### Output Format:
```markdown
### Implementation Steps

#### Step 1: Modify `frontend/Dockerfile.prod` to Accept a Build Argument
**Priority**: Critical
**Estimated Time**: 15m
**Dependencies**: None

**Objectives**:
- [ ] Make the Dockerfile accept a build-time argument named `VITE_API_URL`.
- [ ] Use this argument to dynamically create a `.env.production` file within the build container *before* running `npm run build`.

**Changes Required**:
- `frontend/Dockerfile.prod`: Add `ARG` instruction at the top and a `RUN` command to echo the variable into the `.env` file.

**Deliverables**:
- [ ] An updated `frontend/Dockerfile.prod` that can receive the API URL.

**Verification**:
- [ ] The build process will later confirm this works.

---

#### Step 2: Update `docker-compose.prod.yml` to Pass the Build Argument
**Priority**: Critical
**Estimated Time**: 15m
**Dependencies**: Step 1

**Objectives**:
- [ ] Instruct Docker Compose to pass the build argument to the frontend build process.
- [ ] The value passed should come from an environment variable for flexibility.

**Changes Required**:
- `docker-compose.prod.yml`: Add a `build.args` section to the `frontend` service definition.

**Deliverables**:
- [ ] An updated `docker-compose.prod.yml` that connects the host environment to the container build environment.

**Verification**:
- [ ] The `docker-compose up --build` command will use this new configuration.

---

#### Step 3: Add `VITE_API_URL` to the Production `.env` File
**Priority**: Critical
**Estimated Time**: 5m
**Dependencies**: Step 2

**Objectives**:
- [ ] Define the `VITE_API_URL` in the server's environment file (`/srv/apps/resumator/.env`) so Docker Compose can read it.

**Changes Required**:
- `/srv/apps/resumator/.env`: Add a new line `VITE_API_URL=https://resumator.figuedmundo.com`.

**Deliverables**:
- [ ] An updated `.env` file on the production server.

**Verification**:
- [ ] This variable will be available to the `docker-compose` command.

---

#### Step 4: Rebuild and Deploy the Application
**Priority**: Critical
**Estimated Time**: 10m
**Dependencies**: Step 1, 2, 3

**Objectives**:
- [ ] Trigger a new build of the `frontend` service to apply all changes.
- [ ] Deploy the newly built container.

**Changes Required**:
- Execute a shell command on the production server.

**Deliverables**:
- [ ] A running, functional production application.

**Verification**:
- [ ] Perform the acceptance tests defined in the Success Criteria.
```

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide

### File: `frontend/Dockerfile.prod`

**Current Code** (Relevant Section):
```dockerfile
# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
```

**Issue in This Code**:
- The `npm run build` command is executed without knowledge of the production environment's API URL.

**Required Changes**:
1. Add an `ARG` instruction to declare `VITE_API_URL` as a build argument.
2. Add a `RUN` command that takes the value from the build argument and writes it into a `.env.production` file. This file will be automatically picked up by Vite.

**Updated Code**:
```dockerfile
# Stage 1: Build the React application
FROM node:20-alpine AS build

# 1. Declare the build-time argument
ARG VITE_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 2. Create the .env.production file from the build argument
# The VITE_API_URL key is what Vite expects
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

# Build the application for production
# Vite will automatically use variables from .env.production
RUN npm run build
```

---
### File: `docker-compose.prod.yml`

**Current Code** (Relevant Section):
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    image: resumator-frontend:${VERSION:-latest}
    container_name: resumator-frontend
    restart: unless-stopped
    networks:
      - homelab_net # Public facing network for Caddy
```

**Issue in This Code**:
- The compose file does not pass any build-time arguments to the Docker build process for the `frontend` service.

**Required Changes**:
1. Add a `build.args` key to the `frontend` service.
2. Map the Docker build argument `VITE_API_URL` to a variable that Docker Compose will get from the host's `.env` file. The format `${VAR_NAME}` is used for this.

**Updated Code**:
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      # Add this build-args section
      args:
        - VITE_API_URL=${VITE_API_URL}
    image: resumator-frontend:${VERSION:-latest}
    container_name: resumator-frontend
    restart: unless-stopped
    networks:
      - homelab_net # Public facing network for Caddy
```
---
### File: `/srv/apps/resumator/.env` (On your Production Server)

**Issue in This Code**:
- The file is missing the `VITE_API_URL` variable that the `docker-compose.prod.yml` now expects.

**Required Changes**:
1. Add a new line to define `VITE_API_URL`. The value should *not* include `/api` at the end, as the Caddy reverse proxy and the `api.js` service handle that pathing.

**Updated Content (Example)**:
```ini
# Add this line
VITE_API_URL=https://resumator.figuedmundo.com

# Existing variables...
RESUMATOR_DOMAIN=resumator.figuedmundo.com
POSTGRES_DB=resumator
POSTGRES_USER=resumator
# ... etc
```

---
### Final Step: Deployment Command (On your Production Server)

**Instruction**:
- Navigate to the directory containing your `docker-compose.prod.yml` and run the build command.

**Command**:
```bash
cd /srv/apps/resumator
docker-compose -f docker-compose.prod.yml up --build -d frontend
```
*(Note: Rebuilding only the `frontend` is sufficient if no other services changed, but a full `docker-compose up --build -d` will also work safely.)*

After the command completes, clear your browser cache and test the application.
