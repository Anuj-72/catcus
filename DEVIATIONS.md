# DEVIATIONS

Every place where the build differs from, or adds to, Figma. Design values come from
`STYLE.md` (2× frames, so CSS px = Figma px ÷ 2).

## Added for usability / accessibility (not in Figma)

| Change | Why | Where |
|---|---|---|
| `:focus-visible` outline: 2px `--brand`, 2px offset, on inputs, buttons, links and the custom checkbox | Figma has no focus state at all; keyboard users need one that is not colour-only | `src/app/globals.css`, `Checkbox.module.css` |
| Hover/active: `filter: brightness(1.08 / 0.94)` on the primary CTA, `brightness(0.97)` on Logout, `#F7F4EC` fill on social buttons | No hover states exist in the file; brightness keeps layout fixed | `PrimaryButton.module.css`, `LogoutButton.module.css`, `SocialButton.module.css` |
| `aria-busy` on the submitting button (no visual change, no disabled state) | Prevents a silent double submit while the Server Action runs without altering the design | `SignupForm.tsx`, `LoginForm.tsx` |
| `.sr-only` labels on the Create Account fields | That form is placeholder-only by design; screen readers still need names | `TextField.tsx` |
| Ambient drift on the three left-card ellipses: independent 41s / 34s / 27s loops, negative delays, uneven keyframe steps, ≤2.5% translate + ≤2% scale | Motion is not in the file at all; the brief asked for a slow, premium-looking drift. CSS-only, so no JS or hydration cost | `LeftCard.module.css` |
| `prefers-reduced-motion: reduce` parks the ellipse drift | Accessibility; also what keeps `npm run check:visual` screenshots deterministic (the check emulates it) | `LeftCard.module.css`, `scripts/visual-check.mjs` |

## Requested layout changes (deliberate departures from Figma)

| Change | Why | Where |
|---|---|---|
| `that` and `Matter ...` share one baseline (the word row uses `align-items: baseline`), placed so the shared baseline lands at Figma's rendered y (1615 Figma px from the frame top) | STYLE.md recorded the script's baseline 7.2 Figma px lower, which came from measuring a different glyph set; measured against the render it lifted the word well above `that` | `LeftCard.module.css` |

## Behavioural differences

| Change | Why | Where |
|---|---|---|
| Banner paragraph keeps the design's **manual** line break (`<br>`, `white-space: nowrap`) | Re-wrapping at 331.5 CSS px produced three lines with the web font's metrics | `WelcomeBanner.tsx` |
| Typed input text uses `--ink` (#18271F) at the placeholder's size/weight | No filled/typed state exists in the design | `TextField.module.css` |
| Signup validation messages reuse the login error style (`--error`, DM Sans 20px), placed under the T&C row | Error states only exist for Login in Figma | `SignupForm.tsx` / `.module.css` |
| Terms & Conditions link is `href="#"` | No destination exists; navigation is out of scope | `SignupForm.tsx` |
| Google / GitHub buttons are `type="button"` no-ops with a `// TODO: OAuth` | OAuth is out of scope | `SocialButton.tsx` |
| `/login?state=error` renders the error state without submitting (development only) | Needed to screenshot-compare with frame `33:70` | `src/app/(auth)/login/page.tsx` |
| Error message sits on the Remember Me row, right edge flush with the form | Matches the brief; Figma's baseline is 907.307, the same row as Remember Me | `LoginForm.module.css` |
| Password rules: min 8 characters, plus an email-format check and a duplicate-email rejection | No signup validation is designed | `lib/auth/validation.ts` |
| Dashboard keeps the locally verified session when `/auth/me` is unreachable | A backend outage should not sign every user out; revocation cannot be checked until the API returns. A 401 still clears the cookie and redirects to `/login` | `src/app/dashboard/page.tsx` |
| Pre-Phase-3 session cookies are rejected | Tokens now require `iss`, `aud`, a UUID `sub` and `jti`; there is no cookie migration, so users sign in again | `src/lib/auth/jwt.ts` |

## Reproduction limits

| Item | Detail |
|---|---|
| **Borders** | Figma's 1px black strokes are drawn as `1px` CSS (they are 0.5 CSS px in the 2× design) so browsers do not drop or double them; input borders use `calc(0.5835 * var(--u))` and snap to a device pixel. |
| **Divider rules** | The "Or sign in with" halves are CSS spans (`0.5835px` high, `rotate(0.577deg)`, right half `translateY(1.75px)`) instead of an exported SVG, because `design-assets/` has no line asset and every Figma export call was rate-limited. Figma sits the rule a few px higher relative to the label than a vertically centred row does. |
| **Sidebar / `that` noise** | Figma's `NOISE` effect on the dashboard sidebar and on the word `that` is reproduced by `public/assets/grain.svg`, a generated `feTurbulence` tile (12.5% mean black coverage) tiled at 80 CSS px and clipped to the sidebar box or to the glyphs. It is an authored asset, not a Figma export: it was tuned against the reference screenshots so the mean and grain contrast match. |
| **Main Logo grain** | `main-logo.svg` ships with a displacement filter whose flood alpha was 0.25, roughly 3.6× stronger than the grain Figma renders; both flood stops were lowered to 0.07. The displacement scale is untouched. |
| **DM Sans tracking** | Figma's DM Sans tracks about -5% relative to the Google variable font at `opsz` 14, which otherwise renders ~9% wider. `.u-dm` applies `letter-spacing: -0.05em`, so the tracking scales with `--u`. |
| **`Matter ...` offset** | Pinyon Script's web font overshoots its ascent further than the Figma cut, so the gold line is nudged 4 CSS px down (`position: relative; top`) to land on Figma's rendered band. It does not affect the shared baseline of the row. |
| **Logout icon size** | Rendered at 22.5 CSS px (45 Figma px, per `STYLE.md`). The task brief said 30 CSS px; `STYLE.md` won. |
| **Ellipse positions** | Placed at Figma bbox − 31.3px blur bleed, which is exactly what the exported 882.6/612.6/362.6 SVGs encode. No further adjustment was needed. |
| **`Cactus` vs `Catcus`** | Dashboard copy says "Cactus", the brand/email say "Catcus". Both kept exactly as designed. |

## Config changes

| Change | Why |
|---|---|
| `next.config.ts`: dropped the template's `cacheComponents` / `partialPrefetching` | Every route here is session-dependent; the defaults are what we want |
| `devIndicators: false` | Keeps the Next dev badge out of the 2880×1800 screenshots |
