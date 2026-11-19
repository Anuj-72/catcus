# CATCUS backend

FastAPI is the private auth backend, backed by PostgreSQL through a pooled SQLAlchemy engine.
Next.js Server Actions are the browser-facing BFF: signup and login call this API, then store the
backend-issued JWT in the HttpOnly `catcus_session` cookie.

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

The API listens on loopback only. The browser never calls it: `src/lib/auth/backend.ts` is a
server-only client used by the Server Actions. `BACKEND_URL` selects the API base URL
(`http://127.0.0.1:8000` by default). FastAPI issues the JWT stored in the HttpOnly
`catcus_session` cookie, validates the same token on protected endpoints, and records revoked
`jti` values in PostgreSQL.

## API

| Method | Path | Result |
|---|---|---|
| `GET` | `/health` | `200 {"status":"ok"}`, or `503` when PostgreSQL is unreachable |
| `POST` | `/auth/register` | `201` auth response; `409 {"detail":"email_taken"}` for a duplicate |
| `POST` | `/auth/login` | `200` auth response; `401 {"detail":"invalid_credentials"}` |
| `GET` | `/auth/me` | `200` current user with a bearer token; `401 {"detail":"invalid_token"}` |
| `POST` | `/auth/logout` | `204` and the bearer token's `jti` is revoked; `401` otherwise |

Registration accepts `full_name`, `email` and `password` (8–128 characters), stores the email
lower-case and hashes the password with Argon2id through `pwdlib`. Login checks the Argon2id hash and
rejects inactive accounts with the same `invalid_credentials` response. Both endpoints issue a
token and return:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "<uuid>",
    "email": "user@example.com",
    "full_name": "User Name",
    "created_at": "<timestamp>"
  }
}
```

Registration always uses the 1-hour lifetime. Login accepts `remember: true` for the 30-day
lifetime. Tokens are `HS256`, issuer `catcus-api`, audience `catcus-web`, with `sub` (user UUID),
`email`, `name`, `jti`, `iat` and `exp` claims. Protected routes decode the token, reject a
revoked `jti`, and reject missing, inactive or deleted users as `invalid_token`. `/auth/logout`
inserts the `jti` into `revoked_tokens`; a revoked token then fails both `/auth/me` and a second
logout.

JWT settings, all overridable from `backend/.env`:

| Setting | Default | Notes |
|---|---|---|
| `JWT_SECRET` | none | Required, 32+ characters; must match root `.env.local` |
| `JWT_ALGORITHM` | `HS256` | Fixed |
| `JWT_ISSUER` | `catcus-api` | Validated on decode |
| `JWT_AUDIENCE` | `catcus-web` | Validated on decode |
| `ACCESS_TOKEN_TTL` | `3600` | Seconds |
| `REMEMBER_TOKEN_TTL` | `2592000` | Seconds (30 days) |

## Database

- PostgreSQL 15 in Docker, data in the named volume `catcus_pgdata`.
- `catcus` is the application database; `catcus_test` is created by
  `backend/docker/initdb/01-test-db.sh`.
- Init scripts run only on an empty volume. For a clean slate:
  `docker compose down -v && docker compose up -d --wait`, then run Alembic and the seed again.
- Alembic owns the schema. The application never calls `create_all()`.
- `users` columns use `text`; length limits live in Pydantic, not `varchar(n)`.
- `revoked_tokens` (migration `0002_revoked_tokens`) stores `jti` (UUID primary key), `user_id`
  (FK to `users`, `ON DELETE CASCADE`), `expires_at` and `revoked_at`, with an index on
  `expires_at` for later pruning. Active sessions stay stateless.

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
`revoked_tokens` and `users` between tests. They cover registration, case-insensitive duplicates,
Argon2id hashes, login success and failure, inactive users, `/health`, token claims and lifetimes,
`/auth/me`, every invalid-token case (missing, malformed, tampered, expired, wrong issuer,
wrong audience, missing claim, inactive or deleted user) and logout revocation. The pool test opens
40 concurrent sessions and asserts that every connection returns to the pool and that PostgreSQL
never sees more than 30 `catcus-api` connections.

## Demo account

`python -m scripts.seed` inserts `andrewmartin@catcus.com` / `Password@12` if it is missing. The
script is idempotent and does not re-hash an existing account.