# AI Task: Fix Pytest Environment and Database Connection Issues

> **Purpose**: This document provides a systematic framework for analyzing, planning, and executing the fix for the critical issue preventing the pytest suite from running.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-26
- **Project Name**: Resumator
- **Task ID**: 033_fix_test_environment

---

## 🎯 Task Definition

### Issue Summary
**Pytest tests are failing to run due to database connection errors in the test environment.**

### Reported Symptoms
List all observable problems:
- [x] `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not translate host name "db" to address: nodename nor servname provided, or not known`
- [x] `TypeError: create_application() got an unexpected keyword argument 'engine'`
- [x] `AttributeError: "app" not found in module "main"`

### User Impact
- **Severity**: Critical
- **Affected Users**: Developers
- **Workaround Available**: No
- **Business Impact**: Impossible to run tests, which prevents developers from verifying their changes and ensuring the quality of the application.

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

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request

### Problem Understanding
**What**: The pytest test suite fails to start because the application attempts to connect to the production PostgreSQL database before the test environment can override the database settings with a test-specific database.
**Expected**: The test suite should run using an isolated in-memory SQLite database, without attempting to connect to the production database.
**Actual**: The tests fail during the setup phase with a `sqlalchemy.exc.OperationalError` because the hostname "db" of the production database is not resolvable in the test environment.
**Type**: Bug (Test Environment Configuration)

---

### Step 1.2: Identify Affected Areas

### Affected Areas

**Layers Involved**:
- [x] Backend Testing
- [x] Backend Core

**Primary Files**:
- `backend/tests/conftest.py` - This file is responsible for configuring the test environment.
- `backend/main.py` - The application entry point, where the FastAPI app is created.
- `backend/app/core/database.py` - This file is responsible for creating the database engine.

---

### Step 1.3: Gather Project Context

### Current Implementation Analysis

**File**: `backend/main.py`
**Purpose**: Creates the FastAPI application instance.
**Current Approach**: The `app` instance is created at the module level. This causes the application to be initialized and the database connection to be established as soon as the module is imported.
**Issues Found**: This approach does not allow for the database connection to be overridden before the application is created, which is necessary for testing.

**File**: `backend/app/core/database.py`
**Purpose**: Creates the SQLAlchemy database engine.
**Current Approach**: The engine is created at the module level using the database URL from the settings.
**Issues Found**: The engine is always created with the production database URL, even when running tests.

**File**: `backend/tests/conftest.py`
**Purpose**: Configures the pytest test environment.
**Current Approach**: It attempts to override the database connection using fixtures, but this happens too late in the process.
**Issues Found**: The application has already tried to connect to the database before the fixtures are applied.

---

### Step 1.4: Root Cause Analysis

### Root Cause Analysis

**Symptom**: `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not translate host name "db" to address: nodename nor servname provided, or not known`
**Immediate Cause**: The application is trying to connect to the PostgreSQL database at the hostname "db", which is not available in the test environment.
**Root Cause**: The application's database engine is created at module import time in `app/core/database.py` using the production database URL. The pytest fixtures in `conftest.py` are executed after the modules are imported, so they cannot prevent the initial database connection attempt.
**Why It Happened**: The application was not designed with testing in mind, and the database connection is tightly coupled with the application's startup process.

--- 

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria

### Success Criteria

**Functional Requirements**:
- [x] The pytest test suite should run without any database connection errors.
- [x] The tests should use an in-memory SQLite database.
- [x] The application should continue to work as expected in the development and production environments.

**Technical Requirements**:
- [x] No changes should be made to the application's core logic.
- [x] The solution should be robust and not rely on hacks or workarounds.

### Step 2.2: Determine Solution Approach

### Solution Approach

**Chosen Approach**: Proper Fix

**Rationale**:
- The chosen approach is to use an environment variable to switch between the test and production databases. This is a clean and standard way to handle this kind of situation.
- It does not require any changes to the application's core logic.
- It keeps the test environment completely isolated from the production environment.

### Step 2.3: Break Down into Steps

### Implementation Steps

#### Step 1: Modify `app/core/database.py`
**Priority**: Critical
**Estimated Time**: 15 minutes
**Dependencies**: None

**Objectives**:
- [x] Modify the database engine creation to use an in-memory SQLite database when the `TESTING` environment variable is set.

**Changes Required**:
- `backend/app/core/database.py`: Add a condition to check for the `TESTING` environment variable and create the appropriate engine.

#### Step 2: Modify `conftest.py`
**Priority**: Critical
**Estimated Time**: 15 minutes
**Dependencies**: Step 1

**Objectives**:
- [x] Set the `TESTING` environment variable before any tests are run.

**Changes Required**:
- `backend/tests/conftest.py`: Use the `pytest_sessionstart` hook to set the `TESTING` environment variable.

### Step 2.4: Risk Assessment

### Risk Assessment

#### Risk 1: Incorrect environment variable name
**Likelihood**: Low
**Impact**: High
**Category**: Technical

**Potential Consequences**:
- The tests will continue to fail with the same error.

**Mitigation Strategy**:
- Double-check the environment variable name in both files.

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide

### File: `backend/app/core/database.py`

**Required Changes**:
1.  Add a condition to check for the `TESTING` environment variable.
2.  If the environment variable is set, create an in-memory SQLite database engine.
3.  Otherwise, create the production PostgreSQL database engine.

### File: `backend/tests/conftest.py`

**Required Changes**:
1.  Implement the `pytest_sessionstart` hook.
2.  In the hook, set the `TESTING` environment variable to "1".

---

## 📊 PHASE 4: Deliverables

### Step 4.1: Expected Output Formats

#### Code Changes:
- `backend/app/core/database.py`
- `backend/tests/conftest.py`

