# STYLE.md — "CATCUS" auth + dashboard design (Figma → spec)

> Single source of truth for rebuilding the four desktop frames. Everything here was read from the Figma file with the Figma tools; nothing is invented. Anything that could not be read is marked **UNKNOWN** with the reason (see §10).
> Units are **Figma px** unless a column says **CSS px** (= Figma px ÷ 2).

---

## 0. Document meta

| Item | Value |
|---|---|
| Figma URL | `https://www.figma.com/design/9PVbL6xhwz69CZuLyqpodL/Untitled` |
| File key | `9PVbL6xhwz69CZuLyqpodL` |
| File name | `Untitled` |
| File version | `2421762863374863774` |
| Last modified | `2026-11-14T18:35:04Z` |
| Editor type | `figma` (Design file, not FigJam/Slides) |
| Link access | `plan_edit` |
| Our role on the file | `viewer` |
| Creator / last touched by | "Anuj kumar Sah" |
| Pages | 1 — `Page 1` (`0:1`) |
| Local styles | **none** (`styles: {}` on every node fetched) |
| Design variables | **UNKNOWN** — the variables endpoint requires the `file_variables:read` scope, which the connected token does not have. `FIGMA_EXTRACT_DESIGN_TOKENS` returned 0 tokens for the same reason. Colors below are therefore hard-coded literals read from node fills/strokes, not tokens. |

**Errata applied 2026-11-15** after a second verified Figma MCP pass: font weights for the previously-unknown nodes, the exact border-box gaps in both forms, social-button/header text alignment, and all dashboard border-box sizes/radii below are from that pass and **override** the earlier stroke-centred values.

How this doc was produced (for traceability): node trees (`GET_FILE_NODES`), file metadata, and **vector SVG exports of every frame/component with text kept as `<text>`** (`RENDER_IMAGES_OF_FILE_NODES`, `svg_outline_text=false`). The SVG exports carry the exact geometry, fill, stroke, font-family/size and the exact filter definitions (blur/noise/grain) and were cross-checked against PNG renders of the same nodes. Where the structured tree and the SVG disagreed by sub-pixel amounts, the SVG value is quoted and the tree value noted.

### Scale rule (important)

The four desktop frames are **2880 × 1800**. This is a **2× design of a 1440 × 900 desktop**.

> **CSS px = Figma px ÷ 2.**

Every measurement below is given as Figma px, with CSS value in brackets where it matters. Text sizes therefore halve: `Manrope 105` → `52.5px`, `DM Sans 46.667` → `23.33px`, `Pinyon Script 250` → `125px`.

---

## 1. Global

### 1.1 Canvas / frames

| Frame | Node | Size | Position on page | Background |
|---|---|---|---|---|
| Desktop - Create Account | `25:47` | 2880 × 1800 | x 182, y 2612 | `#E9E3D6` |
| Desktop - Login | `27:284` | 2880 × 1800 | x 3362, y 2612 | `#E9E3D6` |
| Desktop - Login Error State | `33:70` | 2880 × 1800 | x 6542, y 2612 | `#E9E3D6` |
| Desktop - Dashboard | `33:186` | 2880 × 1800 | x 9722, y 2612 | `#E9E3D6` |

- Every frame background is a `#E9E3D6` fill with **corner radius 40** [20 CSS] applied to the frame itself (the exported frame SVG is a single `rect width=2880 height=1800 rx=40`). Content is clipped by that radius.
- Auth frames have **no outer padding other than 40 on all four sides**: `40 + 1400 + 1400 + 40 = 2880` and `40 + 1720 + 40 = 1800`.
- The two auth cards **touch each other** — there is **no gutter** between the left card and the form panel (left card ends at x = 1440, form panel starts at x = 1440).

### 1.2 Auth frames — layout model

Absolute, frame-relative (SVG coordinates, origin = frame top-left):

| Layer | x | y | w | h | Notes |
|---|---|---|---|---|---|
| Left Card (instance) | 40 | 40 | 1400 | 1720 | radius 40 |
| Form Div | 1440 | 40 | 1400 | 1720 | Create Account: radius **26**, fill none. Login + Error: radius **25**, fill `#E9E3D6` |
| Form | 1615 | 141.917 (Create) / 165.333 (Login, Error) | 1050 | 1516.833 (Create) / 1470 (Login, Error) | inside Form Div at x = 175 |

- `Form` is a **vertical auto-layout** frame inside a non-auto-layout `Form Div`; it is constrained centre/centre and hugs its height.
- Because `Form Div` is 1720 tall and the form hugs, the form is *almost* centred: `(1720 − 1516.833)/2 = 101.58` but the real offset is **101.917** (Create) and `(1720 − 1470)/2 = 125.0` but the real offset is **125.333**. The constant +0.333 difference is the form's `strokeWeight: 1.1667` counted in layout (`strokesIncludedInLayout: true`). Use the measured offsets, not computed centring.
- The Left Card is an **instance**, always at (40, 40). It bleeds decoratively but is clipped by its own radius.

### 1.3 Dashboard — layout model

| Layer | x | y | w | h |
|---|---|---|---|---|
| Frame 6 (sidebar) | 48 | 38 | 700 | 1720 |
| Frame 9 (header bar) | 793 | 48 | 2041 | 170 |
| Welcome banner | 798 | 265 | 2036 | 532 |
| Account details card | 798 | 844 | 1300 | 914 |
| Frame 18 (logout button) | 2400 | 1608 | 434 | 150 |

- Free-form absolute layout at frame level; the sidebar/header/banner do **not** participate in one grid. Note the **inconsistent left edges / widths** (`793/2041` header vs `798/2036` banner vs `798/1300` card, border-box) — see §11.
- Sidebar occupies 48 → 748; the right column starts at 793 → a 45 gap.

---

## 2. Design tokens

### 2.1 Colors (every distinct value found, with role and where used)

| Hex | Alpha | Role | Used in |
|---|---|---|---|
| `#E9E3D6` | 100% | Page / frame background; also the Login + Error form panel fill | all 4 frames; `Form Div` `27:285`, `33:71` |
| `#203D30` | 100% | Brand dark green: left-card surface, primary button, checkbox (checked), link text on cream, outline of cactus glyph, dashboard sidebar | Left Card bg, Main CTA, T&C checked box, "Log in"/"Create Account" links, "Terms & Conditions", sidebar `Frame 6` |
| `#18271F` | 100% | Primary heading / strong text on cream | all H1/H2s, account-details values, dashboard header title |
| `#6E786F` | 100% | Muted / secondary text, helper text, divider strokes, placeholder-label pairs | sub-headings, "Or sign in with", "Remember Me.", T&C prefix, sidebar labels are *not* this colour (see below), card caption, NAME/EMAIL labels |
| `#989D94` | 100% | Input placeholder text, social-button labels | all input placeholders, "Continue with…"/"Or sign in with…" buttons |
| `#DCD8CC` | 100% | Input / secondary-button border | all inputs and social buttons |
| `#FFFEFA` | 100% | Input fill, social button fill, unchecked checkbox fill, checkmark glyph | inputs, social buttons, `Check` rects, `25:81` |
| `#FFFFFF` | 100% | Primary button label; nav label on active item | "Create account"/"Sign In"; "Overview" `33:243` |
| `#FEF1C7` | 100% | Cream display text on the dark card (serif lines + wordmark) | "Building things", "that", "CATCUS" |
| `#FFCC00` | 90% | Script accent text ("Matter …") | `Brand headline 3` `2:115` |
| `#A5C957` | 100% | Lime brand mark tile; active-nav dot | `Cactus brand mark` `1:91`, `Rectangle 3` `33:264` |
| `#DBD2B6` | 100% | Main-logo card background (light warm) | `Main Logo` `1:74` inside Left Card |
| `#F9F0EB` | 100% | Main-logo card background (dashboard variant) | `Main Logo` `33:271` |
| `#AB0000` | 100% | Error text + error border + error glow | Login Error only: `33:119`, input borders, drop-shadow |
| `#426452` → `#2C513D` | 50% | Radial gradient of the blurred card ellipses (centre → edge, rotated 90°) | `Ellipse 1/2/3` in Left Card and dashboard sidebar |
| `#DCE6D1` | 100% | Welcome banner fill; avatar circle fill | `Welcome banner` `33:142`, `Frame 11` `33:292` |
| `#E6FAFB` | 80% (header) / 100% (logout) | Pale cyan surface: header bar, logout button | `Frame 9` `33:281` (80%), `Frame 18` `39:347` (100%) |
| `#FFF2CC` | 77% | Account-details card fill | `Account details card` `39:306` |
| `#AFC4B1` | 100% | Sidebar overline ("YOUR WORKSPACE") | `33:246` |
| `#D4E2D6` | 100% | Sidebar note text | `33:239` |
| `#315540` | 100% | Active nav item fill | `Overview selected` `33:241` |
| `#2F2F2F` | 100% | Avatar initials | `AM` `33:298` |
| `#393737` | 100% | Header user name + email | `39:303`, `39:304` |
| `#313131` | 100% | Logout label | `39:332` |
| `#1E1E1E` | 100% | Logout icon stroke | `Icon` `I39:340;7758:11840` |
| `#000000` | 100% | 1px outline on banner / header / avatar / account card / logout | `33:142`, `33:281`, `33:292`, `39:306`, `39:347` |
| `#000000` | 100% | Details divider (2px) | `39:318` |
| `#000000` | 25% | Grain/noise overlay on dashboard sidebar (and on "that" on the card) | NOISE effect, §2.6 |
| `#FFFFFF` | 25% | Second grain layer (duotone pair) on the Main Logo | NOISE effect, §2.6 |

Cactus illustration palette (inside `Main Logo` only — do not use elsewhere):

| Hex | Where |
|---|---|
| `#DBD2B6` | left-card logo card plate |
| `#F9F0EB` | dashboard logo card plate |
| `#5B982E` → `#3D7C24` | head gradient |
| `#8BB629` → `#79A91F` | face/front gradient |
| `#4B8829` | ear block |
| `#3C7624` | back-shading block |
| `#81AD20` | chin/leg block |
| `#275B22` | eye sockets |
| `#102B2A` | pixel eyes/mouth + "CATCUS" pixel lettering |
| `#FFFDF4` | eye highlights / teeth |
| `#C9472B` → `#B93C24` | pot rim gradient |
| `#E85E43` → `#ED6548` → `#E75D42` | pot body gradient (stops at 0 / 0.52 / 1) |

> The dashboard logo (`33:271`) is the **same artwork at 441 × 441** with the **same gradients and same hex values**; only the plate colour differs (`#F9F0EB`) and it has **no grain filter**.

### 2.2 Typography

**Families actually used** (from `fontFamily` / `fontPostScriptName`): `Manrope`, `DM Sans`, `Marcellus` (`Marcellus-Regular`), `Pinyon Script` (`PinyonScript-Regular`). All four are Google Fonts. **No other family appears anywhere in the file.** No italics, no letter-spacing (every node has `letterSpacing: 0`, `letterSpacingUnit` absent/0em). No text-case transforms in data — "YOUR WORKSPACE", "NAME", "EMAIL", "CATCUS" are literal uppercase strings.

**Auto line-height ratios** (measured on nodes where `lineHeightPx` was returned; every text node uses `lineHeightUnit: INTRINSIC_%`, `lineHeightPercent: 100`, i.e. "Auto"):

| Family | ratio (lh ÷ size) | verified on |
|---|---|---|
| Manrope | **1.366** | 70→95.62, 80→109.28, 50→68.30 |
| DM Sans | **1.302** | 30→39.06, 35→45.57, 50→65.10, 45→58.59 |
| Marcellus | **1.2539** | 120→150.46875 |
| Pinyon Script | **1.2476** | 250→311.88965 |

Derived line-heights (same arithmetic, for sizes whose `lineHeightPx` was not individually returned):

| Size | Manrope | DM Sans |
|---|---|---|
| 20 | 27.32 | — |
| 29.167 | — | 37.97 |
| 30 | 40.98 | 39.06 |
| 35 | 47.81 | 45.57 |
| 38 | 51.91 | — |
| 40 | 54.64 | 52.08 |
| 43.167 | — | 56.20 |
| 45 | — | 58.59 |
| 46.667 | — | 60.76 |
| 50 | 68.30 | 65.10 |
| 60 | 81.96 | — |
| 70 | 95.62 | — |
| 80 | 109.28 | — |
| 105 | 143.43 | — |

Marcellus 120 → **150.46875**. Pinyon Script 250 → **311.88965**.

**Font files needed:** Manrope 400 / 600 / 700; DM Sans 400 / 500 / 700; Marcellus 400; Pinyon Script 400. Weights verified against the node data: **Manrope 600 (SemiBold)** is used for every dashboard heading and label, **DM Sans 500 (Medium)** for the primary CTA labels and the 60px account values. Manrope 500 is not used.

#### Text-node inventory (every string, verbatim)

| # | Node | Content (exact) | Family | Size (CSS) | Weight | Color | Align |
|---|---|---|---|---|---|---|---|
| 1 | `25:72` | `Create your account` | Manrope | 105 (52.5) | 700 (`bold`) | `#18271F` | left |
| 2 | `25:71` run 1 | `Already have an account? ` (trailing space) | DM Sans | 46.667 (23.33) | 400 | `#6E786F` | left |
| 3 | `25:71` run 2 | `Log in` — underlined | DM Sans | 46.667 | 400 | `#203D30` | left |
| 4 | `25:68` | `First Name` | DM Sans | 43.167 (21.58) | 400 | `#989D94` | left |
| 5 | `25:70` | `Last Name` | DM Sans | 43.167 | 400 | `#989D94` | left |
| 6 | `25:65` | `Email` | DM Sans | 43.167 | 400 | `#989D94` | left |
| 7 | `25:63` | `Password` | DM Sans | 43.167 | 400 | `#989D94` | left |
| 8 | `25:77` run 1 | `I agree to: ` (trailing space) | DM Sans | 30 (15) | 400 | `#6E786F` | left |
| 9 | `25:77` run 2 | `Terms & Conditions` — underlined | DM Sans | 30 | 400 | `#203D30` | left |
| 10 | `25:61` | `Create account` | DM Sans | 46.667 | **500** (Medium) | `#FFFFFF` | centred in 1050 box |
| 11 | `25:57` | `Or sign in with` | DM Sans | 29.167 (14.58) | 400 | `#6E786F` | left |
| 12 | `25:53` | `Continue with Google` | DM Sans | 43.167 | 400 | `#989D94` | centred in 490 box (run 395 wide) |
| 13 | `25:55` | `Continue with GitHub` | DM Sans | 43.167 | 400 | `#989D94` | centred in 490 box (run 391 wide) |
| 14 | `27:309` | `Welcome Back` | Manrope | 105 | 700 (`bold`) | `#18271F` | left |
| 15 | `27:308` run 1 | `New to Catcus` | DM Sans | 46.667 | 400 | `#6E786F` | left |
| 16 | `27:308` run 2 | `? ` (question mark + space) | DM Sans | 46.667 | 400 | `#6E786F` | left |
| 17 | `27:308` run 3 | `Create Account` — underlined | DM Sans | 46.667 | 400 | `#203D30` | left |
| 18 | `30:70` | `Email address` (label) | DM Sans | 35 (17.5) | 400 | `#203D30` | left |
| 19 | `27:302` | `someone@example.com` | DM Sans | 43.167 | 400 | `#989D94` | left |
| 20 | `30:71` | `Password here` (label) | DM Sans | 35 | 400 | `#203D30` | left |
| 21 | `27:300` | `Password@12` | DM Sans | 43.167 | 400 | `#989D94` | left |
| 22 | `I27:298;25:77` | `Remember Me.` | DM Sans | 30 | 400 | `#6E786F` | left |
| 23 | `27:297` | `Sign In` | DM Sans | 46.667 | **500** (Medium) | `#FFFFFF` | centred |
| 24 | `27:289` | `Or sign in with Google` | DM Sans | 43.167 | 400 | `#989D94` | centred in 490 box |
| 25 | `27:291` | `Or sign in with GitHub` | DM Sans | 43.167 | 400 | `#989D94` | centred in 490 box |
| 26 | `33:119` | `Email and/or Password is wrong` | DM Sans | 40 (20) | 400 | `#AB0000` | left (right-aligned block, see §3.3) |
| 27 | `1:111` | `CATCUS` | Manrope | 80 (40) | 700 (`bold`) | `#FEF1C7` | left |
| 28 | `2:113` | `Building things` | Marcellus | 120 (60) | 400 | `#FEF1C7` | left |
| 29 | `2:116` | `that` | Marcellus | 120 | 400 | `#FEF1C7` + NOISE | left |
| 30 | `2:115` | `Matter ...` (three dots, spaces around) | Pinyon Script | 250 (125) | 400 | `#FFCC00` @ 90% | left |
| 31 | `33:246` | `YOUR WORKSPACE` | DM Sans | 50 (25) | 700 (`bold`) | `#AFC4B1` | left |
| 32 | `33:243` | `Overview` (nav) | DM Sans | 30 | 500 (`Medium`) | `#FFFFFF` | left |
| 33 | `33:239` | `A calm place to` + `\n` + `keep growing.` | Manrope | 50 | 400 | `#D4E2D6` | left |
| 34 | `33:145` | `Your space is ready.` | Manrope | 70 (35) | 600 (`SemiBold`) | `#18271F` | left |
| 35 | `33:146` | `Welcome to Cactus. This is your starting point — a simple space that is yours.` | DM Sans | 35 | 400 | `#6E786F` | left |
| 36 | `33:279` | `Overview` (page title) | Manrope | 60 (30) | **600** (SemiBold) | `#18271F` | left |
| 37 | `33:298` | `AM` | Manrope | 38 (19) | **600** (SemiBold) | `#2F2F2F` | left |
| 38 | `39:303` | `Andrew Martin` | Manrope | 30 (15) | **600** (SemiBold) | `#393737` | right |
| 39 | `39:304` | `andrewmartin@catcus.com` | Manrope | 20 (10) | **600** (SemiBold) | `#393737` | centre |
| 40 | `39:307` | `Account details` | Manrope | 70 | **600** (SemiBold) | `#18271F` | left |
| 41 | `39:308` | `The information associated with your account.` | DM Sans | 45 (22.5) | 400 | `#6E786F` | left |
| 42 | `39:310` | `NAME` | DM Sans | 50 | 700 (`bold`) | `#6E786F` | left |
| 43 | `39:311` | `Andrew Martin` | DM Sans | 60 (30) | **500** (Medium) | `#18271F` | left |
| 44 | `39:325` | `EMAIL` | DM Sans | 50 | 700 (`bold`) | `#6E786F` | left |
| 45 | `39:324` | `andrewmartin@catcus.com` | DM Sans | 60 | **500** (Medium) | `#18271F` | left |
| 46 | `39:332` | `Logout` | Manrope | 70 | **600** (SemiBold) | `#313131` | left |

Notes
- Run splits (2/3, 8/9, 15/16/17) come from Figma's `characterStyleOverrides` map and are visible in the SVG as separate `<text>` elements. The visual gap between the prefix and the underlined part is produced by explicit `x` positions, **not** by a space character alone (the prefix strings do include a trailing space).
- `Matter ...` really is three separate periods separated by spaces; it is not an ellipsis character. The em dash in the welcome description **is** `—` (U+2014).
- `New to Catcus` — "Catcus" is spelled that way in the design (and `andrewmartin@catcus.com` uses the same spelling). It is not a typo in this document.

### 2.3 Spacing

| Container | Layout | Gap / itemSpacing | Padding | Notes |
|---|---|---|---|---|
| `Form` (Create) | VERTICAL, fixed width 1050, hug height | **148** | 0 | 3 children: Main Heading → User Inputs → CTA and Buttons |
| `Form` (Login / Error) | VERTICAL, fixed 1050 × 1470 | **109** | 0 | same 3 children |
| `Main Heading` (both) | free-form group | — | 0 | H1 box then sub-heading block |
| `User Inputs` (Create) | free-form group | **72** between every row | 0 | name row → email → password → T&C (border-box gaps) |
| `Name Inputs` (Create) | HORIZONTAL `justify-between`, 2 × 490 boxes | **70** | 0 | 490 + 70 + 490 = 1050 |
| `User Inputs` (Login/Error) | free-form group | label→box **22**, between input groups **95** | 0 | block is **563.33** tall; Remember Me sits at its bottom (y 523.33) |
| `CTA and Buttons` (Create) | free-form group | CTA → divider **48**, divider → socials **48** | 0 | box-to-box gaps |
| `CTA and Buttons` (Login/Error) | free-form group | CTA → divider **85.33**, divider → socials **84.5** | 0 | box-to-box gaps; visual order CTA → divider → socials, same as Create |
| `Left Card` bg | free-form | — | — | absolute decoration, §4.1 |
| `Logo + Heading` | HORIZONTAL | **55** | 0 | vertical centring (`counterAxisAlignItems: CENTER`) |
| `Frame 5` (left card headline) | HORIZONTAL, fixed 1179 wide | **51** | 0 | bottom-aligned (`counterAxisAlignItems: MAX`) |
| `Frame 7` (sidebar) | VERTICAL | **30** | 0 | overline block + nav item |
| `Overview selected` | HORIZONTAL | **15** | 12 top, 12 bottom, 25 left, 25 right | `counterAxisAlignItems: CENTER` |
| `Welcome banner` | HORIZONTAL, fixed 2036 | **643** (`SPACE_BETWEEN`) | 43 / 51 / 43 / 51 | T,R,B,L order in Figma data is top 43, left 51, right 51, bottom 43 |
| `Welcome Description` | VERTICAL, fixed 663 | **50** | 0 | title + description |
| `T&C` component | HORIZONTAL | **35** | 0 | box → text |
| `Remember Me` instance | HORIZONTAL (inherited) | 35 | 0 | box → text |

Gaps, authoritative (border-box; CSS px in brackets):
- **Create `User Inputs`: 72** between every row (36). Name row `justify-between`: 490 + **70** + 490 = 1050.
- **Create `CTA and Buttons`: 48** CTA → divider, **48** divider → socials (24 each).
- **Login/Error `User Inputs`: label → box 22** (11); **95** between the email group and the password group (47.5). Block height 563.33, `Remember Me` at its bottom (y 523.33).
- **Login/Error `CTA and Buttons`: 85.33** CTA → divider, **84.5** divider → socials (42.67 / 42.25).
- Social-button labels are **centred** in the 490 box (the text node hugs its run: 395 / 391 wide); the ~47/49 px glyph start is the centring result, not a left padding.

### 2.4 Radii

| Element | Figma | CSS |
|---|---|---|
| Frame background | 40 | 20 |
| Left Card | 40 | 20 |
| Form Div | 26 (Create) / 25 (Login, Error) | 13 / 12.5 |
| Input & social button (**all**, border-box) | **11.667** | 5.83 |
| Primary CTA | 14 | 7 |
| Checkbox | 8 | 4 |
| Brand mark tile | 29.4117 (on 100 × 100) | 14.71 |
| Dashboard sidebar | 40 | 20 |
| Header bar / logout button | **22** | 11 |
| Welcome banner | **22** | 11 |
| Account details card | **40** | 20 |
| Active nav item | 30 | 15 |
| Nav dot | 8 | 4 |
| Avatar | 49.5 (circle on 99) | — |
| Logo plate (dashboard) | 40 (Frame 8) | 20 |

> Radii above are **border-box** values. The SVG export shows slightly smaller numbers on stroked shapes (e.g. inputs `rx 11.083`, banner `21.5`, card `39.5`) because the stroke is centred on the path; the Figma/Border-box value is the one to build.

### 2.5 Strokes / borders

| Element | Width | Color | Align | Notes |
|---|---|---|---|---|
| Input box | **1.16667** | `#DCD8CC` | inside | border-box 1050 × 116.667, radius 11.667 |
| Input box (Error) | 1.16667 | **`#AB0000`** *and* `#DCD8CC` | inside | two stacked stroke rects — red is painted on top of the grey, so the border is red |
| Social button | 1.16667 | `#DCD8CC` | inside | same geometry as inputs, radius 11.667 |
| Checkbox (unchecked) | 0 (no stroke) | — | — | flat `#FFFEFA` rect |
| Banner / header / card / avatar / logout | **1** | `#000000` | inside | hairline (0.5 CSS) |
| Auth divider lines | **1.16679** | `#6E786F` | centre | slanted, see §2.9 |
| Details divider | **2** | `#000000` | centre | slanted the other way, §3.4 |
| Logout icon | **4** | `#1E1E1E` | centre | `stroke-linecap: round`, `stroke-linejoin: round` |
| Component-set frame (editor only) | 1 | `#8A38F5`, dashed `10 5` | — | Figma's dashed selection outline around the `T&C` set (`25:74`), **not** a visual style. The `Frame 3` set has the same outline. Ignore when building. |

### 2.6 Effects (exact filter definitions)

1. **Progressive layer blur on the three decorative ellipses** (Left Card and dashboard sidebar):
   - Figma: `LAYER_BLUR`, `blurType: PROGRESSIVE`, `radius: 31.299999`, `startRadius: 9.800000`, `startOffset {0.5, 0}`, `endOffset {0.5, 1}`.
   - SVG: `feGaussianBlur stdDeviation="15.65"`. Filter region = ellipse box **inflated by 31.3 on every side** (550 circle → 612.6 region).
   - CSS: `filter: blur(15.65px)` at Figma scale → **`blur(7.83px)` at CSS scale**. A plain Gaussian is close; the "progressive" ramp (sharper at the top edge) is not expressible in plain CSS — use the SVG asset for exactness.
2. **Grain on the Main Logo** (`1:74` / `27:238`) — a two-part filter, fully vector, **not** a raster texture. Details in §6.2.
3. **Noise on `that`** (`2:116`): `feTurbulence fractalNoise baseFrequency="2 2" stitchTiles="stitch" numOctaves="3" seed="4958"` → `luminanceToAlpha` → discrete alpha split → `feFlood rgba(0,0,0,0.25)` composited `in`. Figma: `NOISE`, `density 1`, `noiseSize 0.5`, `MONOTONE`, black 25%.
4. **Noise on the dashboard sidebar** (`Frame 6` `33:238`): same construction, `seed="5500"`, `rgba(0,0,0,0.25)`, applied to the **whole 700 × 1720 sidebar** (it grains the wordmark, nav and note too).
5. **Error-state input glow** (`33:80`, `33:84`): `feOffset` 0/0 → `feGaussianBlur stdDeviation="4"` → composite out → colour matrix to `#AB0000` → blended **behind** the shape. Figma: drop shadow, **x 0, y 0, blur 8, spread 0, `#AB0000`** (SVG stdDeviation = Figma blur ÷ 2). Filter region inflated by 8 each side.
6. **No other effects exist** — no other shadows, no inner shadows, no background blur, no blend modes beyond NORMAL / PASS_THROUGH.

### 2.7 Opacity / blend

| Element | Opacity |
|---|---|
| Header bar fill `#E6FAFB` | 80% |
| Account details card fill `#FFF2CC` | 77% |
| `Matter ...` text | 90% |
| All decorative ellipses | 50% fill opacity (plus blur) |
| Everything else | 100%; all blend modes NORMAL / PASS_THROUGH |

### 2.8 Z-order that matters

- Auth frames: `Left Card` is painted **after** `Form Div` (they do not overlap, so no visual effect).
- Left Card internals: bg rect → Ellipse 2 → Ellipse 3 → Ellipse 1 → Frame 5 (`that` + `Matter ...`) → `Building things` → Main Logo → Logo + Heading. Ellipses are **behind** all type and art.
- Dashboard: sidebar → banner → header bar → account card → logout. The header bar overlaps the banner's top-right region and is drawn **on top**.
- Account card: email block is painted before the name block, but the name block sits higher (`y`), so painting order is invisible.
- Error inputs: the red-stroked rect is the last child, so red wins over grey; the drop shadow is applied to the whole `Email Box` / `Password Box` frame.

### 2.9 Rotations (slanted divider lines)

The "Or sign in with" rules are **not horizontal**. Both segments are `LINE` nodes whose endpoints differ in `y`:

| Frame | Segment | x1,y1 | x2,y2 | Δy | angle |
|---|---|---|---|---|---|
| Create | Line 2 (left) | 0.006, 1326.06 | 347.711, 1329.56 | +3.5 over 347.705 | **+0.577°** (down to the right) |
| Create | Line 1 (right) | 702.417, 1329.56 | 1050.12, 1333.06 | +3.5 over 347.703 | **+0.577°** |
| Login | Line 2 | 0.006, 1242.58 | 347.673, 1246.08 | +3.5 | **+0.577°** |
| Login | Line 1 | 702.339, 1246.08 | 1050.01, 1249.58 | +3.5 | **+0.577°** |
| Error | Line 2 | 0.006, 1242.58 | 347.673, 1246.08 | +3.5 | **+0.577°** |
| Error | Line 1 | 702.339, 1246.08 | 1050.01, 1249.58 | +3.5 | **+0.577°** |

The halves are collinear: the left segment ends exactly where the right one starts (`y = 1329.56` / `1246.08`), so the pair is one continuous 1050-wide rule rotated ~0.577°, interrupted by the label. The label baseline (1342.76 create / 1259.28 login) sits **below** the rule (line y at the label x ≈ 1330 vs baseline 1342.8).

`Details Divider` on the dashboard is the opposite: **(858, 1112) → (1969, 1108)** — **−0.207°** (up to the right), 2px black.

---

## 3. Frame-by-frame layer spec

All coordinates are **relative to the frame** (origin = frame top-left) unless marked *parent-relative*. Height/width values are the drawn geometry from the vector export; where Figma's box differs by the stroke offset (0.583) the box value is noted. **Gaps, radii and dashboard box sizes from the 2026-11-15 errata are border-box and authoritative.**

### 3.1 Desktop - Create Account (`25:47`, 2880 × 1800)

**Section map:** `Left Card` (instance of `3:126`) · `Form Div` → `Form` → **Main Heading** (H1 + sub-link) → **User Inputs** (Name row / Email / Password / T&C) → **CTA and Buttons** (Primary CTA → "Or sign in with" divider → Google + GitHub)

#### Left Card instance — `27:266`
- Type: INSTANCE · main component **`3:126` "Property 1=Default"**, variant property `Property 1 = Default`
- Position (40, 40), size 1400 × 1720, radius 40, fill `#203D30`
- Overrides recorded by Figma: `effects`, `fills`, `name` — resolved values equal the component's own (`#203D30`, no effects), so it renders identically. Full internal spec in §4.1 with the +40/+40 offset applied.

#### Form Div — `25:49`
- Type: FRAME · (1440, 40) · 1400 × 1720 · radius **26** · **no fill** · clips content
- Auto-layout: none (free-form). Child `Form` is constrained CENTER/CENTER.
- Only child: `Form`.

#### Form — `25:50`
- Type: FRAME · (1615, 141.917) · 1050 × 1516.833 · no fill · radius 0
- **Auto-layout: VERTICAL**, `itemSpacing 148`, `counterAxisSizingMode FIXED`, `layoutSizingHorizontal FIXED`, `layoutSizingVertical HUG`, `strokeWeight 1.1667` counted in layout
- Container-local coordinates below (subtract 1615 / 141.917 for frame coords).

##### Main Heading — `30:77` (group, 1050 × ~247.6)
| Layer | Node | Type | x | y | w | h | Style |
|---|---|---|---|---|---|---|---|
| `Main Heading_2` | `25:72` | TEXT | 0 | 0 | 1050 (fill) | 143.43 auto | Manrope 105 bold, `#18271F`, baseline y = **111.715**, left |
| `Login Option` | `25:71` | FRAME/group | 0 | ~186.7 | 1050 | ~60.76 | contains the two runs below |
| ↳ text run | — | TEXT | 0 | — | auto | — | `Already have an account? ` DM Sans 46.667 `#6E786F`, baseline **232.434** |
| ↳ link run | — | TEXT | **514.427** | — | auto | — | `Log in`, DM Sans 46.667, `#203D30`, **underlined**, baseline 232.434 |

Horizontal composition is explicit: the link starts at x 514.427 (frame 2129.43) because the prefix is a fixed-width text node, not a flex gap.

##### User Inputs — `30:75` (group, 1050 × ~605.5; **row gap 72**)
| Layer | Node | Type | x | y | w | h | Fill / stroke / radius |
|---|---|---|---|---|---|---|---|
| `Name Inputs` | `25:66` | FRAME (H, `justify-between`) | 0 | 395.627 | 1050 | 116.667 | 490 + 70 + 490 |
| ↳ `First name input` | `25:67` | FRAME | 0 | 0 | 490 | 116.667 | `#FFFEFA` · stroke `#DCD8CC` 1.16667 · r 11.667 |
| ↳↳ `Placeholder` | `25:68` | TEXT | 30.003 | — | auto | 56.2 | `First Name` DM Sans 43.167 `#989D94`, baseline **72.14** (frame 467.767) |
| ↳ `Last Name Input` | `25:69` | FRAME | 560 | 0 | 490 | 116.667 | same as above |
| ↳↳ `Placeholder_2` | `25:70` | TEXT | 590.065 (30 in box) | — | auto | — | `Last Name`, baseline 467.767 |
| `Email Input` | `25:64` | FRAME | 0 | 584.314 | 1050 | 116.667 | `#FFFEFA` · `#DCD8CC` 1.16667 · r 11.667 |
| ↳ `Placeholder_3` | `25:65` | TEXT | 30.003 | — | auto | — | `Email` `#989D94`, baseline **657.121** |
| `Password Input` | `25:62` | FRAME | 0 | 773.001 | 1050 | 116.667 | same geometry as email |
| ↳ `Placeholder_4` | `25:63` | TEXT | 30.003 | — | auto | — | `Password` `#989D94`, baseline **845.475** |
| `T&C` | `25:73` | INSTANCE of `25:75` (T&C Default) | 0 | 961.106 | 476 | 40 | see §4.2; text **not** overridden |
| ↳ `Check` | `I25:73;25:76` | RECTANGLE | 0 | 0 | 40 | 40 | `#FFFEFA`, r 8, no stroke |
| ↳ `T&C` text | `I25:73;25:77` | TEXT | 75 | 0 | 401 | 39 | `I agree to: ` `#6E786F` + `Terms & Conditions` `#203D30` underlined, DM Sans 30, baseline **29.73** |

Spacing inside this block (border-box): **every vertical gap is 72** (name row → email → password → T&C). The name row is `justify-between` across the 1050 width with two 490 boxes (**gap 70**). The `T&C` instance is 40 tall.

##### CTA and Buttons — `30:76` (group, 1050 × ~367.8)
| Layer | Node | Type | x | y | w | h | Style |
|---|---|---|---|---|---|---|---|
| `Main CTA` | `25:60` | FRAME | 0 | 1149.13 | 1050.12 | 116.679 | r 14 `#203D30` |
| ↳ `Button label` | `25:61` | TEXT | centred (run starts 370.433) | — | auto | 60.76 | `Create account`, DM Sans 46.667 **Medium 500**, `#FFFFFF`, baseline **74.41** in box (frame 1223.54) |
| `Options` | `25:56` | FRAME | 0 | ~1316 | 1050 | ~60 | divider block |
| ↳ `Or sign in with` | `25:57` | TEXT | 433.048 | — | auto | 37.97 | DM Sans 29.167 `#6E786F`, baseline **1342.76** |
| ↳ `Line 1` | `25:58` | LINE | 702.417 → 1050.12 | 1329.56 → 1333.06 | — | — | stroke `#6E786F` 1.16679 |
| ↳ `Line 2` | `25:59` | LINE | 0.006 → 347.711 | 1326.06 → 1329.56 | — | — | stroke `#6E786F` 1.16679 |
| `Optional CTAs` | `25:51` | FRAME (H, gap 70) | 0 | 1400.9 | 1050 | 116.667 | two 490 buttons |
| ↳ `Google Sign-in` | `25:52` | FRAME | 0 | 0 | 490 | 116.667 | `#FFFEFA`, `#DCD8CC` 1.16667, r 11.667 |
| ↳↳ `Placeholder_5` | `25:53` | TEXT | centred (run 395 wide, starts 47) | — | 395 | 56.2 | `Continue with Google` `#989D94`, baseline 72.14 |
| ↳ `GitHub Sign-in` | `25:54` | FRAME | 560 | 0 | 490 | 116.667 | same |
| ↳↳ `Placeholder_6` | `25:55` | TEXT | centred (run 391 wide, starts 609.067) | — | 391 | — | `Continue with GitHub` `#989D94` |

Box gaps in this group: **CTA → divider 48**, **divider → socials 48**.

The social labels are **centred** in their 490 box — the runs are 395 / 391 wide, so the glyphs begin ~47/49 px in. Do not implement that as a left padding.

Bug to know: the Google/GitHub buttons contain **no icon nodes at all** — the "icon" is purely the word "Continue with …". Do not invent Google/GitHub logos.

### 3.2 Desktop - Login (`27:284`, 2880 × 1800)

**Section map:** identical skeleton to Create Account — Left Card + Form Div → Form → Main Heading → User Inputs → CTA and Buttons.

#### Left Card instance — `27:310`
- INSTANCE · main component **`3:126`**, `Property 1 = Default` · (40, 40) · 1400 × 1720 · radius 40 · `#203D30`
- Overrides: `name` only (no visual overrides).

#### Form Div — `27:285`
- FRAME · (1440, 40) · 1400 × 1720 · radius **25** · fill **`#E9E3D6`** · clips content
- (Differs from Create Account's Form Div: radius 26 and no fill there.)

#### Form — `27:286`
- FRAME · (1615, **165.333**) · 1050 × **1470** · **VERTICAL auto-layout, itemSpacing 109**
- Same three sections, but section-local geometry differs:

##### Main Heading — `30:80`
| Layer | Node | x | y (baseline) | Style |
|---|---|---|---|---|
| `Main Heading_2` | `27:309` | 0 | **111.715** | `Welcome Back`, Manrope 105 bold `#18271F` |
| `Login Option` | `27:308` | 0 | **232.413** | group |
| ↳ run | — | 0 | 232.413 | `New to Catcus`, DM Sans 46.667 `#6E786F` |
| ↳ run | — | **283.327** | 232.413 | `? `, DM Sans 46.667 `#6E786F` |
| ↳ link | — | **316.413** | 232.413 | `Create Account`, DM Sans 46.667 `#203D30` underlined |

##### User Inputs — `30:81` → inner `User Inputs_2` — `30:74`
| Layer | Node | x | y | w | h | Style |
|---|---|---|---|---|---|---|
| `Email Input` | `30:72` | 0 | — | 1050 | 184.24 | label + box (45.57 label + 22 gap + 116.667 box) |
| ↳ label `Placeholder` | `30:70` | 0 | baseline **390.935** | auto | 45.57 | `Email address` DM Sans 35 `#203D30` |
| ↳ `Email Box` | `27:301` | 0.583 | **424.583** | 1050 | 116.667 | `#FFFEFA`, `#DCD8CC` 1.16667, r 11.667 |
| ↳↳ `Placeholder_2` | `27:302` | 30 | baseline **497.387** | auto | 56.2 | `someone@example.com` `#989D94` |
| `Password Input` | `30:73` | 0 | — | 1050 | 184.24 | label + box |
| ↳ label `Placeholder_3` | `30:71` | 0 | baseline **670.602** | auto | 45.57 | `Password here` DM Sans 35 `#203D30` |
| ↳ `Password Box` | `27:299` | 0.583 | **704.25** | 1050 | 116.667 | same as email box |
| ↳↳ `Placeholder_4` | `27:300` | 30 | baseline **776.72** | auto | 56.2 | `Password@12` `#989D94` |
| `Remember Me` | `27:298` | 0 | **879.333** (= 523.33 inside the 563.33 block) | 476 | 40 | INSTANCE of T&C `25:75` (Default) — label text overridden |
| ↳ `Check` | `I27:298;25:76` | 0 | 0 | 40 | 40 | `#FFFEFA`, r 8 |
| ↳ `T&C` | `I27:298;25:77` | 75 | baseline **29.73** | 401 | 39 | `Remember Me.` DM Sans 30 `#6E786F`, **no underline** |

Login uses **labels above the fields** (35px, `#203D30`) and the box only holds a placeholder; the Create Account form has **no labels** — only placeholders. That is the single biggest structural difference between the two forms.
Label→box gap is **22** (border-box). (The 33.648 figure — box top minus label baseline — is a baseline measurement, not the gap.) The two input groups are separated by **95**; `User Inputs` is a **563.33**-tall block with `Remember Me` at its bottom (y 523.33). Divider spacing: **CTA → divider 85.33**, **divider → socials 84.5**. The rendered order is CTA → divider → socials, the same as Create Account.

##### CTA and Buttons — `30:82`
Layer order inside this group is **different from Create Account**: `Optional CTAs`, then `Options`, then `Main CTA` (create: `Main CTA`, `Options`, `Optional CTAs`). Painting order only.

| Layer | Node | x | y | w | h | Style |
|---|---|---|---|---|---|---|
| `Main CTA` | `27:296` | **2** | 1028.33 | 1050 | 116.667 | r 14 `#203D30` — **x = 2**, see §11 |
| ↳ label | `27:297` | 462.218 in box | baseline 74.42 in box (frame 1102.75) | auto | 60.76 | `Sign In`, DM Sans 46.667 `#FFFFFF` |
| `Options` | `27:292` | 0 | — | 1050 | 60 | divider |
| ↳ `Or sign in with` | `27:293` | 433 | baseline **1259.28** | auto | 37.97 | DM Sans 29.167 `#6E786F` |
| ↳ `Line 1` | `27:294` | 702.339 → 1050.01 | 1246.08 → 1249.58 | — | — | `#6E786F` 1.16667 |
| ↳ `Line 2` | `27:295` | 0.006 → 347.673 | 1242.58 → 1246.08 | — | — | `#6E786F` 1.16667 |
| `Optional CTAs` | `27:287` | 0 | 1353.92 | 1050 | 116.667 | two buttons |
| ↳ `Google Sign-in` | `27:288` | 0.583 | 0 | 490 | 116.667 | `#FFFEFA` / `#DCD8CC` / r 11.667 |
| ↳↳ label | `27:289` | centred (run starts 47) | baseline 72.13 | auto | — | `Or sign in with Google` `#989D94` |
| ↳ `GitHub Sign-in` | `27:290` | 560.583 | 0 | 490 | 116.667 | same |
| ↳↳ label | `27:291` | centred (run starts 609) | baseline 72.13 | auto | — | `Or sign in with GitHub` `#989D94` |

### 3.3 Desktop - Login Error State (`33:70`, 2880 × 1800)

**Section map:** Login, plus an inline error message and error styling on both input boxes.

#### Left Card instance — `33:99`
- INSTANCE of `3:126` (`Default`) · (40, 40) · 1400 × 1720 · radius 40 · `#203D30` · overrides: `name`.

#### Form Div — `33:71`
- FRAME · (1440, 40) · 1400 × 1720 · radius **25** · fill `#E9E3D6` · clips content

#### Form — `33:72`
- FRAME · (1615, 165.333) · 1050 × 1470 · VERTICAL, `itemSpacing 109`

#### Diff vs Login (complete list of every difference)

1. **Error message added** — `33:119` `Email and/or Password is wrong`
   - TEXT · x **534**, baseline **907.307** (form-local), DM Sans **40**, `#AB0000`, no underline, left-aligned box.
   - Sits on the same row as `Remember Me` (baseline 909.063), to its right — in the render it reads as right-aligned against the form's right edge (534 + text width ≈ 1050).
   - It is the **first child of `User Inputs` (`33:76`)**, before `User Inputs_2`, so it is painted under the field group but does not overlap it.
2. **Email Box gains** (`33:80`):
   - an extra outer fill rect **1050 × 116.667 at (0, 424), radius 11.6667** `#FFFEFA` (Login's box is the 1048.83 rect at 0.583 with r 11.667 — so the error box is 0.583 wider on each side and 0.583 squarer),
   - a **second stroke rect** `#AB0000`, 1.16667, radius 11.083, at (0.583, 424.583) — painted **after** the `#DCD8CC` stroke, so the border is red,
   - a **drop-shadow** glow: offset 0,0 · blur 8 · spread 0 · `#AB0000` (§2.6.5).
3. **Password Box gains** the same three things (`33:84`), at (0, 703.667) → stroke rect at (0.583, 704.25).
4. **Nothing else changes.** Every other node id, string, position, colour and gap is byte-identical to Login, including the CTA at `x = 2`, both divider lines, all social buttons and the Left Card.
5. Cosmetic/export note: the standalone SVG of node `33:72` is **1066 × 1470** and every child is offset by **+8 px in x**, because the export region includes the 8px shadow bleed on both sides. In the *frame* export the coordinates are the true ones (starting at 1615). Do not carry the +8 into the build.

| Layer | Node | x | y | w | h | Style |
|---|---|---|---|---|---|---|
| `Email and/or Password is wrong` | `33:119` | 534 | baseline 907.307 | auto (~516) | 52.08 | DM Sans 40 `#AB0000` |
| `Email Box` | `33:80` | 0 | 424 | 1050 | 116.667 | `#FFFEFA` r 11.6667 + red stroke + red glow |
| `Password Box` | `33:84` | 0 | 703.667 | 1050 | 116.667 | same |

### 3.4 Desktop - Dashboard (`33:186`, 2880 × 1800)

**Section map:** `Frame 6` (sidebar: brand lock-up → workspace nav → note) · `Frame 9` (header: title → avatar → user) · `Welcome banner` (title/description → logo plate) · `Account details card` (heading/caption → divider → name → email) · `Frame 18` (logout)

#### Frame 6 — sidebar (`33:238`)
- FRAME · (48, 38) · 700 × 1720 · radius 40 · fill `#203D30` · **NOISE effect** (black 25%, `noiseSize 0.5`, MONOTONE, seed 5500) · clips content · auto-layout: **none** (absolute children)

| Layer | Node | Type | x | y | w | h | Style |
|---|---|---|---|---|---|---|---|
| `Ellipse 1` | `33:236` | ELLIPSE | 190 | 762 | 820 | 820 | cx 600, cy 1172, r 410 · radial `#426452`→`#2C513D` rotated 90° · 50% · progressive blur 31.3 (stdDev 15.65) |
| `Logo + Heading` | `33:255` | FRAME (H, gap 55) | 118 | 100 | 491 | 109 | `counterAxisAlignItems CENTER` |
| ↳ `Cactus brand mark` | `33:256` | FRAME | 118 | 104.5 | 100 | 100 | rect r **29.4117** `#A5C957` |
| ↳↳ `Cactus stem` | `33:257` | VECTOR | 156.235 | 146.853 | 23.53 | 58.82 | `#203D30` (rounded stem, 12px radius corners) |
| ↳↳ `Cactus left arm` | `33:258` | VECTOR | 135.647 | 158.618 | 29.41 | 14.71 | `#203D30` |
| ↳↳ `Cactus left rise` | `33:259` | VECTOR | 135.647 | 146.853 | 14.71 | 26.47 | `#203D30` |
| ↳↳ `Cactus right arm` | `33:260` | VECTOR | 173.883 | 167.441 | 26.47 | 14.71 | `#203D30` |
| ↳↳ `Cactus right rise` | `33:261` | VECTOR | 185.647 | 152.735 | 14.71 | 29.41 | `#203D30` |
| ↳ `Wordmark` | `33:262` | TEXT | 273 | 100 | 336 | 109 | `CATCUS` Manrope 80 bold `#FEF1C7`, baseline **195.14** |
| `Frame 7` | `33:265` | FRAME (V, gap 30) | 118 | 369 | 559 | 195 | |
| ↳ `Sidebar overline` | `33:246` | TEXT | 118 | 369 | 559 | 65 | `YOUR WORKSPACE` DM Sans 50 bold `#AFC4B1`, baseline **418.55** |
| ↳ `Overview selected` | `33:241` | FRAME (H, gap 15, pad 12/25) | 118 | 464 | 559 | 100 | rect r 30 `#315540`, `counterAxisAlignItems CENTER` |
| ↳↳ `Rectangle 3` | `33:264` | RECTANGLE | 143 | 499 | 30 | 30 | r 8 `#A5C957` |
| ↳↳ `Overview label` | `33:243` | TEXT | 188 | 494 | 128 | 39 | `Overview` DM Sans 30 Medium `#FFFFFF`, baseline **524.23** |
| `Sidebar note` | `33:239` | TEXT | 118 | 1529 | 345 | 136 | `A calm place to`⏎`keep growing.` Manrope 50 `#D4E2D6`, baselines **1582.15** / **1650.15** |

The sidebar has **one** nav item ("Overview") — it is the active state (`#315540` pill + lime dot + white label). No other nav items, no icons besides the dot, no footer links.

#### Frame 9 — header bar (`33:281`)
- FRAME · (793, 48) · 2041 × 170 · radius 22 · fill `#E6FAFB` **at 80%** · stroke `#000000` 1 inside (all dashboard boxes below are **border-box** sizes) · auto-layout: **UNKNOWN** (§10) — children are placed absolutely per the coordinates below.

| Layer | Node | Type | x | y | w | h | Style |
|---|---|---|---|---|---|---|---|
| `Header title` | `33:279` | TEXT | 857 | 62.5 (box) | auto | 81.96 | `Overview` Manrope 60 `#18271F`, baseline **155.98** |
| `Frame 11` (avatar) | `33:292` | FRAME | 2377.5 | 83.5 | 99 | 99 | circle fill `#DCE6D1`, stroke `#000000` 1 |
| ↳ `AM` | `33:298` | TEXT | 2398.33 | — | auto | 51.91 | Manrope 38 `#2F2F2F`, baseline **147.554** |
| `Frame 12` (user block) | `39:305` | FRAME | 2517.39 (border-box ~2569.5) | 83.5 | **264** | 99 | name **text-right**, email **text-center** |
| ↳ `Andrew Martin` | `39:303` | TEXT | 2573.14 | — | auto | 40.98 | Manrope 30 `#393737`, baseline **124.99** |
| ↳ `andrewmartin@catcus.com` | `39:304` | TEXT | 2517.39 | — | auto | 27.32 | Manrope 20 `#393737`, baseline **161.16** |

The user block is **264 wide** with the **name right-aligned** and the **email centred** (per the verified pass). That is why their measured x positions differ: name starts at 2573.14, email at 2517.39 — the alignment, not an indent, produces those numbers.

#### Welcome banner (`33:142`)
- FRAME · (798, 265) · 2036 × 532 · radius 22 · fill `#DCE6D1` · stroke `#000000` 1 inside · **HORIZONTAL auto-layout**, `itemSpacing 643`, `primaryAxisAlignItems SPACE_BETWEEN`, padding **43 top / 43 bottom / 51 left / 51 right** · clips content

| Layer | Node | x | y | w | h | Style |
|---|---|---|---|---|---|---|
| `Welcome Description` | `33:267` | 850 | 309 | 663 | 156 | VERTICAL, gap **50**, clips content |
| ↳ `Welcome title` | `33:145` | 850 | 309 | 663 | 56 | `Your space is ready.` Manrope 70 SemiBold `#18271F`, baseline **383.81** |
| ↳ `Welcome description` | `33:146` | 850 | 415 | 663 | 50 | `Welcome to Cactus. This is your starting`⏎`point — a simple space that is yours.` DM Sans 35 `#6E786F`, baselines **449.935** / **495.935** — **clipped to one visible line** (§7) |
| `Frame 8` | `33:278` | 2338 | 309 | 444 | 444 | radius 40, no fill |
| ↳ `Main Logo` | `33:271` | 2338 | 309 | 441 | 441 | VECTOR, plate `#F9F0EB`, 17 paths, **no filter** |

#### Account details card (`39:306`)
- FRAME · (798, 844) · 1300 × 914 · radius 40 · fill `#FFF2CC` **at 77%** · stroke `#000000` 1 inside · auto-layout **UNKNOWN**

| Layer | Node | Type | x | y | w | h | Style |
|---|---|---|---|---|---|---|---|
| `Account Details` | `39:327` | FRAME/group | 858 | ~904 | ~1111 | ~150 | heading + caption |
| ↳ `Account details heading` | `39:307` | TEXT | 858 | — | auto | 95.62 | `Account details` Manrope 70 `#18271F`, baseline **975.81** |
| ↳ `Account details caption` | `39:308` | TEXT | 858 | — | auto | 58.59 | `The information associated with your account.` DM Sans 45 `#6E786F`, baseline **1049.85** |
| `Details Divider` | `39:318` | LINE | 858 → 1969 | 1112 → 1108 | — | — | stroke `#000000` **2**, −0.207° |
| `Frame 16` | `39:326` | FRAME | 858 | ~1233 | 1111 | ~370 | contains both label/value pairs |
| ↳ `Frame 15` (email pair) | `39:323` | FRAME | 858 | ~1419 | ~? | ~150 | painted first |
| ↳↳ `Email Label` | `39:325` | TEXT | 858 | — | auto | 65.10 | `EMAIL` DM Sans 50 bold `#6E786F`, baseline **1474.55** |
| ↳↳ `Name value` *(actually the email)* | `39:324` | TEXT | 858 | — | auto | 78.12 | `andrewmartin@catcus.com` DM Sans 60 `#18271F`, baseline **1541.46** |
| ↳ `Frame 14` (name pair) | `39:316` | FRAME | 858 | ~1230 | ~? | ~150 | |
| ↳↳ `Name label` | `39:310` | TEXT | 858 | — | auto | 65.10 | `NAME` DM Sans 50 bold `#6E786F`, baseline **1285.55** |
| ↳↳ `Name value_2` | `39:311` | TEXT | 858 | — | auto | 78.12 | `Andrew Martin` DM Sans 60 `#18271F`, baseline **1352.46** |

Vertical rhythm inside the card (border-box top 844, bottom 1758): heading baseline 975.81 (131.81 from the top) → caption baseline 1049.85 → divider 1112/1108 → NAME baseline 1285.55 → value 1352.46 → EMAIL baseline 1474.55 → value 1541.46.
The divider stops at x 1969 (1111 long) while the card is 1300 wide — it does **not** span the full card and is inset 60 from the card's left edge (798).

#### Frame 18 — logout (`39:347`)
- FRAME · (2400, 1608) · 434 × 150 · radius 22 · fill `#E6FAFB` (100%) · stroke `#000000` 1 inside · auto-layout **UNKNOWN**

| Layer | Node | Type | x | y | w | h | Style |
|---|---|---|---|---|---|---|---|
| `Logout` | `39:332` | TEXT | 2548 | — | ~285.5 (to 2833.5) | 95.62 | `Logout` Manrope 70 `#313131`, baseline **1708.81** |
| `Log out` | `39:340` | INSTANCE of `39:338` (remote "Log out") | 2465.5 | 1659.5 | 45 | 45 | 1 path `Icon` (`I39:340;7758:11840`), stroke `#1E1E1E` **4**, round caps/joins |

Icon geometry (45 × 45): door bracket from (2465.5,1699.5) up to (2470.5,1664.5) → arrow shaft (2480.5,1682)–(2510.5,1682) → chevron (2498,1669.5)–(2510.5,1682)–(2498,1694.5).

---

## 4. Components

### 4.1 Left Card — component set `3:127` ("Frame 3"), 2036 × 5520

Variants (all 1400 × 1720, `Property 1`):

| Variant | Node | Property value | Used by |
|---|---|---|---|
| Default | `3:126` | `Property 1=Default` | **all three auth frames** (`27:266` Create, `27:310` Login, `33:99` Error) |
| Variant2 | `27:192` | `Property 1=Variant2` | nothing (unused) |
| Variant3 | `27:230` | `Property 1=Variant3` | nothing (unused) |

**Variant diff:** the three variants are **pixel-identical except for the three decorative ellipses** (positions only — same radii, gradients, opacity and blur). Type, logo, wordmark, colours and all layer order are identical. Verified by diffing the SVG exports (162 differing lines, all of them element ids plus the three circle transforms) and confirmed by rendering all three.

| Ellipse | Default (x,y,w,h) | Variant2 | Variant3 |
|---|---|---|---|
| `Ellipse 2` r 275 (circle 550) | 556, 1033 | 396, 1059 | 700, 1153 |
| `Ellipse 3` r 150 (circle 300) | 57, 229 | 55, 166 | 30, 560 |
| `Ellipse 1` r 410 (circle 820) | 759, 119 | 620, 100 | 485, 166 |

Component layout (component-local coordinates; **add +40, +40 for the auth frames**):

| Layer | Node | Type | x | y | w | h | Style |
|---|---|---|---|---|---|---|---|
| background | — | RECT | 0 | 0 | 1400 | 1720 | `#203D30`, r 40 (clips content) |
| `Ellipse 2` | `1:73` | ELLIPSE | 556 | 1033 | 550 | 550 | radial `#426452`→`#2C513D` rot 90°, 50%, progressive blur 31.3 |
| `Ellipse 3` | `3:125` | ELLIPSE | 57 | 229 | 300 | 300 | same |
| `Ellipse 1` | `1:71` | ELLIPSE | 759 | 119 | 820 | 820 | same |
| `Frame 5` | `27:185` | FRAME (H, gap **51**, 1179 wide, bottom-aligned) | 180 | 1367 | 1179 | 242 | |
| ↳ `Brand headline 2` | `2:116` | TEXT | 180 | (box 1458) | 223 | 150 | `that` Marcellus 120 `#FEF1C7` + **NOISE** (black 25%), baseline **1575.66** |
| ↳ `Brand headline 3` | `2:115` | TEXT | 454 | 1367 | 933 | 242 | `Matter ...` Pinyon Script 250, `#FFCC00` **90%**, baseline **1582.88** |
| `Brand headline 1` | `2:113` | TEXT | 180 | 1228 | 794 | 150 | `Building things` Marcellus 120 `#FEF1C7`, baseline **1344.66** |
| `Main Logo` | `1:74` | VECTOR | 180 | 303 | 850 | 850 | plate `#DBD2B6` + 17 shapes, **grain filter** (§6.2); filter bbox 854 at (178, 301) |
| `Logo + Heading` | `27:168` | FRAME (H, gap **55**, CENTER) | 180 | 100 | 491 | 109 | |
| ↳ `Cactus brand mark` | `1:91` | FRAME | 180 | 104.5 | 100 | 100 | `#A5C957`, r 29.4117 |
| ↳↳ `Cactus stem` | `1:105` | VECTOR | 218.235 | 146.853 | 23.53 | 58.82 | `#203D30` |
| ↳↳ `Cactus left arm` | `1:106` | VECTOR | 197.647 | 158.618 | 29.41 | 14.71 | `#203D30` |
| ↳↳ `Cactus left rise` | `1:107` | VECTOR | 197.647 | 146.853 | 14.71 | 26.47 | `#203D30` |
| ↳↳ `Cactus right arm` | `1:108` | VECTOR | 235.882 | 167.441 | 26.47 | 14.71 | `#203D30` |
| ↳↳ `Cactus right rise` | `1:109` | VECTOR | 247.647 | 152.735 | 14.71 | 29.41 | `#203D30` |
| ↳ `Wordmark` | `1:111` | TEXT | 335 | 100 | 336 | 109 | `CATCUS` Manrope 80 bold `#FEF1C7`, baseline **185.14** |

Alignment facts: the wordmark baseline (185.14) sits 80.64 below the mark's top (104.5) — the 100px mark and the 109px wordmark box are centre-aligned, so the wordmark appears optically low. `Frame 5` bottom-aligns `Matter ...` with `that`, which is why the 250px script sits with its baseline 7.2px lower than the 120px serif.

### 4.2 T&C — component set `25:74`, 516 × 140

| Variant | Node | Property value | Meaning (from render) |
|---|---|---|---|
| Default | `25:75` | `Property 1=Default` | **unchecked** — empty `#FFFEFA` box |
| Variant2 | `25:78` | `Property 1=Variant2` | **checked** — `#203D30` box with white checkmark |

Set frame: 516 × 140 with a 1px `#8A38F5` **dashed** outline (editor decoration only). Each variant is **476 × 40**, HORIZONTAL auto-layout, gap **35**.

| Layer | Node (Default / Variant2) | Box | Style |
|---|---|---|---|
| `Check` | `25:76` / `25:80` | 40 × 40 at (0,0) | Default: `#FFFEFA`, r 8, no stroke. Checked: `#203D30`, r 8 |
| checkmark | — / `25:81` (named `🔹 Icon Color`) | 18.6167 × 13.9722 at (11, 12) in the checked box | VECTOR, `#FFFEFA`, even-odd path (a tick) |
| wrapper | — / `Frame 4` (`25:79`) | 40 × 40 | fixed size frame around the checked box (absent in Default) |
| text | `25:77` / `25:82` | 401 × 39 at x 75 | `I agree to: ` DM Sans 30 `#6E786F` + `Terms & Conditions` DM Sans 30 `#203D30` underlined; baseline 29.73 |

Text style runs: `characterStyleOverrides` marks characters **12…29** (i.e. the `Terms & Conditions` run) with underline + `#203D30`; characters 0…11 are `#6E786F` regular.

Prototype interactions (they exist in the file, worth knowing):
- `ON_CLICK` on the Default box → `CHANGE_TO` `25:78`, **DISSOLVE**, **200 ms**, `EASE_OUT`.
- `ON_CLICK` on the whole Default variant → `CHANGE_TO` `25:78`, **300 ms**, `EASE_OUT`.
- `ON_CLICK` on the checked wrapper → `CHANGE_TO` `25:75`, DISSOLVE 200 ms.
- Nested interaction timings are inconsistent (200 vs 300 ms) — see §11.

### 4.3 "Remember Me" — instances `27:298` (Login) and `33:86` (Error)

| Property | Value |
|---|---|
| Main component | **`25:75` — T&C `Property 1=Default`** (unchecked) |
| Box | 40 × 40, r 8, `#FFFEFA`, no stroke, at (0, 879.333) |
| Label override | text node `I27:298;25:77` (same node id as the component's text) with characters replaced by `Remember Me.` — **underline removed**, colour `#6E786F`, DM Sans 30, at x 75 |
| Size | 476 × 40 (same as the component) |
| Gap | 35 (inherited) |

So "Remember Me" is not its own component: it is a T&C instance with the label swapped.

### 4.4 "Log out" icon — instance `39:340`

| Property | Value |
|---|---|
| Main component | `39:338` — remote component named **"Log out"** (library component; its key is `2865aa7a8dca7a552e7f339a70f92d777f06ed83`) |
| Inner node | `7758:11840` — 1 path, the "door + arrow" glyph |
| Size | 45 × 45 at (2465.5, 1659.5) on the dashboard |
| Style | stroke `#1E1E1E`, width 4, round caps/joins, no fill |
| Text | none inside the instance; the "Logout" label (`39:332`) is a sibling in `Frame 18` |

### 4.5 Other instances in the frames

| Instance | Where | Main component | Overrides |
|---|---|---|---|
| `27:266` Left Card | Create Account | `3:126` (Default) | effects, fills, name (resolved values identical) |
| `27:310` Left Card | Login | `3:126` (Default) | name |
| `33:99` Left Card | Error | `3:126` (Default) | name |
| `25:73` T&C | Create Account | `25:75` (Default) | none |
| `27:298` Remember Me | Login | `25:75` (Default) | text content |
| `33:86` Remember Me | Error | `25:75` (Default) | text content |
| `39:340` Log out | Dashboard | `39:338` (remote) | none recorded |

---

## 5. Interaction states

### 5.1 States that EXIST in the design
| State | Where | What changes |
|---|---|---|
| **Default (form)** | Create Account, Login | as specified above |
| **Error** | Login Error State | red border + red glow on both inputs, red inline message (`#AB0000`) |
| **Checkbox unchecked** | T&C `Default` / Remember Me | `#FFFEFA` box, no glyph |
| **Checkbox checked** | T&C `Variant2` | `#203D30` box + `#FFFEFA` tick |
| **Active nav** | Dashboard sidebar | `#315540` pill, lime dot, white label (this is the only nav state drawn) |
| Button "click" | prototype only (T&C toggle) | DISSOLVE 200/300 ms |

### 5.2 Undesigned states (do NOT invent values for these in the main spec)
- Input **focus** (no focus ring, no border colour change anywhere).
- Input **hover**, **disabled**, **filled** (all inputs show placeholder/empty styling only; no typed-value state exists).
- Button **hover / active / focus / disabled / loading** for the primary CTA, Google/GitHub buttons and Logout.
- **Error on Create Account** (only Login has an error variant), **success** states, **validation** per-field errors (the error is form-level only).
- **Checked-state "Remember Me"** (the instance is always the unchecked variant).
- Sidebar **hover / inactive** nav items (only one item, only active).
- **Responsive / mobile / tablet** states — see §7.2.
- **Empty dashboard** (no zero-state besides the single "Your space is ready." banner).

### 5.3 PROPOSED (not in Figma — suggestions only, safe to ignore)
> Everything in this subsection is a **proposal**; none of it exists in the file.
- `:focus-visible` → 2px outline in `#203D30` at 40% (or a 1px `#203D30` border + 2px offset ring), never colour-only.
- Hover on dark CTA → lighten `#203D30` by ~6% (`#2A4E3E`); on light buttons → fill `#F7F4EC`.
- Disabled → 40% opacity, `cursor: not-allowed`.
- Typed input text → DM Sans 43.167 `#18271F` (the labels already use `#203D30`, so typed text darker than placeholder is consistent with the system).
- Field-level error text under the field at DM Sans 30 `#AB0000`, reusing the existing error colour.
- `prefers-reduced-motion` → disable the T&C dissolve.

---

## 6. Assets

### 6.1 Manifest

All files are in **`design-assets/`** at the project root. There is no `public/` folder in the repo yet, so `design-assets/` holds the originals; when the Next.js app is created these can be moved to `public/assets/` unchanged.

| File | Source node / layer | Type | Size (px) | Used in | Notes |
|---|---|---|---|---|---|
| `main-logo.svg` | `27:238` "Main Logo" (= component `1:74`) | SVG | 854 × 854 (art 850 × 850 at 2,2) | Left Card, all 3 auth frames | **Contains the grain filter** (§6.2). Keep `<defs>` intact. |
| `dashboard-logo.svg` | `33:271` "Main Logo" | SVG | 441 × 441 | Dashboard banner | Same art, plate `#F9F0EB`, **no filter**. |
| `brand-mark.svg` | `1:91` "Cactus brand mark" | SVG | 100 × 100 | Left Card, sidebar | Lime tile + 5 dark-green rounded paths. |
| `ellipse-1.svg` | `1:71` "Ellipse 1" | SVG | 882.6 × 882.6 (circle 820 + 31.3 bleed) | Left Card | radial gradient + `feGaussianBlur 15.65`. |
| `ellipse-2.svg` | `1:73` "Ellipse 2" | SVG | 612.6 × 612.6 (circle 550 + bleed) | Left Card | same |
| `ellipse-3.svg` | `3:125` "Ellipse 3" | SVG | 362.6 × 362.6 (circle 300 + bleed) | Left Card | same |
| `check-icon.svg` | `25:81` "🔹 Icon Color" | SVG | 18.6167 × 13.9722 | T&C checked variant | white tick, `#FFFEFA` |
| `logout-icon.svg` | `I39:340;7758:11840` "Icon" | SVG | 45 × 45 | Dashboard logout | stroke `#1E1E1E`, 4px, round caps |

Not present as separate assets because **they do not exist in the design**:
- **Google / GitHub logos** — the social buttons are text-only ("Continue with Google", "Or sign in with Google").
- Any avatar image — the avatar is initials "AM" in a CSS circle.
- Any icon set for the dashboard — the only icons are the lime dot and the logout glyph.
- Any raster/PNG/texture file — the grain is a vector filter (below).

Individual exports were produced as SVG **with text kept as `<text>`**. The intermediate frame/component SVG exports and the PNG renders used for measuring were temporary working files and have been removed after extraction — only `STYLE.md` and `design-assets/` remain.

### 6.2 Grain / texture investigation (the "Main Logo" card)

**The grain is not an image and not a CSS-only effect — it is an inline SVG filter baked into the vector.** `design-assets/main-logo.svg` contains:

```xml
<filter id="filter0_gn_27_238" filterUnits="userSpaceOnUse" x="0" y="0" width="854" height="854">
  <!-- 1) TEXTURE: roughen the pixel-art edges -->
  <feTurbulence type="fractalNoise" baseFrequency="0.25 0.25" numOctaves="3" seed="9505"/>
  <feDisplacementMap in="shape" scale="4" xChannelSelector="R" yChannelSelector="G" result="displacedImage"/>
  <!-- 2) NOISE (duotone): black 25% + white 25% speckle, clipped to the art -->
  <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves="3" seed="8415"/>
  <feColorMatrix in="noise" type="luminanceToAlpha"/>
  <feComponentTransfer>… discrete alpha split (tableValues of 51 ones / 49 zeros) …</feComponentTransfer>
  <feFlood flood-color="rgba(0,0,0,0.25)"/>   <!-- color1 -->
  <feFlood flood-color="rgba(255,255,255,0.25)"/> <!-- color2 -->
  <feMerge> displacedImage + color1 + color2 </feMerge>
</filter>
```

Correspondence with Figma's effect panel (from the node data): effect 1 `TEXTURE` (`noiseSize 4`, `radius 2`, `clipToShape false`) → the turbulence + displacement map (`scale=4`); effect 2 `NOISE` (`density 1`, `noiseSize 0.5`, `noiseType DUOTONE`, primary `rgba(0,0,0,0.25)`, secondary `rgba(255,255,255,0.25)`) → the second turbulence + dual flood. So:

- **Mechanism:** `feTurbulence` fractal noise, **not** an embedded base64 PNG and **not** a texture fill.
- **Parameters:** displacement `baseFrequency 0.25`, `numOctaves 3`, `scale 4`, seed 9505; grain `baseFrequency 2`, `numOctaves 3`, `stitchTiles stitch`, seed 8415, ~50% alpha split into 25% black / 25% white.
- **How to reproduce in the browser:** ship the SVG as-is — the filter renders correctly inside `<img src>` / `next/image` (SVG filters are allowed in `<img>`; only scripts are blocked). Do **not** re-implement with a CSS noise PNG: the displaced edges are part of the look. If it must be inlined, inline the whole SVG including `<defs>`; the filter uses `filterUnits="userSpaceOnUse"` sized to 854 × 854, so the artwork must stay at that scale (or scale the filter region with it).
- **Scaling caveat:** `userSpaceOnUse` + `baseFrequency 2` means the grain is *frequency-locked to the SVG user units*. Rendering the file at 425 CSS px (half size) keeps the same grain density relative to the art; setting `width` without changing `viewBox` is safe. Re-running the artwork through an image resizer is **not** safe.
- **Same filter** is used for the `that` text (`seed 4958`) and the sidebar (`seed 5500`), but those are monotone (single black flood).

### 6.3 Blurred ellipses — how to use them

- Each ellipse asset = **circle + radial gradient + 31.3 blur**, with the filter region **inflated by 31.3 on all sides**. The SVG's `viewBox` already includes that bleed (e.g. 882.6 instead of 820), so placing the file at its natural size and positioning it at `x = bbox − 31.3` reproduces Figma exactly.
- Figma coordinates in §3/§4 are the **circle bboxes**; the asset's top-left is `(cx − r − 31.3, cy − r − 31.3)`.
  - Ellipse 1 (component): circle (759,119) 820 → asset at (727.7, 87.7).
  - Ellipse 2: (556,1033) 550 → asset at (524.7, 1001.7).
  - Ellipse 3: (57,229) 300 → asset at (25.7, 197.7).
- They **overflow the card** (Ellipse 1 right edge 1579 > 1400; Ellipse 2 bottom 1583 < 1720 is fine; Ellipse 3 left 57 is inside). The card clips content, so the build must set `overflow: hidden` on the card, otherwise the glow will spill over the cream panel.
- Gradient: radial, centre → edge `#426452` → `#2C513D`, rotated 90° (so the bright centre is at the ellipse centre and the gradient axis runs top→bottom), fill opacity **0.5**.
- CSS approximation (if the asset is not used): `background: radial-gradient(circle at 50% 50%, rgba(66,100,82,.5), rgba(44,81,61,.5)); filter: blur(7.83px)` at CSS scale — visually close, not exact (Figma's blur is *progressive*: 9.8 at the top edge → 31.3 at the bottom).

### 6.4 Logo / brand-mark colour behaviour

- `brand-mark.svg` (**100 × 100**): the lime tile is a `rect` with `fill="#A5C957"` and the glyph is 5 `path`s with `fill="#203D30"` — **hard-coded fills, not `currentColor`**. On the dashboard the same colours are used, so no theming is needed; if you ever need a light-on-dark variant you must edit the fills.
- `main-logo.svg` / `dashboard-logo.svg`: every path has a **hard-coded** fill (solid or a gradient from `<defs>`); nothing is inheritable. The plate is `#DBD2B6` (card) vs `#F9F0EB` (dashboard).
- `logout-icon.svg` and `check-icon.svg` also hard-code `stroke`/`fill`. All four are safe to use as `<img>`, but they **cannot** be recoloured via CSS — inline them if a colour change is ever required.

---

## 7. Fidelity notes for the build step

### 7.1 Gotchas (things that are easy to get wrong)

1. **The design is 2×.** Every number in this doc is Figma px. Halve it. `Manrope 105` is **52.5px**, not 105px.
2. **The cards touch.** Left card `40…1440`, form panel `1440…2840`. No gutter; the page background only shows as a 40px frame.
3. **The form is not centred in its panel.** Create sits at `y 101.917`, Login/Error at `y 125.333` (both +0.333 off true centring). If you centre with flexbox you will be ~0.17 CSS px off — harmless — but the two forms have **different heights** (1516.833 vs 1470), so use the measured offsets if you position absolutely.
4. **Login frames have the CTA at `x = 2`,** not 0 (Create has it at 0). Its width is the same 1050, so the button overhangs the form's right edge by 2px. Keep it — it is in the file.
5. **Divider rules are rotated 0.577°** (down to the right), sliced into two segments with a 355px gap for the label. Do not draw a plain `border-top`; use a rotated element or an SVG line, or the tilt disappears.
6. **The dashboard divider is rotated the other way** (−0.207°) and is 2px thick and only 1111 long.
7. **Login has labels; Create does not.** Create = 4 placeholders only. Login = label + box for email and password, no placeholder labels on top.
8. **Social buttons are centred** — the text node hugs its run (395 / 391 wide) inside the 490 box, so the glyphs start ~47/49 px in. Don't convert that to a `padding-left`; centre the label.
9. **The Google/GitHub buttons have no icons.** Only text.
10. **Text boxes are often shorter than the line-height.** Examples: `Welcome title` box 56 tall for 70px type (95.62 line-height); `Welcome description` box 50 tall for two lines of 45.57 → **the second line is clipped in the render** (the PNG shows only "Welcome to Cactus. This is your starting"). If you reproduce the clipping you must set a fixed height + `overflow: hidden`; if you don't, the copy will read as intended (two lines). Decide deliberately — the file clips it.
11. **Ellipses overflow the card and must be clipped** (`overflow: hidden` on the 1400×1720 card).
12. **Grain must come from the SVG filter,** not a noise PNG (see §6.2).
13. **The sidebar's noise covers the whole sidebar**, including the wordmark and nav text — it is a filter on `Frame 6`, not a background texture.
14. **1px black outlines** (banner/header/avatar/card/logout) are 0.5 CSS px. Browsers may drop sub-pixel borders on non-retina displays; consider `0.5px` with a fallback of `1px rgba(0,0,0,.55)` if it looks too heavy. Do not "fix" the colour to grey — the file is black at 100%.
15. **The account-details card is `#FFF2CC` at 77%** over `#E9E3D6`, so its effective colour is ~`#FAEECE`. If you use the hex at 100% it will look too saturated.
16. **The header bar is `#E6FAFB` at 80%** (effective ~`#E9F1F0` over the page).
17. **The avatar is initials, not an image:** 99×99 circle, `#DCE6D1`, 1px black ring, "AM" Manrope 38 in `#2F2F2F`. Note "AM" is placed at x 2398.33 inside a 99-wide circle at 2377.5 → inset 20.83 left, and baseline 147.554 (circle spans 83.5…182.5), i.e. visually centred.
18. **Text positions are explicit:** the file places each line/run with absolute `x` (e.g. the `?` at 283.327 and the link at 316.413 in Login; the link at 514.427 in Create). Reproducing with flex + gaps will shift them by a few px; that is acceptable, and keep the header user block's alignment as specified (264-wide block, name `text-right`, email `text-center`; the measured x 2573.14 / 2517.39 follow from it).
19. **The `Form Div` differs between frames** (Create: radius 26, transparent; Login/Error: radius 25, filled `#E9E3D6`). On a `#E9E3D6` page the Login fill is invisible; the radius difference (0.5 CSS px) is invisible too — but it explains why the Create panel has no fill node in its tree.
20. **The T&C/component set dashed purple outline is an editor artefact.** Never render it.
21. **"Remember Me." keeps the period** and has **no underline** (it is a T&C instance with the label text replaced).
22. **Checkbox is 40×40 (20 CSS) with r 8 (4 CSS)** — much larger than a typical 16px checkbox; keep it, and make the whole row clickable.
23. **Icon/asset colour is hard-coded** — CSS `color` will not tint `logout-icon.svg` or `check-icon.svg`.
24. **Layer order inside Login's `CTA and Buttons` is inverted** vs Create (`Optional CTAs` first, `Main CTA` last). Irrelevant visually, but don't assume the DOM order from Create applies to Login.

### 7.2 Responsive intent

- The file is **desktop-only**. All four frames are fixed 2880×1800 canvas at a 1440×900 logical size; there are **no** breakpoints, no mobile/tablet frames, no auto-layout that would reflow the page, and no constraints that imply a stacked layout (the two auth cards are absolutely placed siblings).
- What **is** in the data: the left card is a fixed 1400×1720 instance; the form is 1050 wide with `layoutSizingHorizontal FIXED`; the dashboard is a fixed 2880×1800 composition with a 700 sidebar and a 2041 header.
- What is **NOT** in the data: any rule for < 1440px, any mobile navigation, any collapsing of the two-column auth layout, any fluid type scale, any max-width for the form on wide screens. **UNKNOWN by design** — do not claim a responsive behaviour was specified.
- Reasonable minimum (not from Figma): keep the 2-column auth layout ≥ 1200px and stack below that; the sidebar would need a different presentation below ~1024px, which the file does not provide.

### 7.3 Suggested Next.js structure (informational only — DO NOT create these in this task)

```
app/
  (auth)/layout.tsx        -> AuthLayout: page bg + two 700x860 CSS cards
  (auth)/create/page.tsx   -> Create Account frame
  (auth)/login/page.tsx    -> Login frame
  (auth)/login/error/page.tsx (or same page w/ error prop)
  dashboard/page.tsx       -> Dashboard frame
components/
  LeftCard.tsx            (variant prop: default | variant2 | variant3)
  AuthForm.tsx            (heading, sublink, fields, cta, divider, socials)
  TextInput.tsx           (label? | placeholder, error?)
  Checkbox.tsx            (T&C / Remember Me; checked prop)
  PrimaryButton.tsx
  SocialButton.tsx
  Divider.tsx             (rotated 0.577deg rule + label)
  DashboardLayout.tsx     (Sidebar + Header + content)
  Sidebar.tsx  Header.tsx  WelcomeBanner.tsx  AccountCard.tsx  LogoutButton.tsx
lib/design-tokens.ts      (colours + type scale from §2)
```
Pixel coordinates map cleanly onto: AuthLayout = `padding 20px; gap 0; height 900px`; each card `700 × 860` at CSS scale.

---

## 8. Visual-only observations (seen in screenshots, not in the structured data)

1. **Grain on the logo plate is real and coarse** — visible as fine dark/light speckle across the beige card, strongest on flat areas, plus slightly *jittered* pixel-art edges (that is the displacement map, not anti-aliasing). Confirmed mechanically in the SVG filter (§6.2).
2. **The three blurred ellipses read as soft green blooms**, not as visible circles: the glow is much wider than the shape and fades to nothing. In the create-account render there are three distinct blooms — top-left (small), top-right (large, behind the logo card), bottom-centre (medium) — all slightly lighter than the card.
3. **"Matter ..." is a calligraphic script** with heavy stroke contrast and a long tail on the "r"; it overlaps vertically with the serif line above and sits lower than the baseline of "that" (bottom-aligned in Figma).
4. **The `that` line is noticeably noisier than "Building things"** — a visible speckle in the cream glyphs. That is the NOISE effect on `2:116` only.
5. **The pixel-art cactus has hard 1:1 pixel steps** (no smoothing), a red terracotta pot made of stepped blocks, and the word "CATCUS" set in the same pixel style underneath — all part of the vector, not a font.
6. **Dashboard sidebar grain** is visible across the whole 700px panel, including over the wordmark and "Overview" pill (consistent with the filter being on `Frame 6`).
7. **Welcome description is cut off after one line** in the render ("Welcome to Cactus. This is your starting") — matches the 50px-tall clipping box; the second line exists in the text but is clipped.
8. **"Your space is ready." looks slightly tight/clipped** at the bottom of its 56px box (descenders of "y" are at the edge) — the box is 56 tall for a 95.62 line-height.
9. **The header bar is slightly translucent** — the page beige shows through the pale cyan (80%).
10. **Account details card is warm cream** and the black hairline border is visible on all four sides.
11. **The logout button is a very light cyan** with a black hairline and a thin outlined door-arrow icon; the label is large (35px CSS) relative to the 74.5px-tall button.
12. **The avatar's black ring is thin** (1px Figma = 0.5 CSS) and the initials are not perfectly centred — they sit slightly left of centre.
13. **Error state:** the two inputs show a **red 1px border plus a very subtle red halo** (the 8px blurred `#AB0000` shadow at 0 offset). The error message is plain red text, same size as the body copy and right-aligned against the form edge — there is no error icon and no red background.
14. **The social buttons are centred**, and because the two labels differ in width (395 vs 391) the visual left/right margins differ by ~2 px between them — that is the centring, not a misalignment.
15. **The divider rules are visibly tilted** if you look at a straight edge — the two halves line up across the label.

---

## 9. Layer counts (self-check baseline)

Counted from the exported SVG trees (each `<g>` with a Figma `data-node-id`, plus every leaf `rect`/`text`/`path`/`line`/`circle`). Figma-side wrapper groups (`Main Heading`, `Login Option`, `User Inputs`, `CTA and Buttons`, `Optional CTAs`, `Logo + Heading`, `Frame 5/7/8/11/12/14/15/16/18`) are included as layers.

| Frame / component | Named Figma layers (with node id) | Leaf drawing elements |
|---|---|---|
| Create Account `25:47` | 48 | 62 |
| Login `27:284` | 48 | 59 |
| Login Error `33:70` | 49 | 62 |
| Dashboard `33:186` | 46 | 59 |
| Left Card Default `3:126` | 17 | 32 |
| Left Card Variant2 `27:192` | 17 | 32 |
| Left Card Variant3 `27:230` | 17 | 32 |
| T&C Default `25:75` | 3 | 3 |
| T&C Variant2 `25:78` | 5 | 4 |

Counts are exact counts of the exported vector trees: "named" = elements carrying a Figma `data-node-id`, "leaf drawing" = `rect`/`text`/`path`/`line`/`circle` elements. Leaves that Figma does not name individually (the fill/stroke rect pairs inside each input, the two rects of the T&C box, the paths of the logo) are described as sub-elements of their parent rather than as their own bullets. **Appendix A lists every one of those 250 node ids with its layer name**, so nothing can be missed.

---

## 10. UNKNOWN — everything not determinable from the tools

| Item | Why | Impact on the build |
|---|---|---|
| **Design variables / tokens** | `GET_LOCAL_VARIABLES` → "Missing required scope: `file_variables:read`". `EXTRACT_DESIGN_TOKENS` → 0 tokens, same reason. No local styles exist (`styles: {}`). | None visually — all colours above are literal values read from fills/strokes. You just cannot map them to token names/modes. |
| **Auto-layout flags** for `Frame 9` (`33:281`), `Frame 11` (`33:292`), `Frame 12` (`39:305`), `Account details card` (`39:306`), `Frame 16/15/14` (`39:326/323/316`), `Account Details` (`39:327`), `Frame 18` (`39:347`) | Same rate limit; their children are positioned absolutely in the export, so the exact `itemSpacing`/padding is not recorded. | Use the absolute coordinates (all present); re-derive gaps from the numbers given (label→value baselines etc.). |
| **Prototype/transition specs** beyond the T&C dissolve | Only the T&C interactions expose timings; the Left Card has a 7 s SMART_ANIMATE auto-transition (`AFTER_TIMEOUT` 7 s) between variants that was not inspected in detail. | Irrelevant for a static rebuild. |
| **Undesigned states** (§5.2) | They do not exist in the file. | Do not invent them in the main spec. |

---

## 11. Inconsistencies / likely mistakes in the file

1. **Header vs banner vs card widths don't line up** (border-box): header `x 793, w 2041`; banner `x 798, w 2036`; card `x 798, w 1300`. The header is 5px wider and 5px further left — almost certainly an accident.
2. **Card radius differs between frames:** `Form Div` is 26 on Create Account and 25 on Login/Error. Invisible at runtime, but it is an inconsistency.
3. **Login CTA is offset by +2px** (`x = 2`) while Create's is at 0, so the primary button is 2px right of the input column in the login frames.
4. **Divider tilt direction differs** between the auth forms (+0.577°, down-right) and the dashboard account card (−0.207°, up-right). Both are hand-rotated; only the auth one looks intentional.
5. **Layer paint order differs from the visual order in the Login/Error `CTA and Buttons` group** (`Optional CTAs` first, `Main CTA` last) although it renders in the same visual order as Create — CTA → divider → socials. Harmless, but don't copy the export order as the DOM order.
6. **Divider text vertical position:** the label baseline (1342.76) is ~12px below the rule at that x (≈1330.5), so the word "with" is not optically centred on the line.
7. **Overflowing/clipped text boxes** (§7.1 #10): `Welcome title` 56px box for 95.62 line-height; `Welcome description` 50px box clipping line 2. Likely unintended — the copy should be readable.
8. **The welcome description's 663px width** is also narrower than its own text, so even without the height clip it would wrap oddly.
9. **Component naming:** the Left Card set is called **"Frame 3"** and its variants are **"Property 1=Default / Variant2 / Variant3"** — no semantic names. The sub-heading group is called **"Login Option"** on both the create and login forms (it is the "already have an account?" line). The T&C component set is **"T&C"**, its inner text layer is also **"T&C"**.
10. **`39:324` is named "Name value" but contains the e-mail address**, and it lives inside `Frame 15` together with `39:325` "Email Label". The name pair (`39:310/311`) is in `Frame 14`. So the label/value naming is crossed.
11. **One layer name starts with an emoji:** `🔹 Icon Color` (`25:81`) — a Figma "icon colour" helper layer, white tick.
12. **Node-id ranges jump:** the dashboard mixes `33:*` (frames 6/9/11) with `39:*` (user block, account card, logout) and one foreign-library node `7758:11840` (remote "Log out" component).
13. **Two different "Overview" styles:** DM Sans 30 Medium white (nav item) and Manrope 60 `#18271F` (page title). Easy to collapse into one by mistake.
14. **"Create Account" (capital A) in the Login link vs "Create your account" (lower-case a) as the Create page H1** — the two headings do not use the same capitalisation.
15. **Copy spelling mismatch:** the dashboard body copy reads **"Cactus"** ("Welcome to Cactus. This is your starting point…") while the auth copy says **"Catcus"** ("New to Catcus?") and the e-mail is `andrewmartin@catcus.com`; the wordmark is **"CATCUS"**. Keep each string exactly as written — do not normalise them.
16. **The header e-mail uses `@catcus.com`** whereas the input placeholder uses `someone@example.com` — no conflict, just note the two different domains.
17. **T&C nested prototype timings** 200 ms vs 300 ms for the same toggle action.
18. **The Left Card has an `AFTER_TIMEOUT` 7 s smart-animate loop** across its variants in the frame instances — in a static build this is irrelevant, but it means the three variants are meant to be an animated cycle, not three static designs.

---

## Appendix A — complete node-id index

Every element that carries a Figma node id in the nine exported trees, in document (paint) order. `I…;…` ids are instance-internal copies (the part after `;` is the original component id). Format: `layer name — id`.

### Create Account — `25:47`

`Desktop - Create Account` — `25:47` · `Form Div` — `25:49` · `Form` — `25:50` · `Main Heading` — `30:77` · `Main Heading_2` — `25:72` · `Login Option` — `25:71` · `User Inputs` — `30:75` · `Name Inputs` — `25:66` · `First name input` — `25:67` · `Placeholder` — `25:68` · `Last Name Input` — `25:69` · `Placeholder_2` — `25:70` · `Email Input` — `25:64` · `Placeholder_3` — `25:65` · `Password Input` — `25:62` · `Placeholder_4` — `25:63` · `T&C` — `25:73` · `Check` — `I25:73;25:76` · `T&C_2` — `I25:73;25:77` · `CTA and Buttons` — `30:76` · `Main CTA` — `25:60` · `Button label` — `25:61` · `Options` — `25:56` · `Or sign in with` — `25:57` · `Line 1` — `25:58` · `Line 2` — `25:59` · `Optional CTAs` — `25:51` · `Google Sign-in` — `25:52` · `Placeholder_5` — `25:53` · `GitHub Sign-in` — `25:54` · `Placeholder_6` — `25:55` · `Left Card` — `27:266` · `Ellipse 2` — `I27:266;1:73` · `Ellipse 3` — `I27:266;3:125` · `Ellipse 1` — `I27:266;1:71` · `Frame 5` — `I27:266;27:185` · `Brand headline 2` — `I27:266;2:116` · `Brand headline 3` — `I27:266;2:115` · `Brand headline 1` — `I27:266;2:113` · `Main Logo` — `I27:266;1:74` · `Logo + Heading` — `I27:266;27:168` · `Cactus brand mark` — `I27:266;1:91` · `Cactus stem` — `I27:266;1:105` · `Cactus left arm` — `I27:266;1:106` · `Cactus left rise` — `I27:266;1:107` · `Cactus right arm` — `I27:266;1:108` · `Cactus right rise` — `I27:266;1:109` · `Wordmark` — `I27:266;1:111`

### Login — `27:284`

`Desktop - Login` — `27:284` · `Form Div` — `27:285` · `Form` — `27:286` · `Main Heading` — `30:80` · `Main Heading_2` — `27:309` · `Login Option` — `27:308` · `User Inputs` — `30:81` · `User Inputs_2` — `30:74` · `Email Input` — `30:72` · `Placeholder` — `30:70` · `Email Box` — `27:301` · `Placeholder_2` — `27:302` · `Password Input` — `30:73` · `Placeholder_3` — `30:71` · `Password Box` — `27:299` · `Placeholder_4` — `27:300` · `Remember Me` — `27:298` · `Check` — `I27:298;25:76` · `T&C` — `I27:298;25:77` · `CTA and Buttons` — `30:82` · `Optional CTAs` — `27:287` · `Google Sign-in` — `27:288` · `Placeholder_5` — `27:289` · `GitHub Sign-in` — `27:290` · `Placeholder_6` — `27:291` · `Options` — `27:292` · `Or sign in with` — `27:293` · `Line 1` — `27:294` · `Line 2` — `27:295` · `Main CTA` — `27:296` · `Button label` — `27:297` · `Left Card` — `27:310` · `Ellipse 2` — `I27:310;1:73` · `Ellipse 3` — `I27:310;3:125` · `Ellipse 1` — `I27:310;1:71` · `Frame 5` — `I27:310;27:185` · `Brand headline 2` — `I27:310;2:116` · `Brand headline 3` — `I27:310;2:115` · `Brand headline 1` — `I27:310;2:113` · `Main Logo` — `I27:310;1:74` · `Logo + Heading` — `I27:310;27:168` · `Cactus brand mark` — `I27:310;1:91` · `Cactus stem` — `I27:310;1:105` · `Cactus left arm` — `I27:310;1:106` · `Cactus left rise` — `I27:310;1:107` · `Cactus right arm` — `I27:310;1:108` · `Cactus right rise` — `I27:310;1:109` · `Wordmark` — `I27:310;1:111`

### Login Error State — `33:70`

`Desktop - Login Error State` — `33:70` · `Form Div` — `33:71` · `Form` — `33:72` · `Main Heading` — `33:73` · `Main Heading_2` — `33:74` · `Login Option` — `33:75` · `User Inputs` — `33:76` · `Email and/or Password is wrong` — `33:119` · `User Inputs_2` — `33:77` · `Email Input` — `33:78` · `Placeholder` — `33:79` · `Email Box` — `33:80` · `Placeholder_2` — `33:81` · `Password Input` — `33:82` · `Placeholder_3` — `33:83` · `Password Box` — `33:84` · `Placeholder_4` — `33:85` · `Remember Me` — `33:86` · `Check` — `I33:86;25:76` · `T&C` — `I33:86;25:77` · `CTA and Buttons` — `33:87` · `Optional CTAs` — `33:88` · `Google Sign-in` — `33:89` · `Placeholder_5` — `33:90` · `GitHub Sign-in` — `33:91` · `Placeholder_6` — `33:92` · `Options` — `33:93` · `Or sign in with` — `33:94` · `Line 1` — `33:95` · `Line 2` — `33:96` · `Main CTA` — `33:97` · `Button label` — `33:98` · `Left Card` — `33:99` · `Ellipse 2` — `I33:99;1:73` · `Ellipse 3` — `I33:99;3:125` · `Ellipse 1` — `I33:99;1:71` · `Frame 5` — `I33:99;27:185` · `Brand headline 2` — `I33:99;2:116` · `Brand headline 3` — `I33:99;2:115` · `Brand headline 1` — `I33:99;2:113` · `Main Logo` — `I33:99;1:74` · `Logo + Heading` — `I33:99;27:168` · `Cactus brand mark` — `I33:99;1:91` · `Cactus stem` — `I33:99;1:105` · `Cactus left arm` — `I33:99;1:106` · `Cactus left rise` — `I33:99;1:107` · `Cactus right arm` — `I33:99;1:108` · `Cactus right rise` — `I33:99;1:109` · `Wordmark` — `I33:99;1:111`

### Dashboard — `33:186`

`Desktop - Dashboard` — `33:186` · `Frame 6` — `33:238` · `Ellipse 1` — `33:236` · `Sidebar note` — `33:239` · `Frame 7` — `33:265` · `Sidebar overline` — `33:246` · `Overview selected` — `33:241` · `Rectangle 3` — `33:264` · `Overview label` — `33:243` · `Logo + Heading` — `33:255` · `Cactus brand mark` — `33:256` · `Cactus stem` — `33:257` · `Cactus left arm` — `33:258` · `Cactus left rise` — `33:259` · `Cactus right arm` — `33:260` · `Cactus right rise` — `33:261` · `Wordmark` — `33:262` · `Welcome banner` — `33:142` · `Welcome Description` — `33:267` · `Welcome title` — `33:145` · `Welcome description` — `33:146` · `Frame 8` — `33:278` · `Main Logo` — `33:271` · `Frame 9` — `33:281` · `Header title` — `33:279` · `Frame 11` — `33:292` · `AM` — `33:298` · `Frame 12` — `39:305` · `Andrew Martin` — `39:303` · `andrewmartin@catcus.com` — `39:304` · `Account details card` — `39:306` · `Frame 16` — `39:326` · `Frame 15` — `39:323` · `Name value` — `39:324` · `Email Label` — `39:325` · `Frame 14` — `39:316` · `Name value_2` — `39:311` · `Name label` — `39:310` · `Details Divider` — `39:318` · `Account Details` — `39:327` · `Account details heading` — `39:307` · `Account details caption` — `39:308` · `Frame 18` — `39:347` · `Logout` — `39:332` · `Log out` — `39:340` · `Icon` — `I39:340;7758:11840`

### Left Card — Default `3:126`

`Property 1=Default` — `3:126` · `Ellipse 2` — `1:73` · `Ellipse 3` — `3:125` · `Ellipse 1` — `1:71` · `Frame 5` — `27:185` · `Brand headline 2` — `2:116` · `Brand headline 3` — `2:115` · `Brand headline 1` — `2:113` · `Main Logo` — `1:74` · `Logo + Heading` — `27:168` · `Cactus brand mark` — `1:91` · `Cactus stem` — `1:105` · `Cactus left arm` — `1:106` · `Cactus left rise` — `1:107` · `Cactus right arm` — `1:108` · `Cactus right rise` — `1:109` · `Wordmark` — `1:111`

### Left Card — Variant2 `27:192`

`Property 1=Variant2` — `27:192` · `Ellipse 2` — `27:193` · `Ellipse 3` — `27:194` · `Ellipse 1` — `27:195` · `Frame 5` — `27:196` · `Brand headline 2` — `27:197` · `Brand headline 3` — `27:198` · `Brand headline 1` — `27:199` · `Main Logo` — `27:200` · `Logo + Heading` — `27:201` · `Cactus brand mark` — `27:202` · `Cactus stem` — `27:203` · `Cactus left arm` — `27:204` · `Cactus left rise` — `27:205` · `Cactus right arm` — `27:206` · `Cactus right rise` — `27:207` · `Wordmark` — `27:208`

### Left Card — Variant3 `27:230`

`Property 1=Variant3` — `27:230` · `Ellipse 2` — `27:231` · `Ellipse 3` — `27:232` · `Ellipse 1` — `27:233` · `Frame 5` — `27:234` · `Brand headline 2` — `27:235` · `Brand headline 3` — `27:236` · `Brand headline 1` — `27:237` · `Main Logo` — `27:238` · `Logo + Heading` — `27:239` · `Cactus brand mark` — `27:240` · `Cactus stem` — `27:241` · `Cactus left arm` — `27:242` · `Cactus left rise` — `27:243` · `Cactus right arm` — `27:244` · `Cactus right rise` — `27:245` · `Wordmark` — `27:246`

### T&C — Default `25:75`

`Property 1=Default` — `25:75` · `Check` — `25:76` · `T&C` — `25:77`

### T&C — Variant2 `25:78`

`Property 1=Variant2` — `25:78` · `Frame 4` — `25:79` · `Check` — `25:80` · `🔹 Icon Color` — `25:81` · `T&C` — `25:82`
