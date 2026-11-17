from concurrent.futures import ThreadPoolExecutor

from sqlalchemy import text

from app.db.session import SessionLocal, engine


def _hold_connection() -> int:
    with SessionLocal() as db:
        db.execute(text("SELECT pg_sleep(0.05)"))
    return 1


def test_pool_serves_more_requests_than_its_base_size() -> None:
    with ThreadPoolExecutor(max_workers=40) as pool:
        results = list(pool.map(lambda _: _hold_connection(), range(40)))

    assert results == [1] * 40
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

    assert connections <= 30