# AI Task: Frontend UI Homogeneity and Consistency

> **Purpose**: This task is to refactor the frontend to enforce a consistent and homogeneous user interface across the entire application, addressing issues with inconsistent layouts, styles, and component implementations.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: Refactoring / Design System
- **Last Updated**: 2025-10-29
- **Project Name**: Resumator
- **Task ID**: 042_style_homogeneity_and_consistency

---

## 🎯 Task Definition

### Issue Summary
**The application UI lacks a consistent and homogeneous style across different pages and components, leading to a disjointed user experience.**

### Reported Symptoms
- [x] **Inconsistent Dark Mode**: Dark mode works on some pages but not others.
- [x] **Inconsistent Page Width**: Some page headers are full-width, while others are constrained, creating a jarring navigation experience.
- [x] **Divergent Component Styles**: Similar components, like cards for resumes and applications, have different styling, defeating the purpose of a component-based architecture.

### User Impact
- **Severity**: High (from a UX perspective)
- **Affected Users**: All users
- **Workaround Available**: No
- **Business Impact**: Degrades the professional look and feel of the application, which can impact user trust and satisfaction.

---

## 🔍 PHASE 1: Initial Analysis

### Root Cause Analysis

**Symptom**: Inconsistent UI and UX across the application.
**Immediate Cause**: Different components and pages use slightly different Tailwind CSS classes, layout structures, and state management for global concerns like themes.
**Root Cause**: The initial refactoring phase successfully broke down monolithic components but did not yet establish a centralized, enforced design system through global layout components and global state management. This is the natural next step to unify the newly created components.

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria

**Functional Requirements**:
- [ ] Dark mode can be toggled once and applies correctly and consistently across all pages.
- [ ] All main pages (Resumes, Applications, etc.) have the same constrained width for their content.

**Technical Requirements**:
- [ ] A global `ThemeContext` is created and implemented in `App.jsx`.
- [ ] A generic `PageLayout.jsx` component is created and used by all top-level pages.
- [ ] A generic `BaseCard.jsx` component is created to serve as the foundation for all other card components.
- [ ] Existing `ResumeCard` and `ApplicationCard` are refactored to use `BaseCard`.
- [ ] A `STYLE_GUIDE.md` is created to document the new common components.

### Step 2.2: Determine Solution Approach

**Chosen Approach**: **Refactor & Redesign**

**Rationale**: This task goes beyond a simple refactor. It involves designing and implementing a foundational layer of a design system (global context and layout components) to ensure future consistency.

### Step 2.3: Break Down into Steps

#### Step 1: Implement Global Dark Mode
**Priority**: Critical
**Objectives**:
- [ ] Create `frontend/src/contexts/ThemeContext.jsx`.
- [ ] The context will provide the current theme ('light' or 'dark') and a `toggleTheme` function.
- [ ] Wrap the main application in `App.jsx` with the `ThemeProvider`.
- [ ] Add a `useEffect` in the provider to add or remove the `.dark` class from the `<body>` tag.

**Deliverables**:
- A functioning, global dark mode toggle.

---

#### Step 2: Create `PageLayout` Component
**Priority**: High
**Dependencies**: Step 1

**Objectives**:
- [ ] Create `frontend/src/components/common/PageLayout.jsx`.
- [ ] This component will have a main container `div` with consistent styles (e.g., `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
- [ ] Refactor all main pages (`ResumesPage`, `ApplicationsPage`, etc.) to use `<PageLayout>` as their root element.

**Deliverables**:
- Consistent page width and padding across the application.

---

#### Step 3: Unify Card Styles
**Priority**: High
**Dependencies**: Step 2

**Objectives**:
- [ ] Create a generic `BaseCard.jsx` in `frontend/src/components/common`.
- [ ] It should provide the basic card styling (border, shadow, padding) and accept `header`, `children`, and `footer` props.
- [ ] Refactor `ResumeCard.jsx` and `ApplicationCard.jsx` to use `BaseCard`.
- [ ] Create a new `CoverLetterCard.jsx` that also uses `BaseCard`.

**Deliverables**:
- A consistent look and feel for all card elements in the application.

---

#### Step 4: Create `STYLE_GUIDE.md`
**Priority**: High

**Objectives**:
- [ ] Create a `STYLE_GUIDE.md` file in the project root.
- [ ] Document the purpose and usage of the new common components: `PageLayout`, `BaseCard`, `Alert`, `EmptyState`, `Pagination`.
- [ ] Document the global `ThemeContext` and how to use it.

**Deliverables**:
- A central documentation file for developers to reference for UI consistency.
