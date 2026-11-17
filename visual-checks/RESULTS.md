# Verification results

Last run: 2026-11-17, Next.js 16.4.6 dev server, Chromium (Playwright), viewport
1440×900 at `deviceScaleFactor: 2` → screenshots are 2880×1800, the same size as
the Figma frames.

## 1. Visual diff vs Figma

| View | Route | Reference | Diff |
|---|---|---|---|
| Create Account | `/signup` | 2880×1800 | 3.59% differing pixels |
| Login | `/login` | 2880×1800 | 3.34% differing pixels |
| Login error | `/login?state=error` | 2880×1800 | 3.53% differing pixels |
| Dashboard | `/dashboard` | 1600×1000 only | 3.58% at 1600 (see note) |

The Figma API hit its rate limit before the dashboard frame could be exported at
full resolution, so the dashboard is compared against the 1600×1000 frame render
with our screenshot downscaled to match; it is not in the automated table. Sidebar,
banner, header and account-card crops match the reference structurally, and the
banner's one-line clip is reproduced.

Residual difference on the auth pages is anti-aliasing along glyph edges — the
text bands themselves measure within 1 device pixel of the reference (`that` y
1529–1616 ×221–440 identical; gold band y 1442–1623 identical; form labels and
title within 1–2 device px). Diff artefacts are in `visual-checks/diff/`.

## 2. Geometry assertions — 52/52 passed

`node scripts/geometry-check.mjs`, tolerance ±0.5 px. Full table in the run
output; highlights:

| Group | Result |
|---|---|
| Auth stage: left card (20, 20, 700, 860), form panel (720, 20, 700, 860) | pass |
| Create: name boxes 245×58.3335, email/password 525, row gaps 36, CTA 525×58.3335, socials 245 with 35 gap | pass |
| Login: label→box 11, group gap 47.5, CTA left offset +1 | pass |
| Dashboard: sidebar (24, 19, 350, 860), header (396.5, 24, 1020.5, 85), banner (399, 132.5, w 1018), card (399, 422, 650, 457), logout (1200, 804, 217, 75) | pass |
| Computed styles: H1 52.5px / Manrope 700, CTA DM Sans 500, header title Manrope 600, account value DM Sans 500, `font-variation-settings: "opsz" 14` | pass |
| Left card words: row uses `align-items: baseline`, `that` / `Matter ...` baseline delta 4.86px (the deliberate Pinyon nudge) | pass |

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

## 4. Responsive / overflow — 24/24 passed

`node scripts/responsive-check.mjs`, four views × six viewports. Scale is
`--u: max(0.35px, min(100vw / 1440, 100vh / 900, 2px))`. The auth stage spans the
window width (100vw) and is 900 × `--u` tall, so the card keeps the same frame
inset on the left, right and top at any aspect; only a window narrower than 16:10
letterboxes vertically. The dashboard stage remains 1440 × `--u` wide, centred.

| Viewport | `--u` | Auth stage | Scrollbars |
|---|---|---|---|
| 1920×1080 | 1.2px | 1920×1080 | none |
| 1600×900 | 1px | 1600×900 | none |
| 1440×900 | 1px | 1440×900 (pixel-exact) | none |
| 1366×768 | 0.853px | 1366×768 | none |
| 1280×800 | 0.889px | 1280×800 | none |
| 1024×768 | 0.711px | 1024×640, centred vertically | none |

Every case reports `scrollWidth/scrollHeight == clientWidth/clientHeight`, no
scrollbar, and the stage fully inside the viewport.

## 5. Build

- `npm run build` — pass (TypeScript + route compilation).
- `npm run lint` — pass, no warnings.

## 6. Not verified

- Full-resolution dashboard pixel diff (only the 1600×1000 render exists; see §1).
- Real-device / cross-browser rendering; only Chromium was used.
- OAuth flows — the social buttons are intentional no-ops.
