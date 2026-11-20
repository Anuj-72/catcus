"""Deployment-time database setup, run by the backend's Vercel build hook.

Applies Alembic migrations before the new deployment serves traffic, under a
PostgreSQL advisory lock so two concurrent builds cannot migrate at once. The
demo account is seeded only when SEED_DEMO is set to a truthy value.
"""

import os
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

BACKEND_DIR = Path(__file__).resolve().parents[1]

# Arbitrary but fixed. Every build of this project competes for the same lock.
MIGRATION_LOCK_ID = 0x63617463  # "catc"

SEED_TRUTHY = {"1", "true", "yes", "on"}


def _direct_database_url() -> str:
    """Prefer the unpooled URL.

    Migrations take an advisory lock and run DDL, neither of which is safe on a
    transaction-mode pooler, because the pooler can move the session to another
    server connection between statements.
    """
    for name in ("DATABASE_URL_UNPOOLED", "DATABASE_URL"):
        if url := os.environ.get(name):
            return url

    # Local runs have no environment variables; fall back to backend/.env.
    from app.core.config import get_settings

    return get_settings().database_url


def _run_migrations() -> None:
    from alembic import command
    from alembic.config import Config

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(config, "head")


def _seed_demo_user() -> None:
    from scripts.seed import main as seed_main

    seed_main()


def main() -> None:
    url = _direct_database_url()

    # app.core.config caches its Settings on first import, and alembic's env.py
    # reads that setting, so the direct URL has to be in the environment before
    # anything imports the application.
    os.environ["DATABASE_URL"] = url

    engine = create_engine(
        url,
        poolclass=NullPool,
        connect_args={"connect_timeout": 10},
    )

    with engine.connect() as connection:
        connection.execute(
            text("SELECT pg_advisory_lock(:key)"), {"key": MIGRATION_LOCK_ID}
        )
        try:
            _run_migrations()
            if os.environ.get("SEED_DEMO", "").strip().lower() in SEED_TRUTHY:
                _seed_demo_user()
        finally:
            connection.execute(
                text("SELECT pg_advisory_unlock(:key)"), {"key": MIGRATION_LOCK_ID}
            )

    engine.dispose()
    print("Database setup complete.")


if __name__ == "__main__":
    main()
