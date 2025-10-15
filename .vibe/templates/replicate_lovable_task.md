# [TASK-ID] - Task/Feature Title

## 📌 Overview

**Status:** [Draft | **In Progress** | Review | Blocked | Complete]
**Priority:** [Low | Medium | **High** | Critical]
**Assignee:** [Name/Team]
**Due Date:** YYYY-MM-DD
**Related:** [Link to Epic, Jira Ticket, GitHub Issue, etc.]
**Labels:** [e.g., frontend, API, documentation, bug, refactor]

---

## 🎯 Goal & Definition of Done

### Goal
*Briefly state the main objective of this task. What is the intended outcome?*

**Example:** Implement the new user profile page on the web application, ensuring it is fully responsive and displays all required user data fetched from the API.

### Definition of Done (DoD)
*What specific criteria must be met for this task to be considered complete?*

- [ ] All code must be reviewed and merged into the main branch.
- [ ] Unit tests covering all new logic must pass.
- [ ] Feature is deployed to the staging environment.
- [ ] Successful user acceptance test (UAT) completed by QA/Stakeholder.
- [ ] Documentation (internal/external) updated.

---

## 🛠 Implementation Details & Plan

### 1. Planning & Investigation
*Notes on initial research, design decisions, or pre-requisite work.*
* e.g., Confirmed API endpoint: `/users/{id}/profile`
* e.g., Decided to use the existing `Card` component for the layout.

### 2. Steps to Complete
*Break down the task into sequential, actionable steps.*

1. [ ] **Setup:** Create a new branch `feature/task-id-profile-page`.
2. [ ] **Backend:** [If applicable] Create/Update API endpoint to include X, Y, Z data.
3. [ ] **Frontend:** Develop the main profile page component.
4. [ ] **Styling:** Implement mobile and tablet responsiveness.
5. [ ] **Testing:** Write unit and integration tests for data fetching and display.
6. [ ] **Review:** Submit Pull Request for code review.
7. [ ] **Deployment:** Merge and deploy to staging.

### 3. Technical Notes / Considerations
*Document any tricky decisions, dependencies, or potential pitfalls.*

* **Dependencies:** Requires the completion of `[TASK-XYZ]` (User API Refactor).
* **Trade-offs:** Decided against client-side caching for now to simplify initial implementation.
* **Known Issues:** The profile picture upload will be handled in a follow-up task.

---
