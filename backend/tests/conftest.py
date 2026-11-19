import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.core.config import Settings, get_settings

BACKEND_DIR = Path(__file__).resolve().parents[1]

# Keep pytest independent of the local backend/.env JWT secret.
os.environ.setdefault("JWT_SECRET", "test-only-jwt-secret-at-least-32-characters")


def _test_settings() -> Settings:
    settings = Settings()
    if not settings.test_database_url:
        raise RuntimeError("TEST_DATABASE_URL is not set")
    if settings.test_database_url == settings.database_url:
        raise RuntimeError("TEST_DATABASE_URL must differ from DATABASE_URL")
    return settings


settings = _test_settings()

# Settings are cached by the app; point every subsequent import at the test DB.
os.environ["DATABASE_URL"] = settings.test_database_url
get_settings.cache_clear()

from app.db.session import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def migrated_database() -> None:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    config.set_main_option("prepend_sys_path", str(BACKEND_DIR))
    command.upgrade(config, "head")


@pytest.fixture(autouse=True)
def clean_users(migrated_database: None) -> None:
    with SessionLocal() as db:
        db.execute(text("TRUNCATE TABLE revoked_tokens, users"))
        db.commit()
    yield


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client