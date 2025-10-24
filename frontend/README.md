# Resumator Frontend 🚀

*Crafting Careers, One Pixel at a Time.*

---

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

Welcome to the frontend of Resumator! This is a modern, responsive, and intuitive user interface designed to interact with the Resumator API. It provides a seamless experience for building and managing your professional career documents.

## ✨ Features

- **🤖 AI-Powered Content:** Generate and customize resumes and cover letters with the power of AI.
- **✍️ Modern Rich-Text Editor:** A sleek, markdown-friendly editor for fine-tuning your documents.
- **📊 Applications Dashboard:** Track all your job applications, from submission to offer, in one place.
- **🎨 Template Customization:** Choose from and customize various resume templates.
- **📱 Responsive Design:** A fully responsive interface that works beautifully on desktop, tablets, and mobile devices.

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Hooks & Context API
- **HTTP Client:** Axios
- **Component Editor:** CodeMirror

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- `npm` or your favorite package manager

### Local Development

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open your browser and visit `http://localhost:5173`.

## 🐳 Running with Docker

The simplest way to get the entire application stack running is by using the Docker setup in the project root.

1.  Follow the instructions in the main `README.md` at the root of this project.
2.  The frontend will be available at `http://localhost:3000`.

## 📁 Project Structure

The `src` directory is organized to maintain a clean and scalable codebase:

```
src/
├── components/   # Reusable UI components (Buttons, Modals, etc.)
├── hooks/        # Custom React hooks (e.g., useAuth, useAutosave)
├── pages/        # Top-level page components for each route
├── services/     # API communication layer (axios instances, endpoints)
├── styles/       # Global styles and Tailwind base configuration
├── utils/        # Utility functions
├── App.jsx       # Main application component with routing
└── main.jsx      # Application entry point
```

## 📜 Available Scripts

Inside the `frontend` directory, you can run several commands:

- `npm run dev`
  - Starts the development server with Hot Module Replacement (HMR).

- `npm run build`
  - Bundles the app for production into the `build` folder.

- `npm run lint`
  - Lints the codebase using ESLint to find and fix problems.

- `npm run test`
  - Runs the test suite using Vitest.

- `npm run preview`
  - Serves the production build locally to preview before deploying.

---

Happy coding!
