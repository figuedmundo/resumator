# AI Task Template: Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-10-19
- **Project Name**: Resumator
- **Task ID**: 015_fix_duplicate_cover_letter_creation

---

## 🎯 Task Definition

### Issue Summary
When creating a cover letter using the "Generate with AI" feature, the application creates two identical cover letters instead of one.

### Reported Symptoms
List all observable problems:
- [X] Symptom 1: After using the AI generation page and clicking "Save", two cover letters appear in the cover letter list.

### User Impact
- **Severity**: High
- **Affected Users**: All users of the "Generate with AI" feature for cover letters.
- **Workaround Available**: Yes, the user can manually delete the duplicate entry.
- **Business Impact**: This bug creates redundant data, clutters the user's workspace, and causes confusion, undermining the feature's usability.

---

## 🏗️ Project Context

### Project Information
(Project context from the template is assumed)

### Project Standards & Guidelines
(Project standards from the template are assumed)

---

## 🔍 PHASE 1: Initial Analysis

### Problem Understanding
**What**: The AI cover letter generation flow results in the creation of two cover letter records in the database.
**Expected**: Only one cover letter should be created when the user completes the "Generate with AI" and "Save" process.
**Actual**: Two cover letters are created.
**Type**: Bug (Logic Error)

---

### Affected Areas

**Layers Involved**:
- [X] Frontend UI Components
- [ ] Frontend State Management
- [X] Frontend API Service
- [X] Backend API Endpoints
- [X] Backend Service Layer

**Primary Files**:
- `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`: The UI component where the user action triggers two separate creation API calls.
- `backend/app/services/cover_letter_service.py`: Contains the business logic for creating cover letters.
- `backend/app/api/v1/cover_letters.py`: Contains the API endpoints that are being called.

---

### Root Cause Analysis

**Symptom**: Duplicate cover letters are created.
**Immediate Cause**: The frontend page `CoverLetterGeneratePage.jsx` makes two distinct API calls that both result in the creation of a cover letter.
**Root Cause**: The user flow is split into two steps, "Generate" and "Save", and the code implements both steps as separate creation events.
1.  The `handleGenerate` function calls the `POST /api/v1/cover-letters/generate` endpoint. This endpoint correctly creates a new cover letter with its initial AI-generated version and returns it.
2.  The user then clicks a "Save" button, which calls the `handleSave` function.
3.  The `handleSave` function calls the `POST /api/v1/cover-letters` endpoint, which is a standard creation endpoint. This creates a *second* cover letter using the content that was just generated.

**Impact Chain**:
Frontend has two functions (`handleGenerate`, `handleSave`) → Both functions call API endpoints that create a cover letter (`/generate` and `/`) → User clicks the "Generate" button, creating the first cover letter → User clicks the "Save" button, creating the second, duplicate cover letter.

---

## 🎯 PHASE 2: Solution Planning

### Success Criteria

**Functional Requirements**:
- [X] Using the "Generate with AI" feature and saving the result creates only **one** cover letter.
- [X] After generation, the user can preview the content.
- [X] After saving, the user is correctly redirected to the editor page for the newly created cover letter.

**Technical Requirements**:
- [X] The `CoverLetterGeneratePage.jsx` component makes only one API call that results in the creation of a cover letter.
- [X] The `handleSave` function is refactored to not call a creation endpoint.

### Solution Approach

**Chosen Approach**: Refactor

**Rationale**:
- The root cause is a flaw in the frontend logic that doesn't correctly handle the state of the already-created cover letter. A refactor is needed to fix this flow.
- The backend `POST /generate` endpoint already provides all the necessary information (including the new cover letter's ID). The frontend should use this information instead of creating a new record.

**Trade-offs**:
- **Pros**: Solves the root cause permanently, simplifies the frontend logic, and prevents redundant data.
- **Cons**: Requires modifying the state management within the `CoverLetterGeneratePage.jsx` component.

---

### Implementation Steps

#### Step 1: Refactor Frontend Generation Logic
**Priority**: Critical
**Estimated Time**: 1 hour

**Objectives**:
- [ ] Modify `CoverLetterGeneratePage.jsx` to correctly handle the two-step (Generate/Save) process.
- [ ] Store the ID of the cover letter created during the generation step.
- [ ] Remove the duplicate creation call from the save step.

**Changes Required**:
1.  **Add State**: In `CoverLetterGeneratePage.jsx`, add a new state variable to hold the ID of the cover letter created by the generation step. e.g., `const [newCoverLetterId, setNewCoverLetterId] = useState(null);`
2.  **Update `handleGenerate`**: In the `handleGenerate` function, after the `apiService.generateCoverLetterAI` call succeeds, store the returned cover letter ID in the new state variable. e.g., `setNewCoverLetterId(response.id);`
3.  **Update `handleSave`**: Refactor the `handleSave` function completely. It should no longer make an API call. Instead, it should check if `newCoverLetterId` exists and, if so, navigate the user to the editor page for that ID. e.g., `navigate(`/cover-letters/${newCoverLetterId}/edit`);`

**Deliverables**:
- [ ] An updated `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx` file with the corrected logic.

**Verification**:
- [ ] Manually test the "Generate with AI" feature and confirm only one cover letter is created.
- [ ] Verify that clicking "Save" correctly redirects to the editor for the new cover letter.

---

## 🛠️ PHASE 3: Implementation Guidance

### File: `frontend/src/pages/CoverLetters/CoverLetterGeneratePage.jsx`

**Issue in This Code**:
The component has two functions, `handleGenerate` and `handleSave`, that both trigger API calls to create a cover letter, leading to duplicates.

**Required Changes**:
1.  Introduce a new state variable `newCoverLetterId` to store the ID of the cover letter after it's generated.
2.  In `handleGenerate`, populate `newCoverLetterId` from the response of the `generateCoverLetterAI` API call.
3.  Rewrite `handleSave` to be a simple navigation function that uses `newCoverLetterId` to redirect to the correct editor page, removing the redundant `createCoverLetter` API call.

**Updated Code Snippets (Conceptual)**:

```javascript
// Add new state at the top of the component
const [newCoverLetterId, setNewCoverLetterId] = useState(null);

// ...

const handleGenerate = async () => {
  // ... existing logic
  try {
    const response = await apiService.generateCoverLetterAI({
      // ... data
    });
    
    setGeneratedContent(response.versions[0].markdown_content || '');
    setNewCoverLetterId(response.id); // <-- STORE THE ID
    setSuccessMessage('Cover letter generated successfully! Review the preview and save when ready.');
  } catch (err) {
    // ...
  }
};

const handleSave = async () => {
  if (!newCoverLetterId) {
    setError('Could not save. No generated cover letter found.');
    return;
  }

  // No API call here!
  setSuccessMessage('Redirecting to editor...');
  navigate(`/cover-letters/${newCoverLetterId}/edit`);
};
```
