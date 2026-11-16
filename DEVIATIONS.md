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

## Behavioural differences

| Change | Why | Where |
|---|---|---|
| Welcome banner shows the **full two-line** paragraph instead of Figma's 50px clip (one visible line) | The clip looks like a design mistake, per the brief's default decision | `WelcomeBanner.module.css` — to restore the clipped look add `height: calc(25 * var(--u)); overflow: hidden;` to `.body` |
| Banner paragraph keeps the design's **manual** line break (`<br>`, `white-space: nowrap`) | Re-wrapping at 331.5 CSS px produced three lines with the web font's metrics | `WelcomeBanner.tsx` |
| Typed input text uses `--ink` (#18271F) at the placeholder's size/weight | No filled/typed state exists in the design | `TextField.module.css` |
| Signup validation messages reuse the login error style (`--error`, DM Sans 20px), placed under the T&C row | Error states only exist for Login in Figma | `SignupForm.tsx` / `.module.css` |
| Terms & Conditions link is `href="#"` | No destination exists; navigation is out of scope | `SignupForm.tsx` |
| Google / GitHub buttons are `type="button"` no-ops with a `// TODO: OAuth` | OAuth is out of scope for mock auth | `SocialButton.tsx` |
| `/login?state=error` renders the error state without submitting (development only) | Needed to screenshot-compare with frame `33:70` | `src/app/(auth)/login/page.tsx` |
| Error message sits on the Remember Me row, right edge flush with the form | Matches the brief; Figma's baseline is 907.307, the same row as Remember Me | `LoginForm.module.css` |
| Password rules: min 8 characters, plus an email-format check and a duplicate-email rejection | No signup validation is designed | `lib/auth/validation.ts` |

## Reproduction limits

| Item | Detail |
|---|---|
| **Borders** | Figma's 1px black strokes are drawn as `1px` CSS (they are 0.5 CSS px in the 2× design) so browsers do not drop or double them; input borders use `calc(0.5835 * var(--u))` and snap to a device pixel. |
| **Divider rules** | The "Or sign in with" halves are CSS spans (`0.5835px` high, `rotate(0.577deg)`, right half `translateY(1.75px)`) instead of an exported SVG, because `design-assets/` has no line asset and every Figma export call was rate-limited. Figma sits the rule a few px higher relative to the label than a vertically centred row does. |
| **Sidebar / `that` noise** | The Main Logo's grain is the SVG filter inside `main-logo.svg` (used as-is, never optimised). The dashboard sidebar's `NOISE` effect and the `NOISE` on the word `that` are **not** reproduced: both are filters applied to CSS text/boxes, and hand-building a turbulence filter would invent an asset. Visible as missing speckle on the sidebar only. |
| **Logout icon size** | Rendered at 22.5 CSS px (45 Figma px, per `STYLE.md`). The task brief said 30 CSS px; `STYLE.md` won. |
| **Ellipse positions** | Placed at Figma bbox − 31.3px blur bleed, which is exactly what the exported 882.6/612.6/362.6 SVGs encode. No further adjustment was needed. |
| **`Cactus` vs `Catcus`** | Dashboard copy says "Cactus", the brand/email say "Catcus". Both kept exactly as designed. |
| **`AUTH_MODE`** | Documented and defaults to `mock`, but the app always uses the in-memory store: there is no real backend in this task. |

## Config changes

| Change | Why |
|---|---|
| `next.config.ts`: dropped the template's `cacheComponents` / `partialPrefetching` | Every route here is session-dependent; the defaults are what we want |
| `devIndicators: false` | Keeps the Next dev badge out of the 2880×1800 screenshots |
