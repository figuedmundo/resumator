# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-19
- **Project Name**: Resumator
- **Task ID**: 014_fix_cover_letter_versioning

---

## 🎯 Task Definition

### Issue Summary
Cover letter versioning does not follow the expected `v1` (original) and `v2` (customized) sequence, making it inconsistent with the resume versioning logic.

### Reported Symptoms
List all observable problems:
- [X] Symptom 1: Customized cover letter versions are created sequentially (e.g., v2, v3, v4...) instead of being consistently based on a "version 2" scheme for customizations.
- [X] Symptom 2: The initial version of a cover letter is not explicitly set to "v1".

### User Impact
- **Severity**: Medium
- **Affected Users**: All users creating and customizing cover letters.
- **Workaround Available**: No
- **Business Impact**: The inconsistent versioning scheme can be confusing for users and deviates from the established pattern seen in the resume feature, leading to a poor user experience.

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
```

### Project Standards & Guidelines
(Standards from the provided template are assumed to be followed)

---

## 🔍 PHASE 1: Initial Analysis

### Problem Understanding
**What**: The version number for customized cover letters increments with every new version created for a cover letter, regardless of whether it's an original or a customization.
**Expected**: The first version of a cover letter should always be `v1`. Any subsequent job-specific customization should follow a `v2 - {Company Name}` format.
**Actual**: A new cover letter gets version `v1`. The first customization gets `v2 - {Company}`. A second customization for a different company gets `v3 - {Other Company}`, instead of another `v2` variant.
**Type**: Bug (Logic Error)

---

### Affected Areas

**Layers Involved**:
- [ ] Frontend UI Components
- [ ] Frontend State Management
- [ ] Frontend API Service
- [X] Backend API Endpoints (Implicitly)
- [X] Backend Service Layer
- [ ] Backend Database Models
- [ ] Other: [specify]

**Primary Files**:
- `backend/app/services/cover_letter_service.py` - Contains the business logic for creating and versioning cover letters.

**Secondary Files** (May need updates):
- `backend/app/api/v1/cover_letters.py` - The API layer that calls the service. No changes are expected here, but it's part of the flow.

---

### Root Cause Analysis

**Symptom**: Customized cover letter versions are numbered sequentially (v2, v3, v4...).
**Immediate Cause**: The `customize_for_application` method in `cover_letter_service.py` calculates the new version number by counting all existing versions of the cover letter and incrementing the total.
**Root Cause**: The logic does not differentiate between the base version (`v1`) and customization versions (`v2`). It treats all versions as a single sequence, which contradicts the desired behavior where "original" is `v1` and "customized" is `v2`. A similar, though less explicit, issue exists in the `create_version` method which also relies on a simple count.

**Evidence**:
1. The `create_version` method uses `version_count = db.query(CoverLetterVersion).filter(...).count()` and `version_name = f"v{version_count + 1}"`.
2. The `customize_for_application` method uses the exact same counting logic to generate version names for customizations.
3. This contrasts with the `resume_service.py`'s `upload_resume` method, which correctly hardcodes the initial version as `"v1"`.

**Impact Chain**:
Incorrect versioning logic in service layer → Sequential version names are generated for all new versions → User sees confusing version numbers for customized cover letters (v3, v4...) → Inconsistent UX compared to resume customization.

---

## 🎯 PHASE 2: Solution Planning

### Success Criteria

**Functional Requirements**:
- [X] When a new cover letter is created, its initial version must be named exactly `"v1"`.
- [X] When a cover letter is customized for a company, the resulting version must be named in the format `v2 - {company}`.
- [X] If a cover letter is customized for the same company again, the existing `v2 - {company}` version should be reused/updated, not created as a new version.
- [X] If a cover letter is customized for a different company, a new version `v2 - {other_company}` should be created.

**Technical Requirements**:
- [X] All existing tests pass.
- [ ] New tests are added to verify the corrected versioning logic.
- [X] The fix is implemented in the `backend/app/services/cover_letter_service.py` file.

### Solution Approach

**Chosen Approach**: Proper Fix

**Rationale**:
- The bug stems from a clear logic error in the service layer that needs to be corrected to ensure predictable and consistent behavior.
- A proper fix aligns the cover letter functionality with the user's expectation and the pattern established in other parts of the application (resumes).

**Trade-offs**:
- **Pros**: Solves the root cause, eliminates user confusion, and improves code consistency.
- **Cons**: Requires careful modification of the service layer logic.

---

### Implementation Steps

#### Step 1: Correct Initial Version Creation
**Priority**: Critical
**Status**: ✅ Done

**Objectives**:
- [X] Modify the `create_version` method in `cover_letter_service.py`.
- [X] Ensure that when a version is created with `is_original=True`, its name is always `"v1"`.

**Changes Required**:
- `backend/app/services/cover_letter_service.py`: In `create_version`, add a condition to check the `is_original` flag. If it's true, set `version_name = "v1"`. Otherwise, use the existing counting logic for other types of versions (if any).

**Deliverables**:
- [X] Updated `create_version` method that correctly names the original version.

**Verification**:
- [X] Code change has been applied.

---

#### Step 2: Correct Customized Version Creation
**Priority**: Critical
**Status**: ✅ Done

**Objectives**:
- [X] Modify the `customize_for_application` method in `cover_letter_service.py`.
- [X] Change the version naming logic to use the `v2 - {company}` format.
- [X] Ensure the check for existing customizations is precise.

**Changes Required**:
- `backend/app/services/cover_letter_service.py`: In `customize_for_application`, replace the version counting logic. The new version name should be constructed as `f"v2 - {company}"`. The query to check for an `existing_version` should be updated to look for an exact match with this new name format, rather than a broad `LIKE` query.

**Deliverables**:
- [X] Updated `customize_for_application` method with the correct versioning scheme.

**Verification**:
- [X] Code change has been applied.

---

## 🛠️ PHASE 3: Implementation Guidance

### File: `backend/app/services/cover_letter_service.py`

#### Change 1: `create_version` Method

**Current Code** (Relevant Section):
```python
            # Generate version number
            version_count = db.query(CoverLetterVersion).filter(
                CoverLetterVersion.cover_letter_id == cover_letter_id
            ).count()
            version_name = f"v{version_count + 1}"
```

**Required Changes**:
1. Check if `is_original` is `True`.
2. If it is, hardcode `version_name` to `"v1"`.
3. If not, retain the sequential naming for any other non-customization version creations.

**Updated Code**:
```python
            # Generate version number
            if is_original:
                version_name = "v1"
            else:
                version_count = db.query(CoverLetterVersion).filter(
                    CoverLetterVersion.cover_letter_id == cover_letter_id
                ).count()
                version_name = f"v{version_count + 1}"
```

#### Change 2: `customize_for_application` Method

**Current Code** (Relevant Section):
```python
            # Check if customized version already exists for this company
            company_suffix = f" - {company}"
            existing_version = db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.cover_letter_id == cover_letter_id,
                    CoverLetterVersion.version.like(f"%{company_suffix}")
                )
            ).first()
            
            if existing_version:
                logger.info(f"Reusing existing version for company {company}: {existing_version.version}")
                return existing_version
            
            # ...
            
            # Create customized version
            version_count = db.query(CoverLetterVersion).filter(
                CoverLetterVersion.cover_letter_id == cover_letter_id
            ).count()
            version_name = f"v{version_count + 1} - {company}"
```

**Required Changes**:
1. Define the customized version name explicitly as `v2 - {company}`.
2. Update the query for `existing_version` to use an exact match (`==`) on the new `version_name`.
3. Remove the old version counting logic.

**Updated Code**:
```python
            # Define the expected version name for the customization
            version_name = f"v2 - {company}"

            # Check if this specific customized version already exists
            existing_version = db.query(CoverLetterVersion).filter(
                and_(
                    CoverLetterVersion.cover_letter_id == cover_letter_id,
                    CoverLetterVersion.version == version_name
                )
            ).first()
            
            if existing_version:
                logger.info(f"Reusing existing version for company {company}: {existing_version.version}")
                return existing_version
            
            # ... (AI generation logic)
            
            # Create customized version
            version = CoverLetterVersion(
                cover_letter_id=cover_letter_id,
                version=version_name,
                markdown_content=customized_content,
                job_description=job_description,
                is_original=False
            )
```

---

## 📊 PHASE 4: Deliverables

### Step 4.1: Expected Output Formats

#### Code Changes:

### Code Deliverables

For each changed file, provide:

1. **Full Updated File Content**
   - The complete, working code for `backend/app/services/cover_letter_service.py` has been applied.

2. **Change Summary**
   - **What**: Modified `create_version` to hardcode `v1` for original versions. Modified `customize_for_application` to use `v2 - {company}` for customized versions.
   - **Why**: To fix the inconsistent versioning bug and align it with user expectations.
   - **Impact**: Cover letter versioning is now predictable and consistent.


---

## 📝 PHASE 5: Summary & Documentation

### Change Summary

**Task**: Fix Cover Letter Versioning Logic
**Status**: ✅ Complete

#### Backend Changes
**Files Modified**: 1 file

1.  **File**: `backend/app/services/cover_letter_service.py`
    -   **Change**: Modified the `create_version` and `customize_for_application` methods.
    -   **Reason**: To correct the version naming logic to align with user expectations and the pattern set by the resume feature.
    -   **Impact**: New cover letters will have a `v1` original version, and all company-specific customizations will be named `v2 - {company}`.
