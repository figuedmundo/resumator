# Frontend Style Guide

> **Purpose**: This document provides a guide for developers to ensure the Resumator frontend maintains a consistent, homogeneous, and high-quality user interface. It outlines the core principles and the common component library to be used for all new and existing feature development.

---

##  Core Principles

1.  **Composition over Configuration**: Prefer composing complex UI from smaller, single-purpose components rather than creating large, configurable monolithic components.
2.  **Reuse Before You Recreate**: Before writing any new UI code, always check the common component library in `src/components/common` to see if a component already exists for your use case.
3.  **Global State for Global Concerns**: UI concerns that affect the entire application, such as theme (dark/light mode), should be handled by a global context provider.

---

## Common Component Library

All common components are located in `frontend/src/components/common/`.

### `PageLayout.jsx`

-   **Purpose**: To provide a consistent, centered, and width-constrained layout for all pages.
-   **When to Use**: Wrap the top-level `div` of every page component (e.g., in `ResumesPage.jsx`, `ApplicationsPage.jsx`) with `<PageLayout>`.
-   **Props**: Accepts `children`.

### `BaseCard.jsx`

-   **Purpose**: To provide a generic card structure with consistent padding, border, and shadow effects.
-   **When to Use**: Use this as the foundation for any card-like UI element, such as `ResumeCard` or `ApplicationCard`.
-   **Props**: `header`, `children` (for the body), `footer`.

### `Alert.jsx`

-   **Purpose**: To display success or error messages in a consistent style.
-   **When to Use**: Whenever you need to display a non-intrusive notification to the user after an action.
-   **Props**:
    -   `message` (string): The text to display.
    -   `variant` ('success' | 'error'): The style of the alert. Defaults to `success`.

### `EmptyState.jsx`

-   **Purpose**: To provide a consistent and user-friendly message when a list or data set is empty.
-   **When to Use**: On any page or view that displays a list of items that could potentially be empty.
-   **Props**:
    -   `icon` (ReactNode): An SVG icon to display.
    -   `title` (string): The main heading for the empty state.
    -   `description` (string): A short explanation.
    -   `actions` (ReactNode): A button or link to guide the user to the next step.

### `Pagination.jsx`

-   **Purpose**: To provide a consistent pagination control for lists.
-   **When to Use**: At the bottom of any list that is paginated.
-   **Props**:
    -   `currentPage` (number)
    -   `totalPages` (number)
    -   `onPageChange` (function)

---

## Theming & Dark Mode

Dark mode is managed globally via a `ThemeContext`. This context provides the current theme and a function to toggle it. The root `App.jsx` component wraps the entire application in the `ThemeProvider`.

-   **Applying Styles**: A `.dark` class is applied to the `<body>` of the application. All dark mode styles in the CSS Modules should be written using this parent class:

    ```css
    .dark .myComponent {
      @apply bg-gray-800 text-white;
    }
    ```

-   **Usage**: Components generally do not need to interact with the context directly. Styles should be applied automatically. If a component has specific logic that needs to know the current theme, it can use the `useTheme()` hook.
