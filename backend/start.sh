#!/usr/bin/env bash
# Entrypoint for Railway deployment.
# 1. Run Alembic migrations (idempotent — safe to run on every deploy).
# 2. Start the Uvicorn server.
set -euo pipefail

echo "==> Running Alembic migrations..."
alembic -c alembic.ini upgrade head

echo "==> Starting Uvicorn..."
exec uvicorn main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers "${UVICORN_WORKERS:-2}" \
  --log-level info
