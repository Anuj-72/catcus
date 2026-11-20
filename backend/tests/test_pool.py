from concurrent.futures import ThreadPoolExecutor

from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import SessionLocal, engine

# Well above the configured ceiling, so the burst has to queue for a connection.
CONCURRENT_REQUESTS = 40


def _hold_connection() -> int:
    with SessionLocal() as db:
        db.execute(text("SELECT pg_sleep(0.05)"))
    return 1


def test_pool_serves_more_requests_than_its_base_size() -> None:
    settings = get_settings()

    with ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as pool:
        results = list(pool.map(lambda _: _hold_connection(), range(CONCURRENT_REQUESTS)))

    assert results == [1] * CONCURRENT_REQUESTS
    # Every connection went back to the pool after the burst.
    assert engine.pool.checkedout() == 0

    with SessionLocal() as db:
        connections = db.execute(
            text(
                """
                SELECT count(*)
                FROM pg_stat_activity
                WHERE application_name = 'catcus-api'
                  AND datname = current_database()
                """
            )
        ).scalar_one()

    ceiling = settings.db_pool_size + settings.db_max_overflow
    assert connections <= ceiling