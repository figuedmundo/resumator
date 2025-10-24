# Resumator Backend

This is the backend for the Resumator application, an AI-powered platform for managing resumes, cover letters, and job applications. It is a RESTful API built with Python and FastAPI.

## Tech Stack

- **Framework:** FastAPI
- **Programming Language:** Python 3.9+
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy with Alembic for migrations
- **Authentication:** JWT-based authentication
- **Asynchronous Tasks:** Celery with Redis
- **AI Service:** Groq API
- **Containerization:** Docker

## Project Structure

The project follows a standard FastAPI application structure:

```
├── app/
│   ├── api/            # API endpoints (routers)
│   ├── config/         # Application configuration
│   ├── core/           # Core components (database, security)
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic schemas for data validation
│   ├── services/       # Business logic and services
│   └── templates/      # HTML templates for PDF generation
├── migrations/         # Alembic database migrations
├── main.py             # FastAPI application entry point
└── ...
```

## Getting Started

### Running with Docker (Recommended)

The entire application stack can be run using Docker and Docker Compose.

1.  **Environment Variables:**
    From the root of the project, copy the development environment file:
    ```bash
    cp .env.dev .env
    ```
    Open the `.env` file and add your `GROQ_API_KEY` and a unique `JWT_SECRET`.

2.  **Build and Run:**
    From the root of the project, run:
    ```bash
    docker-compose up -d --build
    ```

3.  **Accessing the API:**
    - **API URL:** `http://localhost:8000`
    - **Interactive Docs (Swagger):** `http://localhost:8000/docs`

### Local Development (Without Docker)

1.  **Prerequisites:**
    - Python 3.9+
    - PostgreSQL server running
    - Redis server running

2.  **Setup:**
    ```bash
    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate

    # Install dependencies
    pip install -r requirements.txt

    # Create a .env file from the example
    cp .env.example .env
    ```

3.  **Environment Variables:**
    Open the `.env` file and configure the `DATABASE_URL`, `REDIS_URL`, `GROQ_API_KEY`, and other settings to match your local setup.

4.  **Database Migrations:**
    Apply the latest database migrations:
    ```bash
    alembic upgrade head
    ```

5.  **Run the Server:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```

## Environment Variables

The following environment variables are used for configuration. See `.env.example` for a full list.

| Variable           | Description                                     |
| ------------------ | ----------------------------------------------- |
| `DATABASE_URL`     | PostgreSQL connection string.                   |
| `JWT_SECRET`       | Secret key for signing JWTs.                    |
| `GROQ_API_KEY`     | Your API key for the Groq AI service.           |
| `STORAGE_TYPE`     | `local` or `s3` for file storage.               |
| `REDIS_URL`        | Connection URL for the Redis server.            |
| `CORS_ORIGINS`     | Comma-separated list of allowed frontend origins.|
| `DEBUG`            | Set to `true` to enable debug mode.             |


## Database Migrations

The project uses Alembic to manage database schema migrations.

- **Create a new migration:**
  ```bash
  alembic revision --autogenerate -m "Your migration message"
  ```

- **Apply migrations:**
  ```bash
  alembic upgrade head
  ```

## Testing

The project uses `pytest` for testing.

To run the test suite:
```bash
pytest
```
