# Verification results

Last run: 2026-11-15, Next.js 16.4.6 dev server, Chromium (Playwright), viewport
1440×900 at `deviceScaleFactor: 2` → screenshots are 2880×1800, the same size as
the Figma frames.

## 1. Visual diff vs Figma

| View | Route | Reference | Diff |
|---|---|---|---|
| Create Account | `/signup` | **missing** | not computed |
| Login | `/login` | **missing** | not computed |
| Login error | `/login?state=error` | **missing** | not computed |
| Dashboard | `/dashboard` | **missing** | not computed |

**Blocked, not passed.** Every Figma export call (`FIGMA_DOWNLOAD_FIGMA_IMAGES`,
`FIGMA_RENDER_IMAGES_OF_FILE_NODES`) returned `429 Rate limit exceeded`, including
a single-node retry at scale 1, so no reference PNG could be downloaded. Our
renders are captured at exactly 2880×1800 (no rescaling needed) and the diff path
is wired up: drop the four reference PNGs into `visual-checks/reference/` and rerun
`npm run check:visual` to get percentages and `visual-checks/diff/*.png`.

## 2. Geometry assertions — 50/50 passed

`node scripts/geometry-check.mjs`, tolerance ±0.5 px. Full table in the run
output; highlights:

| Group | Result |
|---|---|
| Auth stage: left card (20, 20, 700, 860), form panel (720, 20, 700, 860) | pass |
| Create: name boxes 245×58.3335, email/password 525, row gaps 36, CTA 525×58.3335, socials 245 with 35 gap | pass |
| Login: label→box 11, group gap 47.5, CTA left offset +1 | pass |
| Dashboard: sidebar (24, 19, 350, 860), header (396.5, 24, 1020.5, 85), banner (399, 132.5, w 1018), card (399, 422, 650, 457), logout (1200, 804, 217, 75) | pass |
| Computed styles: H1 52.5px / Manrope 700, CTA DM Sans 500, header title Manrope 600, account value DM Sans 500, `font-variation-settings: "opsz" 14` | pass |

## 3. Functional checklist — 19/19 passed

`node scripts/functional-check.mjs`:

| Check | Result |
|---|---|
| Signup with new data → `/dashboard` showing that name, email and initials (RV) | pass |
| Logout → `/login`; `/dashboard` signed out → `/login` | pass |
| Wrong password → designed message, red borders (`rgb(171,0,0)`), email retained | pass |
| Seeded account signs in → `/dashboard` | pass |
| Signed-in `/login` and `/signup` → `/dashboard` | pass |
| Session cookie ≈ 1 hour by default, ≈ 30 days with Remember Me, `httpOnly` | pass |
| Tampered cookie rejected | pass |
| Checkbox toggles; Enter in a field submits | pass |
| Empty signup shows a validation message instead of crashing | pass |

## 4. Build

- `npm run build` — pass (TypeScript + route compilation).
- `npm run lint` — pass, no warnings.

## 5. Not verified

- Pixel diff against Figma (see §1).
- Real-device / cross-browser rendering; only Chromium was used.
- OAuth flows — the social buttons are intentional no-ops.
- The dashboard sidebar's NOISE effect and the `that` texture (see
  `DEVIATIONS.md`).
