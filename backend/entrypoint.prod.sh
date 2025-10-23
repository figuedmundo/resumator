#!/bin/sh

set -e
echo "Applying database migrations..."
alembic upgrade head
echo "Starting Gunicorn server..."
exec gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
