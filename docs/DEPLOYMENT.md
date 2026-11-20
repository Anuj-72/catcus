# Deployment

How CATCUS runs on Vercel: one project, two services, one managed PostgreSQL
database. Local development is unchanged; nothing in this document is needed for
`npm run up`.

## Topology

```text
Browser
  |
  |  HTTPS  ->  https://<project>.vercel.app
  v
Vercel project
  |
  |  service "web"   Next.js BFF, the only public route
  |                  rewrites: /(.*) -> web
  |
  |  server-side fetch -> BACKEND_URL (service binding, no public route)
  v
  |  service "api"   FastAPI, private, no rewrite of its own
  |
  |  DATABASE_URL (pooled endpoint)
  v
Neon PostgreSQL
```

The trust boundary is the same as local development. The browser never reaches
FastAPI: `api` has no rewrite, so Vercel never routes public traffic to it, and
`web` reaches it only through a service binding that injects the internal URL as
`BACKEND_URL`. Bindings are runtime-only and deployment-aware, so a preview
deployment's `web` service calls that same preview's `api` service.

`vercel.json` at the repository root declares both services. The Next.js app is
at the root, FastAPI is in `backend/`.

## Prerequisites

- A Vercel account. Hobby is enough; it is restricted to personal and
  non-commercial use by the Terms of Service, section 4.
- The GitHub repository connected to that account.
- Vercel CLI: `npm i -g vercel`
- `openssl` for generating the JWT secret.

## Quick start: deploying the prototype

The condensed runbook. Sections 1–7 explain each step; this is the order to run
them in. Every command runs from the repository root. Nothing here touches local
development, and nothing here is required for `npm run up`.

```bash
cd /mnt/LocalDisk/Project_1

# 1. Authenticate and create the project
vercel login
vercel project create catcus
vercel link --yes --scope next-next2 --project catcus

# 2. Framework preset must be "services", not "nextjs"
vercel project update --framework services

# 3. Connect the GitHub repo so pushes to main deploy production
vercel git connect

# 4. Provision PostgreSQL (Neon, from the Marketplace)
vercel integration add neon --name catcus-db --meta auth=false -e production

# 5. Shared auth settings, read by both services
openssl rand -base64 32
vercel env add JWT_SECRET -e production      # paste the generated value
vercel env add JWT_ISSUER -e production      # catcus-api
vercel env add JWT_AUDIENCE -e production    # catcus-web
vercel env add SEED_DEMO -e production       # true for the demo account

# 6. Confirm the variables landed (counts only, values are never printed)
vercel env ls

# 7. Deploy
vercel deploy --prod
```

`BACKEND_URL` is not set by hand; the service binding in `vercel.json` injects
it into the `web` service at runtime.

Success looks like this:

- The build log for `api` contains `Database setup complete.`
- `vercel ls` shows the deployment as **Ready** and targeting Production.
- `https://catcus.vercel.app/signup` renders the signup frame.
- Signing up lands on the dashboard with the name you typed.
- `andrewmartin@catcus.com` / `Password@12` works, because `SEED_DEMO=true`.
- Signing out and reopening `/dashboard` redirects to `/login`.

If any of that fails, see §9 Troubleshooting. Two things that are normal rather
than broken: the first request after a quiet period is slow (the function and
the Neon compute both cold-start), and a `preview` deployment builds and migrates
against the same database as production.

Afterwards, remove the demo account by setting `SEED_DEMO` to anything other than
a truthy value and redeploying. It does not delete the existing row, only stops
re-seeding it.

## 1. Create the project

Root Directory must be the repository root, not `backend/`, because
`vercel.json` declares both services relative to it.

```bash
cd /mnt/LocalDisk/Project_1
vercel login
vercel project create catcus                          # or link an existing one
vercel link --yes --scope next-next2 --project catcus
vercel project update --framework services
```

The framework preset **must** be `services`. With the Next.js preset, Vercel
builds only the frontend and ignores the `services` block, so `BACKEND_URL` is
never injected.

In the dashboard, confirm **Settings → General → Root Directory** is empty
(repository root) and **Build and Deployment → Framework Preset** is `Services`.

## 2. Add the database

Vercel no longer sells its own Postgres; Neon comes from the Marketplace and
sets the connection variables for you.

```bash
vercel integration add neon --name catcus-db --meta auth=false -e production
```

That provisions one database and adds `DATABASE_URL` (pooled) and
`DATABASE_URL_UNPOOLED` (direct) to the project. `DATABASE_URL` is what FastAPI
uses at runtime; the direct URL is what migrations use, because a
transaction-mode pooler cannot hold an advisory lock or run DDL inside a
transaction reliably.

For a prototype, one database for production is enough. Two consequences:

- Preview deployments share it, and their build hook runs the same migrations.
  Keep schema changes additive and land them with the production deploy.
- For full isolation, repeat the command with `--environment preview`. The
  `DATABASE_URL_UNPOOLED` variable is then scoped per environment.

Neon's free plan is permanent rather than a trial: 1 GB of storage, 100
compute-hours per month, connection pooling included, and compute that scales to
zero after five minutes idle. The first query after an idle period is slower.

## 3. Set environment variables

Project-level variables are visible to both services, which is what makes the
shared HS256 design work: Next.js verifies the tokens FastAPI issues, so both
need the same secret.

```bash
openssl rand -base64 32          # copy the output
vercel env add JWT_SECRET -e production      # paste it; must be 32+ characters
vercel env add JWT_ISSUER -e production      # catcus-api
vercel env add JWT_AUDIENCE -e production    # catcus-web
vercel env add SEED_DEMO -e production       # true, to create the demo account
```

`vercel env add` prompts for the value on stdin. To set one non-interactively,
pass `--value` instead, for example `vercel env add JWT_ISSUER -e production
--value catcus-api`.

| Variable | Service | Value |
|---|---|---|
| `JWT_SECRET` | both | 32+ random characters, identical for both services |
| `JWT_ISSUER` | both | `catcus-api` |
| `JWT_AUDIENCE` | both | `catcus-web` |
| `SEED_DEMO` | api | `true` to seed `andrewmartin@catcus.com`, anything else to skip |
| `DATABASE_URL` | api | set by the Neon integration (pooled) |
| `DATABASE_URL_UNPOOLED` | api | set by the Neon integration (direct) |
| `BACKEND_URL` | web | **do not set** — the service binding generates it |

Do not set `ACCESS_TOKEN_TTL` or `REMEMBER_TOKEN_TTL` unless you want to override
the defaults (1 hour and 30 days); the baked-in values match local development.
The `DB_POOL_*` defaults are already sized for this deployment.

Two notes:

- `SEED_DEMO=true` creates an account with a password that is published in this
  repository. It is convenient for a demo and should be removed afterwards.
- Project-level variables are readable by both runtimes, so the Next.js service
  can technically read `DATABASE_URL`. It does not use it, and nothing in the
  frontend sends it to the browser.

## 4. Deploy

```bash
vercel deploy           # preview
vercel deploy --prod    # production
```

Each build does two things:

- `web`: `next build`.
- `api`: installs dependencies from `backend/pyproject.toml`, then runs the
  build command declared in `[tool.vercel.scripts]` — `python -m
  scripts.deploy_setup`. That takes a PostgreSQL advisory lock, runs `alembic
  upgrade head`, seeds the demo account when `SEED_DEMO` is set, and releases the
  lock. A failure here fails the build, so a deployment never serves traffic
  against an unmigrated schema.

Confirm the build log contains `Database setup complete.`

`backend/.python-version` pins Python 3.14 to match local development. If the
build cannot install a wheel for some dependency, change that file to `3.13` and
redeploy.

## 5. Verify the deployment

FastAPI has no public route, so `/health` is not reachable from outside. Verify
through the boundary instead:

1. Open `https://<project>.vercel.app/signup`, create an account, and confirm the
   dashboard renders the name you typed. That path exercised signup, Argon2id
   hashing, Postgres, and the JWT round trip.
2. Signing up with the same email again should show the duplicate-email message
   rather than creating a second row.
3. Sign in with `andrewmartin@catcus.com` / `Password@12` if `SEED_DEMO` was set.
4. Sign out, then open `/dashboard` directly: it must redirect to `/login`.
5. In the browser devtools, confirm the `catcus_session` cookie is `HttpOnly`
   and `Secure`, and that its value is a JWT.
6. Tamper with the cookie value and reload `/dashboard`: it must redirect to
   `/login`.

A dashboard check hits `/auth/me` on every render, so a valid cookie whose token
has been revoked cannot keep a session open.

## 6. Deployment protection

Leave **Deployment Protection off for Production**. It is useful for Preview,
where it keeps unreleased builds private, but on Production it puts an
authentication wall in front of the site and a visitor cannot open the URL.

Internal calls are unaffected either way: service-to-service calls over a binding
skip the firewall and Deployment Protection. Only public ingress is protected.

## 7. Logs, rollback, and migrations

```bash
vercel logs <deployment-url>     # runtime logs; 1 hour of retention on Hobby
vercel ls                        # recent deployments
vercel rollback                  # revert to the previous production deployment
```

Rolling back reverts code, not schema. The build hook migrates the database
before the new deployment serves traffic, so an older deployment can find itself
running against a newer schema. Keep migrations additive — add nullable columns
or new tables rather than renaming or dropping — and treat `alembic downgrade` as
a manual operation with a backup at hand.

## 8. Hobby plan limits

| Resource | Included |
|---|---|
| Function maximum duration | 300 s |
| Function invocations | 1,000,000 per month |
| Active CPU | 4 hours per month |
| Provisioned memory | 360 GB-hours per month |
| Fast data transfer | 100 GB per month |
| Fast origin transfer | 10 GB per month |
| Service requests | 1,000,000 per month |
| Runtime logs | 1 hour |
| Deployments | 100 per day |

Exceeding a limit in most cases means waiting for the next 30-day period. Set a
spend limit in the dashboard if there is any chance of moving to Pro.

The database pool defaults to a ceiling of 5 connections per instance
(`DB_POOL_SIZE=2` plus `DB_MAX_OVERFLOW=3`). The ceiling is per instance and
Vercel runs one instance per unit of concurrent traffic, so raising it multiplies
across instances; Neon's pooler accepts up to 10,000 client connections.

## 9. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Signup and login fail with the unreachable message | The binding is missing. Confirm the framework preset is `Services` and the `api` service exists in `vercel.json`. |
| Build fails at `Database setup complete` | The database variables are not set for that environment. Add the Neon resource to it. |
| `prepared statement ... does not exist` under load | Prepared statements must stay disabled behind the pooler. `prepare_threshold=None` in `backend/app/db/session.py` handles this. |
| First request after a quiet period is slow | Expected: the Vercel function and Neon compute both start on demand. |
| Sessions drop immediately after login | `JWT_SECRET` differs between the two services. One project-level value avoids this entirely. |
| Pool timeout errors under load | Raise `DB_POOL_SIZE` and `DB_MAX_OVERFLOW`, or move to a larger Neon compute. |

## 10. Optional: run the services locally through Vercel

`vercel dev --local` runs both services the way the platform does, including the
generated binding variables. It is optional; `npm run up` remains the normal
local workflow.

## References

- Services: <https://vercel.com/docs/services>
- Service bindings: <https://vercel.com/docs/services/bindings>
- Service configuration: <https://vercel.com/docs/services/config-reference>
- FastAPI on Vercel: <https://vercel.com/docs/frameworks/backend/fastapi>
- FastAPI with Next.js: <https://vercel.com/kb/guide/python-backend-on-vercel>
- Hobby plan limits: <https://vercel.com/docs/plans/hobby>
