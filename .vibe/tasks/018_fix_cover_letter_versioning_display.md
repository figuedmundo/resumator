# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-20
- **Project Name**: Resumator
- **Task ID**: 018_fix_cover_letter_versioning_display

---

## 🎯 Task Definition

### Issue Summary
**Cover letter version is displayed inconsistently between the cover letter list and the application creation form.**

### Reported Symptoms
List all observable problems:
- [x] Symptom 1: A new cover letter shows "v1 Original" on the cover letter page.
- [x] Symptom 2: The same cover letter shows "Version 18 (Original)" in the cover letter dropdown on the "Create Application" page.

### User Impact
- **Severity**: Medium
- **Affected Users**: All users creating applications.
- **Workaround Available**: No
- **Business Impact**: Causes confusion and may lead to users selecting the wrong cover letter, reducing trust in the application.

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
**AI Instructions**: Before touching any code, thoroughly understand what's being asked.

#### Output Format:
```markdown
### Problem Understanding
**What**: The version number of a cover letter is displayed differently in different parts of the application.
**Expected**: The cover letter version should be displayed consistently, for example, "Version 1 (Original)".
**Actual**: A new cover letter is displayed as "v1 Original" on one page and "Version 18 (Original)" on another.
**Type**: Bug / UX
```

---

### Step 1.2: Identify Affected Areas
**AI Instructions**: Determine which parts of the codebase are involved.

#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [x] Frontend UI Components
- [ ] Frontend State Management
- [x] Frontend API Service
- [x] Backend API Endpoints
- [ ] Backend Service Layer
- [ ] Backend Database Models
- [ ] Other: [specify]

**Primary Files**:
- `frontend/src/pages/CoverLetters/CoverLettersPage.jsx` - Displays the list of cover letters.
- `frontend/src/pages/ApplicationForm/ApplicationForm.jsx` - Contains the form for creating a new application, including the cover letter selection dropdown.
- `frontend/src/components/CoverLetters/CoverLetterCard.jsx` - Displays a single cover letter card.

**Secondary Files** (May need updates):
- `backend/app/api/v1/cover_letters.py` - API endpoint for fetching cover letters.
- `backend/app/services/cover_letter_service.py` - Service for cover letter business logic.
```

---
