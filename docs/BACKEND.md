# CATCUS backend

Phase 1 provides PostgreSQL, a pooled SQLAlchemy engine and user persistence. FastAPI is the
private backend; the Next.js UI still uses the mock auth store until Phase 2 wires the BFF to it.

## Run it

First time only:

```bash
npm install
cp backend/.env.example backend/.env        # change POSTGRES_PASSWORD if you want
npm run backend:setup                       # creates backend/.venv and installs Python deps
```

Start the database, migrate, seed and run both servers:

```bash
npm run up
```

`npm run up` runs `docker compose up -d --wait`, `alembic upgrade head`, the idempotent demo seed,
then `next dev` on `127.0.0.1:3000` and `uvicorn` on `127.0.0.1:8000` under `concurrently`.
Ctrl+C stops both servers; PostgreSQL keeps running.

Useful scripts:

| Script | Effect |
|---|---|
| `npm run up` | Database + migrations + seed + frontend + backend |
| `npm run db:up` | Start PostgreSQL only |
| `npm run db:down` | Stop PostgreSQL, keep the data volume |
| `npm run db:reset` | Delete the volume and start an empty PostgreSQL |
| `npm run backend:setup` | Create the venv and install Python dependencies |
| `npm run backend:migrate` | Run Alembic and the demo seed |
| `npm run backend:dev` | FastAPI only, with reload |

Manual backend run:

```bash
cd backend
. .venv/bin/activate
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API listens on loopback only. The browser never calls it: Phase 2 adds a server-only Next.js
client and keeps the HttpOnly `catcus_session` cookie on the Next side. Until then the UI still uses
`AUTH_MODE=mock`; leaving it in `.env.local` is correct.

## API

| Method | Path | Result |
|---|---|---|
| `GET` | `/health` | `200 {"status":"ok"}`, or `503` when PostgreSQL is unreachable |
| `POST` | `/auth/register` | `201` user JSON; `409 {"detail":"email_taken"}` for a duplicate |

Registration accepts `full_name`, `email` and `password` (8–128 characters), stores the email
lower-case and hashes the password with Argon2id through `pwdlib`. No token is issued yet.

## Database

- PostgreSQL 15 in Docker, data in the named volume `catcus_pgdata`.
- `catcus` is the application database; `catcus_test` is created by
  `backend/docker/initdb/01-test-db.sh`.
- Init scripts run only on an empty volume. For a clean slate:
  `docker compose down -v && docker compose up -d --wait`, then run Alembic and the seed again.
- Alembic owns the schema. The application never calls `create_all()`.
- `users` columns use `text`; length limits live in Pydantic, not `varchar(n)`.

## Connection pool

`backend/app/db/session.py` creates one synchronous engine with `postgresql+psycopg://` and these
settings, all overridable from `backend/.env`:

| Setting | Default | Purpose |
|---|---|---|
| `DB_POOL_SIZE` | 10 | Warm connections kept open |
| `DB_MAX_OVERFLOW` | 20 | Burst connections above the base size |
| `DB_POOL_TIMEOUT` | 30 s | Maximum wait when the pool is exhausted |
| `DB_POOL_RECYCLE` | 1800 s | Recycle a connection before idle cutoffs |
| `DB_POOL_USE_LIFO` | true | Reuse the hottest connection first |
| `DB_CONNECT_TIMEOUT` | 5 s | Fail fast when PostgreSQL is down |

`pool_pre_ping=True` checks a connection before use, so a PostgreSQL restart does not poison the
pool. The per-process ceiling is `pool_size + max_overflow` (30). With one uvicorn worker that
leaves headroom under PostgreSQL's default `max_connections=100`. If workers are added, the total
is `workers × 30` and must be budgeted.

One session is created per request by `get_db()`, rolled back on an exception and closed in
`finally`; closing returns its connection to the pool. There is no global `Session`.

## Tests

```bash
cd backend
pytest -q
```

Tests use `TEST_DATABASE_URL` (the `catcus_test` database), run Alembic once, and truncate
`users` between tests. The pool test opens 40 concurrent sessions and asserts that every
connection returns to the pool and that PostgreSQL never sees more than 30 `catcus-api`
connections.

## Demo account

`python -m scripts.seed` inserts `andrewmartin@catcus.com` / `Password@12` if it is missing. The
script is idempotent and does not re-hash an existing account.