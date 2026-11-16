# CATCUS frontend

Next.js (App Router, TypeScript strict) reproduction of four Figma frames with a
**mock** auth flow. No backend, no database: accounts live in server memory.

| View | Figma frame | Route |
|---|---|---|
| Create Account | `25:47` | `/signup` |
| Login | `27:284` | `/login` |
| Login error state | `33:70` | `/login` after a failed sign-in (or `/login?state=error` in development) |
| Dashboard | `33:186` | `/dashboard` (session required) |

## Run it

```bash
npm install
cp .env.example .env.local      # then put a random 32+ char AUTH_SECRET in it
npm run dev
```

`AUTH_MODE=mock` selects the mock store. `AUTH_SECRET` signs the session JWT
(HS256) and is required: the app throws on boot if it is missing or shorter than
32 characters. Generate one with `openssl rand -base64 32`.

**Seeded account:** `andrewmartin@catcus.com` / `Password@12` (the same strings
that appear as placeholder copy in the design). New accounts created via
`/signup` are held in a `Map` on `globalThis` and disappear when the server
restarts.

## Layout of the code

```
src/
  app/
    layout.tsx              fonts (Manrope, DM Sans + opsz, Marcellus, Pinyon) and <body>
    globals.css             tokens, the --u scale unit, resets, type utilities
    page.tsx                "/" -> /dashboard or /login
    (auth)/layout.tsx       stage + Left Card + form panel
    (auth)/login/page.tsx   Login (reads ?state=error in dev)
    (auth)/signup/page.tsx  Create Account
    dashboard/page.tsx      protected dashboard
  components/
    auth/                   LeftCard, DividerOr, SignupForm, LoginForm
    ui/                     TextField, Checkbox, PrimaryButton, SocialButton
    dashboard/              Sidebar, HeaderBar, WelcomeBanner, AccountCard, LogoutButton
  lib/auth/                 jwt.ts, session.ts, mock-db.ts, actions.ts, validation.ts, user.ts
  proxy.ts                  route protection (Next 16 proxy, verifies the JWT)
scripts/                    visual / geometry / functional checks
public/assets/              the eight SVGs, copied unchanged from design-assets/
```

## Tokens and assets

Every colour lives in `src/app/globals.css` as a CSS custom property
(`--page`, `--brand`, `--ink`, `--muted`, `--placeholder`, `--border`, `--field`,
`--cream`, `--gold`, `--lime`, `--error`, `--banner`, `--header-bg`,
`--card-tint`, …) and components never hard-code a hex value. Type line heights
are the ratios measured from Figma (`--lh-manrope: 1.366`, `--lh-dm: 1.302`,
`--lh-marcellus: 1.2539`, `--lh-pinyon: 1.2476`).

Assets are served straight from `public/assets/` (plain `<img>`); `design-assets/`
still holds the originals. **Never run SVGO on them** — the logo contains the
grain filter and the ellipses contain blur filters, and both break when
optimised.

## The `--u` scale unit

The frames are 2880×1800 = 1440×900 CSS px at 2×, so **CSS px = Figma px ÷ 2**.

```css
:root {
  /* One CSS px of the 1440x900 frame, fitted to BOTH axes. */
  --u: max(0.35px, min(calc(100vw / 1440), calc(100vh / 900), 2px));
  /* Figma's 1px black strokes, never thinner than one device pixel. */
  --hairline: max(1px, calc(0.5 * var(--u)));
}
```

Every dimension is written as `calc(<cssPx> * var(--u))`, so the whole design
scales proportionally with the window. Because the unit is the **smaller** of the
two fits, the 16:10 frame always fits both axes:

| Window | `--u` | Frame |
|---|---|---|
| 1440×900 | 1px | 1440×900, pixel-exact |
| 1366×768 | 0.853px | 1228×768, letterboxed horizontally |
| 1920×1080 | 1.2px | 1728×1080 |
| 3840×2160 | 2px (cap) | 2880×1800 |

A width-only unit (`100vw / 1440`) overflowed vertically as soon as the window
was shorter than 900px, and that vertical scrollbar then made `100vw` wider than
the client area, adding a horizontal one too. Nothing overflows now, so no
scrollbars appear at any size; `npm run check:responsive` asserts that on four
views across six viewports.

Border widths are the exception: the 1.167 Figma px input border uses
`calc(0.5835 * var(--u))`, and 1px black outlines use the `--hairline` token.

## Mock auth

- `lib/auth/actions.ts` — `loginAction`, `signupAction`, `logoutAction` (`"use server"`), used through `useActionState`. Failure returns `{ error, ...values }` so the typed email survives; a wrong password and an unknown email return the same message.
- `lib/auth/session.ts` — signs a JWT (`sub` = email, `name`, `iat`, `exp`) into the `catcus_session` cookie: `httpOnly`, `sameSite: lax`, `secure` in production, 1 hour by default and 30 days with "Remember Me".
- `lib/auth/mock-db.ts` — seeded user + in-memory store on `globalThis`, constant-time password comparison (passwords are stored in plain text *because this is mock data only*).
- `src/proxy.ts` — redirects unauthenticated `/dashboard/*` to `/login` and signed-in users away from `/login` and `/signup`; the dashboard page verifies the session again on the server.

Swapping in a real backend means replacing the internals of `lib/auth/*` and
keeping the action signatures and session shape.

## Checks

Start the dev server first (`npm run dev`, default port 3000). The scripts
default to `BASE_URL=http://localhost:3100`; override it if your port differs.

```bash
BASE_URL=http://localhost:3000 npm run check:geometry     # 52 box/style assertions, +-0.5 px
BASE_URL=http://localhost:3000 npm run check:functional   # 19 auth/route/cookie checks
BASE_URL=http://localhost:3000 npm run check:visual       # 2880x1800 screenshots + pixelmatch
BASE_URL=http://localhost:3000 npm run check:responsive   # no scrollbars at 6 viewport sizes
```

`check:visual` writes `visual-checks/mine/<view>.png` and, when a reference
exists at `visual-checks/reference/<view>.png`, a diff at
`visual-checks/diff/<view>.png` plus the percentage of differing pixels. The
signup, login and login-error frames are in place at 2880×1800. The dashboard
frame could only be obtained at 1600×1000 before the Figma API rate limit, so add
`visual-checks/reference/dashboard.png` at 2880×1800 when it becomes available.

Expected acceptable differences: font anti-aliasing, grain speckle (phase, not
amplitude) and sub-pixel border snapping.

Results of the last run: `visual-checks/RESULTS.md`.
