# Prototype limitations

CATCUS is a functional prototype of the four Figma auth screens, not a
production deployment. The signup, login, session, dashboard and logout flows
work end to end against PostgreSQL, but the gaps below are deliberate Phase 4
and Future work.

## Authentication and security

- No rate limiting, lockout or backoff on `/auth/login`, `/auth/register` or
  repeated token failures. Credentials can be brute-forced.
- Password policy is only the 8–128 character bound. No common-password or
  breached-password screening.
- `JWT_SECRET` is a shared HS256 secret in both services. Rotation invalidates
  every session, and there is no key ID or overlap window for rotation.
- No CSRF token. The cookie is `SameSite=Lax` and auth mutations go through
  Server Actions; this is not a full CSRF design.
- No MFA, email verification or password reset.
- No OAuth. The Google and GitHub buttons are intentional no-ops.
- No session inventory, per-device listing, logout-all or global invalidation.
- No security-header policy (CSP, HSTS, frame protection) beyond Next defaults.

## Token lifecycle

- `revoked_tokens` rows are never pruned. Each logout adds one row; the table
  grows until a Phase 4 cleanup job is added.
- No refresh tokens or sliding sessions. Tokens last 1 hour, or 30 days with
  Remember Me, then the user signs in again.
- The route proxy verifies signature, issuer, audience and expiry only.
  Revocation is enforced by the dashboard's `/auth/me` call and by every
  protected API request, not by the proxy.
- If FastAPI is unreachable, the dashboard falls back to the locally verified
  unexpired token because revocation cannot be checked. Deactivation is also
  not visible until the API returns.

## Operations and deployment

- Local development only: HTTP, loopback services, no domain, reverse proxy or
  TLS.
- No production deployment configuration, secret manager or release process.
- Alembic exists, but there is no defined deploy-time migration step or rollback.
- No database backups, retention policy or restore rehearsal.
- One uvicorn worker. The pool ceiling is 5 connections per instance, sized for a
  serverless deployment rather than measured; PgBouncer is not configured locally,
  and the pooled endpoint is only exercised in deployment.
- No structured logging, metrics, tracing or alerting. Secrets and tokens are
  not logged, but auth events are not captured either.
- `/health` checks PostgreSQL, so liveness and readiness are not separated.
- PostgreSQL is pinned to 15.12 because pulling 17 failed in this environment.
- Python 3.14 needs plain `uvicorn`; `uvicorn[standard]` pulls `uvloop`, which
  has no matching wheel here.

## Resilience and error handling

- A PostgreSQL outage makes `/health` return 503, but auth routes do not map
  database failures to a designed 503 response.
- A FastAPI outage shows the designed form-level login/signup failure; other
  backend failures surface as generic form errors.
- Functional checks require PostgreSQL and FastAPI. `npm run dev` alone is not
  enough.

## Product scope

- No account settings, profile editing or account deletion.
- No admin or user-management UI.
- The Terms & Conditions link is `href="#"`; there is no destination.
- The dashboard visual reference is 1600×1000, not the 2880×1800 used by the
  other views, because of a Figma rate limit.

## Verification limits

- Backend coverage is pytest. There are no frontend unit or component tests;
  frontend confidence comes from ESLint, TypeScript, `next build` and the
  Playwright scripts.
- Geometry, responsive and visual checks depend on their reference assets and
  viewport setup; they are regression checks, not a guarantee across browsers.

## Before exposing this to real users

At minimum: rate limiting, a stronger password policy, TLS and secret
management, a deployment and migration process, backups with a restore
rehearsal, revoked-token pruning, and structured auth logging and alerts.