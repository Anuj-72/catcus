#!/bin/sh
set -e

# Runs only when the data volume is empty. A full reset is `docker compose down -v`.
if ! psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --tuples-only --no-align \
  --command "SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}_test'" | grep -q 1; then
  psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    --command "CREATE DATABASE \"${POSTGRES_DB}_test\" OWNER \"${POSTGRES_USER}\""
fi