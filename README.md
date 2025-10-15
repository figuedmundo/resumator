# Resumator

[![Build Status](https://img.shields.io/travis/com/your-username/resumator.svg?style=flat-square)](https://travis-ci.com/your-username/resumator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Resumator is a full-stack web application designed to help users manage their resumes, cover letters, and job applications. It provides a comprehensive suite of tools for creating, customizing, and tracking career-related documents. A key feature of Resumator is its AI-powered capabilities, which assist users in rewriting resumes and generating personalized cover letters for specific job applications, utilizing the Groq API.

## Features

*   **Resume Management:** Upload, create, and manage multiple resumes.
*   **Cover Letter Management:** Create and manage cover letters, with AI-powered generation.
*   **Application Tracking:** Keep track of all your job applications in one place.
*   **AI-Powered Customization:** Tailor your resumes and cover letters to specific job descriptions using AI.
*   **PDF Generation:** Download your resumes and cover letters as professional-looking PDFs.
*   **User Authentication:** Secure user accounts with JWT-based authentication.

## Tech Stack

### Backend

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

### Frontend

*   **Framework:** React 18.2.0
*   **Build Tool:** Vite
*   **Routing:** `react-router-dom` 6.20.1
*   **HTTP Client:** `axios` 1.6.2
*   **Styling:** Tailwind CSS 3.3.6
*   **Linting:** ESLint with `react-app` and `react-app/jest` configurations.
*   **Testing:** `vitest`

## Getting Started

The project is containerized using Docker and orchestrated with Docker Compose.

### Prerequisites

*   Docker
*   Docker Compose

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/resumator.git
    cd resumator
    ```
2.  **Create a `.env` file:**
    ```bash
    cp .env.dev .env
    ```
3.  **Update the `.env` file:**
    Open the `.env` file and add your Groq API key and a JWT secret:
    ```
    GROQ_API_KEY=your-groq-api-key-here
    JWT_SECRET=your-secure-jwt-secret
    ```
4.  **Build and run the application:**
    ```bash
    docker-compose up -d --build
    ```

## Usage

Once the application is running, you can access it at `http://localhost:3000`.

*   **Register:** Create a new account.
*   **Login:** Log in to your account.
*   **Dashboard:** View an overview of your resumes and applications.
*   **Resumes:** Create, upload, and manage your resumes.
*   **Cover Letters:** Create and manage your cover letters.
*   **Applications:** Track your job applications.

## API Documentation

The backend API is documented using Swagger UI. You can access the documentation at `http://localhost:8000/docs` when the application is running.

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

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.