# Resumator: Production Deployment Guide (Final v3)

This document provides a final, tailored guide for deploying Resumator, incorporating a professional database migration strategy, secure admin user creation, and a clear networking architecture.

---

## 1. Project State & Recommendations

This review covers the project's architecture, risks, and recommendations for a production-ready deployment.

### 1.1. Architecture & Networking

*   **Containerization**: The project is well-architected for Docker. The `docker-compose.prod.yml` below defines a self-contained stack with isolated services.

*   **Secure Networking**: The architecture uses a secure two-network design:
    1.  **`homelab_net` (External Facing)**: This is your existing global network. Only the `backend` service connects to it, making it accessible to your Caddy reverse proxy. No other part of the application is exposed to your other services.
    2.  **`resumator_net` (Private & Internal)**: This new, private network is created exclusively for the Resumator services. The database (`db`), cache (`redis`), `backend`, and `worker` communicate with each other over this network. It is completely isolated from the outside world and your other applications, which is a major security benefit.

*   **Database & Cache**: The architecture correctly provides Resumator with its own dedicated PostgreSQL and Redis containers on its private network, preventing any interference with your existing Nextcloud services.

### 1.2. Risk Assessment & Recommendations

*   **Critical Risk: Lack of Automated Tests.**
    *   **Recommendation**: This is the **highest priority** for post-launch work. You should begin by writing integration tests for critical user flows like authentication and resume creation.

*   **High Risk: Unpinned Dependencies.**
    *   **Recommendation**: Before deploying, generate pinned dependency files. For the backend, run `pip freeze > backend/requirements.prod.txt` and use that file in the `Dockerfile.prod`. For the frontend, ensure `package-lock.json` is created and committed.

*   **Medium Risk: Storage Strategy.**
    *   **Observation**: The application currently uses a local Docker volume (`storage_data`) for file storage, as configured in the `backend` service's `STORAGE_TYPE=local` environment variable.
    *   **Recommendation**: While local storage is acceptable for a single-host setup, for future multi-server scalability and robustness, it's recommended to transition to a shared object storage solution. MinIO is included in the `docker-compose.yml` for development and can be used as a self-hosted S3-compatible solution. Alternatively, a cloud equivalent like AWS S3 can be used.

    To switch to MinIO (or any S3-compatible storage), you would need to:
    1.  Ensure the MinIO service is running (or your chosen S3-compatible service is accessible).
    2.  Modify the `backend` service's environment variables in your `docker-compose.prod.yml` (or `.env` file) to:
        *   `STORAGE_TYPE=s3`
        *   `MINIO_ENDPOINT=<your_minio_endpoint>:9000` (e.g., `minio:9000` if running within the same Docker network, or an external IP/hostname)
        *   `MINIO_ACCESS_KEY=<your_access_key>`
        *   `MINIO_SECRET_KEY=<your_secret_key>`
        *   `MINIO_SECURE=false` (or `true` if using HTTPS for MinIO)
        *   `MINIO_BUCKET_NAME=<your_bucket_name>` (e.g., `resumator-files`)

    This change would direct the backend to store files in the specified S3-compatible bucket instead of the local volume.

---

## 2. Pre-Deployment: Setting Up Database Migrations

(This is a one-time setup to be done on your local machine before the first deployment)

### Step 1: Initialize and Configure Alembic (DONE)

1.  **Initialize**: `cd backend && pip install alembic && alembic init migrations`
2.  **Configure `alembic.ini`**: Set `sqlalchemy.url = %(DATABASE_URL)s`.
3.  **Configure `migrations/env.py`**: Make Alembic aware of your models.
    ```python
    # backend/migrations/env.py
    import os, sys
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from app.core.database import Base
    from app.models import user, resume, cover_letter, application
    target_metadata = Base.metadata
    ```

### Step 2: Create the Initial Migration

1.  **Generate Script**: From the `backend` directory, run:
    ```bash
    export DATABASE_URL="postgresql://resumator:password@localhost:5432/resumator"
alembic revision --autogenerate -m "Initial schema creation"
    ```
2.  **Add Static Data**: Open the new migration file in `backend/migrations/versions/`. Copy the `INSERT` statements for the `cover_letter_templates` from the old `init.sql` file and place them inside the `upgrade()` function.

### Step 3: Create a Production Entrypoint

1.  Create `backend/entrypoint.prod.sh`:
    ```sh
    #!/bin/sh
    set -e
    echo "Applying database migrations..."
alembic upgrade head
echo "Starting Gunicorn server..."
exec gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
    ```
2.  Make it executable: `chmod +x backend/entrypoint.prod.sh`

### Step 4: Update the Dockerfile (DONE)

Modify `backend/Dockerfile.prod` to copy and use the entrypoint.

```dockerfile
# backend/Dockerfile.prod
# ... (existing content)
COPY --chown=appuser:appuser . .
COPY --chown=appuser:appuser ./entrypoint.prod.sh /app/entrypoint.prod.sh # Add this
# ...
USER appuser
ENTRYPOINT ["/app/entrypoint.prod.sh"] # Set the entrypoint
```

Finally, commit all new and modified files to your repository.

---

## 3. Production Deployment Guide

**Deployment Location**: `/srv/apps/resumator`

### Step 1: Create the Production Docker Compose File

Create `docker-compose.prod.yml` in `/srv/apps/resumator`. This version uses the clear network name `resumator_net`.

```yaml
# /srv/apps/resumator/docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: resumator-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - resumator_net # Private network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: resumator-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - resumator_net # Private network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile.prod
    image: resumator-backend:${VERSION:-latest}
    container_name: resumator-backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - JWT_SECRET=${JWT_SECRET}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - ALLOWED_ORIGINS=https://${RESUMATOR_DOMAIN}
    volumes:
      - storage_data:/app/storage
    networks:
      - homelab_net     # Public facing network for Caddy
      - resumator_net   # Private network for DB/Redis
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    build:
      context: .
      dockerfile: backend/Dockerfile.prod
    image: resumator-backend:${VERSION:-latest}
    container_name: resumator-worker
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - GROQ_API_KEY=${GROQ_API_KEY}
    volumes:
      - storage_data:/app/storage
    command: ["python", "-m", "celery", "-A", "app.worker.celery_app", "worker", "--loglevel=info"]
    networks:
      - resumator_net # Private network only
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
  storage_data:

networks:
  homelab_net:
    external: true
  resumator_net:
    internal: true
```

### Step 2: Configure Caddy & Environment

1.  **Add to your Global Caddyfile** (`/srv/docker/caddy/Caddyfile`):
    ```caddy
    # Resumator Application
    {$RESUMATOR_DOMAIN} {
        root * /srv/apps/resumator/frontend/dist
        file_server
        handle_path /api/* {
            reverse_proxy resumator-backend:8000
        }
        try_files {path} /index.html
    }
    ```
    Then reload Caddy: `cd /srv/docker && docker-compose restart caddy`

2.  **Create your `.env` file** in `/srv/apps/resumator`:
    ```ini
    # /srv/apps/resumator/.env
    RESUMATOR_DOMAIN=resumator.your-server-domain.com
    POSTGRES_DB=resumator
    POSTGRES_USER=resumator
    POSTGRES_PASSWORD=CHOOSE_A_NEW_STRONG_PASSWORD_FOR_RESUMATOR_DB
    REDIS_PASSWORD=CHOOSE_A_NEW_STRONG_PASSWORD_FOR_RESUMATOR_REDIS
    JWT_SECRET=YOUR_VERY_STRONG_JWT_SECRET_KEY
    GROQ_API_KEY=YOUR_GROQ_API_KEY
    VERSION=1.0.0
    ```

### Step 3: Deploy

1.  **Build Frontend Assets**:
    ```bash
    cd /srv/apps/resumator/frontend
    docker run --rm -v $(pwd):/app -w /app node:18-alpine npm install
    docker run --rm -v $(pwd):/app -w /app node:18-alpine npm run build
    ```

2.  **Launch Application**:
    ```bash
    cd /srv/apps/resumator
    docker-compose -f docker-compose.prod.yml up --build -d
    ```

### Step 4: Create Admin User Securely

After deployment, create a secure admin user with this **one-time command**. First, create `backend/create_admin.py`:

```python
# backend/create_admin.py
import argparse
from app.core.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(username, email, password):
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == email).first():
            print(f"Error: User with email {email} already exists.")
            return
        hashed_password = pwd_context.hash(password)
        user = User(username=username, email=email, hashed_password=hashed_password, is_active=True)
        db.add(user)
        db.commit()
        print(f"Successfully created admin user: {username}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an admin user.")
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    create_user(args.username, args.email, args.password)
```

Now, execute it from your server:
```bash
docker-compose -f /srv/apps/resumator/docker-compose.prod.yml exec backend python create_admin.py \
  --username="your_admin_user" \
  --email="your-email@example.com" \
  --password="A_VERY_SECURE_PASSWORD"
```

Your application is now deployed using a professional, secure, and maintainable workflow.