---
version: 2.0
name: Phalanx Cyber Academy: Design Annual
description: Print-plate design system for the Phalanx Cyber Academy gamified cybersecurity learning platform.
---

# Phalanx Cyber Academy: Design Annual

## Overview

Phalanx Cyber Academy is a game-based learning platform for digital literacy and cybersecurity awareness. Its visual identity is **Design Annual**: the product is presented as a printed credential: plates, hairline rules, registration marks, mono labels, and rubber-stamp verdicts. The website is the prospectus; the simulated PC is the evidence dossier. One grammar, two surfaces.

- **Target audience:** Students, career-switchers, and general learners, plus educators/institutions evaluating the platform.
- **Mood:** Composed, precise, credential-bearing. Austere chroma; energy comes from composition confidence and ritual interactions (stamps, plate numbering), not decoration.
- **Density:** Medium. Editorial whitespace on marketing surfaces; hairline-ruled density on Operate surfaces (dashboards, admin, simulated PC).
- **Core metaphor:** A print artifact: every surface is a plate in a bound volume. Scenarios are exhibits; verdicts are stamps; progress is a register of marks.

### Principles

1. **Ink and stock, not glow.** Flat surfaces, hairline rules, zero gradients, zero drop-shadow effects (a single functional window shadow in the simulated PC is permitted).
2. **Mono is the label voice.** Metadata, IDs, captions, and verdicts are always Chivo Mono, uppercase, letterspaced.
3. **Stamps are the ritual.** Confirmations, verdicts, and achievements are rubber-stamp moments: rotated, double-ringed, ink-colored.
4. **The logo is a registered mark.** The shield appears as a printed emblem, occasionally with the rotating certification stamp half off its edge. Never glowed, never gradiented.
5. **Mobile-first.** Every surface is composed at 390px first and scaled up; desktop structure is additive, not assumed.

## Tokens

### Material

| Token | Light | Dark | Role |
|---|---|---|---|
| `stock` | `#F5F4F6` | `#141518` | Page/field background · paper / carbon plate |
| `stock-drift` | `#FAF6F5` | `#1B1C20` | Subtle tonal wash, hero/desktop fields |
| `stock-green` | `#EEF3EF` | `#15201A` | Secondary tonal wash, hover tint |
| `ink` | `#16181A` | `#EBE9E4` | Primary text, hairline-strong rules, solid fills |
| `ink-soft` | `#5A5C5E` | `#9B9C97` | Secondary text, captions, metadata |
| `hairline` | `#C9C7C4` | `#33353A` | Rules, plate borders, dividers |
| `hairline-soft` | `#DDDCDA` | `#26272C` | Inner dividers, dotfield marks |

### Semantic

| Token | Light | Dark | Role |
|---|---|---|---|
| `seal` | `#DCDDF3` | `#2E2F45` | Accent plate fill · active states, badges, marks of record |
| `seal-ink` | `#3C3D63` | `#C9CBEF` | Text/icons on `seal`; link color |
| `strike` | `#B03A2E` | `#D0674F` | Danger, phishing verdicts, destructive actions, flag marks |
| `confirm` | `#2E7D4F` | `#5FA878` | Success, legitimate verdicts, completion |

Difficulty/severity mapping: Beginner → `confirm`; Intermediate → `ink` (neutral plate); Advanced → `strike`. "Coming soon" → `ink-soft` outline stamp.

### Typography

| Token | Value | Role |
|---|---|---|
| `sans` | `'Archivo', sans-serif` | Display and body · one grotesque carries everything |
| `mono` | `'Chivo Mono', monospace` | Labels, IDs, metadata, verdicts, terminal/log text |

- **Display (H1):** Archivo 800, `clamp(2.4rem, 6vw, 4.5rem)`, `letter-spacing:-0.03em`, `line-height:1.05`. Sentence case, not all-caps; the grotesque carries authority.
- **H2:** Archivo 400–600, `clamp(1.9rem, 4vw, 3rem)`, `letter-spacing:-0.02em`.
- **H3:** Archivo 700, 1.25rem.
- **Body:** Archivo 400, 16px, `line-height:1.65`, `ink` for primary, `ink-soft` for supporting.
- **Label/Mono:** Chivo Mono, 9–11px, `text-transform:uppercase`, `letter-spacing:.14em–.22em`, `ink-soft` default, `ink` for emphasis. Never smaller than 8px.
- **Links:** `seal-ink`, underline with `text-underline-offset:3px`.

### Space and structure

- Mobile-first breakpoints: base = 390px, then `sm:` 768, `lg:` 1024, `xl:` 1440.
- Page padding: `px-5 sm:px-8`; max content `max-w-6xl` (marketing) / `max-w-4xl` (legal) / `max-w-md` (forms).
- Section rhythm: `py-14 sm:py-20`, sections separated by a hairline rule (`border-t border-hairline`), not whitespace alone.
- Touch targets ≥44px on interactive elements.

## Primitives

### Plate
The container. `border:1px solid ink` (strong plate) or `hairline` (quiet plate), `border-radius:0`, `background:stock`. Registration corners: two `+` marks (mono, `opacity:.5`) at top-left and bottom-right inside the plate. Strong plates carry windows/CTA cards; quiet plates carry list items and fields.

### Hairline
`1px` rules are the primary divider and structural device. Full-bleed hairlines separate page sections; inset hairlines divide index lists and table rows.

### Registration marks
`+` crosses and small dots placed in page margins/corners, furniture that implies the plate was registered on a press. Sparingly: 2–4 per viewport on desktop, hidden or reduced on mobile (`opacity:.55`, mono glyphs).

### Stamp
Verdict/achievement ring: circular, `border:2px solid currentColor` + inner ring `inset:3px`, mono uppercase text, rotated `-8deg`. Interaction: stamps **land**: `scale(1.6)→1` with rotate, `cubic-bezier(.19,1,.22,1)`, ~0.5s. Colors: `strike` (phishing/danger), `confirm` (legit/success), `ink` (neutral certification).

### Plate ID
Mono chip: `font-mono text-[9px] tracking-[.2em] px-1.5 py-0.5 bg-seal text-seal-ink`, e.g. `PLT-03`, `EXH-01`, `MSN-07`. Numbers every scenario, level, window, and exhibit.

### Dotfield
Registration dot matrix: `radial-gradient` 1px dots at 22px pitch, masked to the periphery (`opacity:.5` light / `.35` dark). Desktop/hero furniture only; never behind reading content.

## Components

### Buttons

- **Primary (Enlist/Start):** `bg-ink text-stock`, square, mono uppercase `.78rem/.12em`, `px-6 py-3`. Hover: `bg-accent-hover` (lighten/darken step). No radius, no shadow.
- **Stamp buttons (verdicts):** transparent, `border:2px solid currentColor`, inner hairline ring, mono uppercase, `strike`/`confirm` color. Hover rotates `-1.2deg`.
- **Ghost:** `border:1px solid ink`, transparent bg, mono uppercase. Hover: `stock-green` fill.
- **Disabled:** `opacity-50`, keep borders visible; never fade into the stock.

### Cards

Plates. `border border-hairline bg-stock p-5 sm:p-6`, registration corners on feature/scenario cards, plate-ID chip top-left. Hover: border strengthens to `ink`; no lift, no shadow.

### Badges & status

- Status reads as stamps/verdict text, not pill fills: `✓ VERIFIED LEGIT` (confirm), `✗ PHISHING` (strike), `PENDING`/`AWAITING VERDICT` (ink-soft). Mono, uppercase, letterspaced.
- Progress = **marks**: `MARKS 200/500` mono register; bars are hairline-ruled tracks with an `ink` fill.

### Forms

- Labels: mono uppercase, `ink-soft`.
- Inputs: square, `border border-hairline bg-stock px-4 py-3`, focus ring = `2px seal-ink` outline (visible, not color-only).
- Errors: `strike` border + mono helper text.

### Tables

- Outer `border border-ink`; header row mono uppercase `ink-soft` over `stock-drift`; `divide-y divide-hairline`; row hover `stock-green`. No rounded corners, no zebra striping.

### Navigation

- Top bar: hairline bottom border, logo + `PHALANX CYBER ACADEMY` (Archivo 800, tight), nav links Archivo, active link underlined with `ink`. Mobile: hamburger → full-screen plate menu.
- Footer: hairline top, mono label columns, `ink` wordmark strip.

### Toasts

Top-right plate: `border border-ink bg-stock`, mono label + Archivo message, left edge 2px `confirm`/`strike`/`ink` per type. Never solid colored fills.

## Motion

- Default: `transition-colors duration-150` for hovers; structure changes `duration-200`.
- Signature motion: **stamp landing** (`cubic-bezier(.19,1,.22,1)`, ~0.5s) and **certification ring spin** (`linear infinite`, 25s, decorative only on hero/achievement marks).
- Allowed: fade/slide entrances ≤0.4s, mono log line-by-line reveals (boot/register sequences).
- Banned: gradients animating, bouncing orbs, parallax, scale-on-hover for cards, marquee loops, autoplaying backgrounds.

## The simulated PC: dossier grammar

The simulated machine is **a forensic dossier on a light table**: the same system translated, not reskinned:

- **Desktop** = plate field: `stock` background, dotfield + registration crosses, boot log as `PLATE REGISTER` mono block.
- **Windows** = numbered plates: `border-ink` strong plate, title bar carries `PLT-0N` chip + Archivo 700 title + mono exhibit subtitle; controls are outlined squares (no traffic lights).
- **Taskbar** = plate rail: bottom bar, logo + `PHALANX-OS` mark, open windows as mono plate tokens (`PLT-03 · MAIL`), tray carries `MARKS n/n`, UTC clock, `ESC · EJECT`.
- **Desktop icons** = plate thumbnails: 52px square plates with registration corners, mono label + `APP-0N` number beneath.
- **Verdicts** = stamp buttons + landed stamp overlay on the exhibit.
- **Document bodies** (email/article content) may keep light "printed document" stock in dark mode: the exhibit is the paper; the machine is carbon. Verify per-renderer before applying globally.
- **Small screens (<768px):** the desktop metaphor collapses: rail becomes a bottom plate-switcher bar, one window fills the screen, icons and furniture hidden, verdict stamps become full-width buttons. Boot/shutdown keep the mono register at reduced density.

## Voice

- Mission register stays binding: "Train. Coordinate. Defend.", "recruit", "ENLIST", "Mission Not Found", "Return to Base", now delivered in terse plate-register style.
- Labels are registers, not sentences: `EXHIBIT 3 OF 5`, `RENDER VERDICT`, `PLATE REGISTER · SCENARIO LOADED`.
- Encouraging, never fear-mongering; error messages helpful and specific, mono for IDs/codes.

## Anti-patterns

- No gradients anywhere, including text gradients, hero washes, and button fills.
- No drop shadows except the single simulated-PC window elevation.
- No border radius on plates, buttons, inputs, or badges (avatars may stay circular; stamps are circular by nature).
- No glass/blur effects, no glow, no animated decorative backgrounds.
- No color-only state: every status also carries a mono verdict label or glyph.
- No un-numbered plates: every scenario/level/window/exhibit carries a plate ID.
- Do not modify legacy `app/`; do not hardcode hex values in components; use tokens (`bg-stock`, `text-ink`, `border-hairline`, `bg-seal`, `text-seal-ink`, `text-strike`, `text-confirm`).
