# Project: Resumator

## 1. Project Overview

Resumator is a full-stack web application designed to help users manage their resumes, cover letters, and job applications. It provides a comprehensive suite of tools for creating, customizing, and tracking career-related documents. A key feature of Resumator is its AI-powered capabilities, which assist users in rewriting resumes and generating personalized cover letters for specific job applications, utilizing the Groq API.

The application is built with a modern tech stack, featuring a React frontend and a Python/FastAPI backend. The entire development environment is containerized using Docker, ensuring a smooth and consistent setup process for developers.

## 2. Architecture

The project is structured as a monorepo with two main components: a `frontend` application and a `backend` service.

### 2.1. Backend Architecture

The backend is a RESTful API built with Python and FastAPI. It handles all business logic, data storage, and interactions with external services like the Groq AI API.

*   **Framework:** FastAPI
*   **Database:** PostgreSQL with SQLAlchemy as the ORM.
*   **Asynchronous Tasks:** Celery with Redis as the message broker for handling long-running tasks like AI-powered content generation.
*   **Authentication:** JWT-based authentication with access and refresh tokens.
*   **Key Directories:**
    *   `app/api/v1/`: Contains the API endpoint definitions for different resources (resumes, applications, etc.).
    *   `app/services/`: Holds the business logic for each resource.
    *   `app/models/`: Defines the SQLAlchemy database models.
    *   `app/schemas/`: Contains the Pydantic schemas for data validation and serialization.
    *   `app/core/`: Includes core components like database connections, security, and configuration.

### 2.2. Frontend Architecture

The frontend is a single-page application (SPA) built with React. It provides a user-friendly interface for interacting with the backend API.

*   **Framework:** React (with Vite for development and bundling).
*   **Styling:** Tailwind CSS for a utility-first CSS workflow.
*   **Routing:** `react-router-dom` for client-side routing.
*   **API Communication:** `axios` for making HTTP requests to the backend API.
*   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) and a custom `useAuth` hook for managing authentication state.
*   **Key Directories:**
    *   `src/pages/`: Contains the top-level components for each page of the application.
    *   `src/components/`: Includes reusable UI components.
    *   `src/services/`: Handles API communication with the backend.
    *   `src/hooks/`: Contains custom React hooks.

## 3. Tech Stack

### 3.1. Backend

*   **Programming Language:** Python 3.9+
*   **Framework:** FastAPI
*   **Web Server:** Uvicorn, Gunicorn
*   **Database:** PostgreSQL
*   **ORM:** SQLAlchemy
*   **Authentication:** `python-jose[cryptography]`, `passlib[bcrypt]`, `PyJWT`, `argon2-cffi`
*   **Data Validation:** Pydantic
*   **AI Service:** Groq, requests
*   **PDF Generation:** `pdfkit`, `weasyprint`, `markdown`, `jinja2`
*   **Storage:** Boto3, Minio
*   **Background Tasks:** Celery, Redis, `rq`
*   **Testing:** Pytest

### 3.2. Frontend

*   **Framework:** React 18.2.0
*   **Build Tool:** Vite
*   **Routing:** `react-router-dom` 6.20.1
*   **HTTP Client:** `axios` 1.6.2
*   **Styling:** Tailwind CSS 3.3.6
*   **Linting:** ESLint with `react-app` and `react-app/jest` configurations.
*   **Testing:** `vitest`

## 4. Style Guide & Coding Standards

### 4.1. Backend

The backend code follows the **PEP 8** style guide for Python. The project uses `pydantic-settings` for clean and organized settings management. The code is generally well-structured, with a clear separation of concerns between API endpoints, services, and data models.

### 4.2. Frontend

The frontend code adheres to the **React/JSX coding style** enforced by the `eslint-config-react-app` configuration. This includes conventions for component naming, prop types, and hook usage.

## 5. Architecture Notes

*   **Service Layer:** The backend employs a service layer to abstract the business logic from the API endpoints. This promotes code reusability and makes the application easier to maintain and test.
*   **Dependency Injection:** FastAPI's dependency injection system is used to provide services and database sessions to the API endpoints, which improves modularity and testability.
*   **Component-Based UI:** The frontend is built using a component-based architecture, with a clear distinction between "smart" page components and "dumb" reusable UI components.
*   **Centralized API Service:** API calls from the frontend to the backend are managed through a centralized `api.js` service, which simplifies the process of making and handling HTTP requests.

## 6. Setup Instructions

The project is designed to be run with Docker and Docker Compose.

1.  **Prerequisites:**
    *   Docker
    *   Docker Compose
2.  **Environment Configuration:**
    *   Create a `.env` file in the root of the project by copying the `.env.dev` file: `cp .env.dev .env`
    *   Open the `.env` file and add your **Groq API key** and a **JWT secret**.
3.  **Database Initialization:** The `init.sql` script in the `backend` directory will be automatically executed by the `db` service in `docker-compose.yml` to set up the initial database schema.
4.  **Running the Application:**
    ```bash
    docker-compose up -d --build
    ```
5.  **Accessing the Application:**
    *   **Frontend:** `http://localhost:3000`
    *   **Backend API:** `http://localhost:8000`
    *   **API Documentation:** `http://localhost:8000/docs`

## 7. API Endpoint Reference

### Auth API

*   **`POST /api/v1/auth/register`**: Register a new user.
*   **`POST /api/v1/auth/login`**: Log in and receive a JWT token.
*   **`POST /api/v1/auth/refresh`**: Refresh an expired JWT token.
*   **`POST /api/v1/auth/logout`**: Log out and invalidate the JWT token.

### Users API

*   **`GET /api/v1/users/me`**: Get the current user's information.
*   **`PUT /api/v1/users/me`**: Update the current user's information.
*   **`DELETE /api/v1/users/me`**: Delete the current user's account.

### Resumes API

*   **`POST /api/v1/resumes`**: Create a new resume.
*   **`GET /api/v1/resumes`**: Get a list of all resumes for the current user.
*   **`GET /api/v1/resumes/{resume_id}`**: Get a specific resume by ID.
*   **`PUT /api/v1/resumes/{resume_id}`**: Update a resume.
*   **`DELETE /api/v1/resumes/{resume_id}`**: Delete a resume.
*   **`POST /api/v1/resumes/{resume_id}/customize`**: Customize a resume using AI.
*   **`GET /api/v1/resumes/{resume_id}/versions`**: Get all versions of a resume.
*   **`GET /api/v1/resumes/{resume_id}/versions/{version_id}`**: Get a specific version of a resume.
*   **`PUT /api/v1/resumes/{resume_id}/versions/{version_id}`**: Update a specific version of a resume.
*   **`DELETE /api/v1/resumes/{resume_id}/versions/{version_id}`**: Delete a specific version of a resume.
*   **`GET /api/v1/resumes/{resume_id}/download`**: Download a resume as a PDF.

### Cover Letters API

*   **`POST /api/v1/cover-letters`**: Create a new cover letter.
*   **`GET /api/v1/cover-letters`**: Get a list of all cover letters for the current user.
*   **`GET /api/v1/cover-letters/{cover_letter_id}`**: Get a specific cover letter by ID.
*   **`PUT /api/v1/cover-letters/{cover_letter_id}`**: Update a cover letter.
*   **`DELETE /api/v1/cover-letters/{cover_letter_id}`**: Delete a cover letter.
*   **`POST /api/v1/cover-letters/generate`**: Generate a new cover letter using AI.

### Applications API

*   **`POST /api/v1/applications`**: Create a new application.
*   **`GET /api/v1/applications`**: Get a list of all applications for the current user.
*   **`GET /api/v1/applications/{application_id}`**: Get a specific application by ID.
*   **`PUT /api/v1/applications/{application_id}`**: Update an application.
*   **`DELETE /api/v1/applications/{application_id}`**: Delete an application.

## 8. Key Files to Examine

*   **`docker-compose.yml`**: Defines the services, networks, and volumes for the application.
*   **`backend/main.py`**: The entry point for the FastAPI application.
*   **`backend/app/api/v1/`**: Directory containing all the API endpoints.
*   **`frontend/src/App.jsx`**: The main React component that defines the application's routes.
*   **`frontend/src/pages/`**: Directory containing the main pages of the application.
*   **`frontend/src/services/api.js`**: The frontend service for making API calls.

**IMPORTANT**
Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.
