from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_timeout=settings.db_pool_timeout,
    pool_recycle=settings.db_pool_recycle,
    pool_use_lifo=settings.db_pool_use_lifo,
    connect_args={
        "connect_timeout": settings.db_connect_timeout,
        "application_name": "catcus-api",
        # A transaction-mode pooler (PgBouncer, including Neon's pooled endpoint)
        # can hand a server connection to another client between statements, so a
        # statement prepared on one connection may not exist on the next. psycopg
        # prepares automatically after a few executions; opt out entirely.
        "prepare_threshold": None,
    },
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """One session per request; close() returns the connection to the pool."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()