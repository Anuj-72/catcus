# CATCUS

Login / create-account / dashboard flow built from the Figma design captured in
[`STYLE.md`](STYLE.md), with a mock auth flow.

```bash
npm install
cp .env.example .env.local     # set a 32+ character AUTH_SECRET
npm run dev
```

Then open `/signup`, `/login` or `/dashboard`.

**Seeded login:** `andrewmartin@catcus.com` / `Password@12`

- App code and conventions: [`docs/FRONTEND.md`](docs/FRONTEND.md)
- Where the build differs from Figma: [`DEVIATIONS.md`](DEVIATIONS.md)
- Verification results: [`visual-checks/RESULTS.md`](visual-checks/RESULTS.md)

Checks (with the dev server running):

```bash
npm run check:geometry     # layout assertions from STYLE.md
npm run check:functional   # auth, routing and cookie behaviour
npm run check:visual       # 2880x1800 screenshots + pixelmatch diff
```

No backend, database or OAuth: accounts live in server memory and the Google /
GitHub buttons are no-ops. Do not optimise the SVGs in `design-assets/` or
`public/assets/` — their grain and blur filters break. `public/assets/grain.svg`
is generated, not exported: its alpha curve is tuned to Figma's NOISE effect, so
changing the filter values changes the diff.
