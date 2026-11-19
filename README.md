# CATCUS

Login / create-account / dashboard flow built from the Figma design captured in
[`STYLE.md`](STYLE.md), with backend-backed auth.

```bash
npm install
cp .env.example .env.local     # set JWT_SECRET, same value as backend/.env
npm run up                     # PostgreSQL + FastAPI + Next.js
```

Then open `/signup`, `/login` or `/dashboard` at `http://127.0.0.1:3000`.
`npm run dev` starts the frontend alone and needs an already-running backend.
First-time backend setup is in [`docs/BACKEND.md`](docs/BACKEND.md).

**Seeded login:** `andrewmartin@catcus.com` / `Password@12`

- App code and conventions: [`docs/FRONTEND.md`](docs/FRONTEND.md)
- Backend and PostgreSQL setup: [`docs/BACKEND.md`](docs/BACKEND.md)
- Where the build differs from Figma: [`DEVIATIONS.md`](DEVIATIONS.md)
- Verification results: [`visual-checks/RESULTS.md`](visual-checks/RESULTS.md)

Checks (with `npm run up` running):

```bash
npm run check:geometry     # layout assertions from STYLE.md
npm run check:functional   # auth, routing and cookie behaviour
npm run check:visual       # 2880x1800 screenshots + pixelmatch diff
```

Signup and login run through Next.js Server Actions to FastAPI; accounts live in
PostgreSQL. FastAPI issues the JWT stored in the HttpOnly session cookie, the
dashboard verifies it against `/auth/me`, and logout revokes it. The browser
never calls the API directly. The Google / GitHub buttons
are no-ops. Do not optimise the SVGs in `design-assets/` or `public/assets/` —
their grain and blur filters break. `public/assets/grain.svg` is generated, not
exported: its alpha curve is tuned to Figma's NOISE effect, so changing the
filter values changes the diff.
