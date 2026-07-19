---
version: alpha
name: Phalanx Cyber Academy
description: Design system for the Phalanx Cyber Academy gamified cybersecurity learning platform.
---

# Phalanx Cyber Academy — Design System

## Overview

Phalanx Cyber Academy is a game-based learning platform that teaches digital literacy, cybersecurity awareness, and ethical online behavior. The interface should feel energetic, trustworthy, and educational — not dark or intimidating. Visual language is clean, high-contrast, and modern, with a security-first personality.

- **Target audience:** Students, professionals, and general learners interested in cybersecurity.
- **Mood:** Confident, engaging, professional, safe.
- **Density:** Medium; readable spacing for learning content, but dashboards can be information-dense.
- **Core metaphor:** A training academy / mission control. Cards, badges, levels, and progress tracking are primary UI patterns.

## Colors

### Brand

- **Primary (`blue-600`)**: `#2563EB` — CTAs, primary buttons, links, active states, focus rings.
- **Primary Dark (`indigo-900`)**: `#312E81` — hero gradients, dark-mode hero sections.
- **Secondary (`teal-500`)**: `#14B8A6` — secondary accents, success states, clean tech feel.
- **Tertiary (`purple-600`)**: `#9333EA` — achievements, special calls-to-action, gradients.

### Semantic

- **Success (`green-500`)**: `#22C55E` — completed levels, success toasts, positive actions.
- **Warning (`amber-500`)**: `#F59E0B` — coming soon, caution notes, medium difficulty.
- **Danger (`red-500`)**: `#EF4444` — errors, failed attempts, hard/advanced difficulty.
- **Info (`blue-500`)**: `#3B82F6` — informational callouts, neutral primary.

### Neutrals

- **Background light**: `#F9FAFB` (`gray-50`) and `#FFFFFF` (`white`).
- **Surface light**: `#FFFFFF` (`white`).
- **Background dark**: `#111827` (`gray-900`) and `#1F2937` (`gray-800`).
- **Surface dark**: `#1F2937` (`gray-800`).
- **Text primary light**: `#111827` (`gray-900`).
- **Text secondary light**: `#4B5563` (`gray-600`).
- **Text primary dark**: `#F9FAFB` (`gray-50`).
- **Text secondary dark**: `#D1D5DB` (`gray-300`).
- **Borders**: `#E5E7EB` (`gray-200`) in light, `#374151` (`gray-700`) in dark.

### Gradients

Hero and header sections use vivid diagonal gradients:

- **Cyber blue**: `bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700`.
- **Success/Teal**: `bg-gradient-to-br from-green-600 via-teal-600 to-blue-600`.
- **Warning/Orange**: `bg-gradient-to-br from-orange-600 to-amber-600`.
- **Dark hero**: `bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950`.

Use `bg-black/20` overlays on hero images/gradients to keep text accessible.

## Typography

- **Font family**: System font stack / `ui-sans-serif, system-ui, sans-serif`. No custom webfont required.
- **H1**: 48px (mobile) / 60px (desktop), `font-bold`, `line-height: 1.1`.
- **H2**: 30px / 36px, `font-bold`, `line-height: 1.2`.
- **H3**: 24px, `font-semibold`, `line-height: 1.3`.
- **H4**: 20px, `font-semibold`, `line-height: 1.4`.
- **Body**: 16px, `font-normal`, `line-height: 1.6`.
- **Small / Caption**: 14px or 12px, `font-medium`.
- **Code/Mono**: `font-mono` for cookie names, tokens, IDs.

Headings use `text-gray-900 dark:text-white`. Body text uses `text-gray-700 dark:text-gray-300`.

## Spacing

- Use Tailwind scale. Base unit: `4px` (`1`).
- Page padding: `px-4 sm:px-6 lg:px-8`.
- Max content width: `max-w-7xl` for marketing, `max-w-4xl` for legal, `max-w-2xl` for forms.
- Section vertical padding: `py-12` to `py-20`.
- Card padding: `p-6` default, `p-8` for feature cards.
- Gap scale for grids: `gap-6` standard, `gap-8` for spacious marketing grids.

## Shapes

- **Border radius**: `rounded-xl` (16px) for cards and buttons, `rounded-2xl` (24px) for larger panels, `rounded-full` for avatars/badges.
- **Buttons**: `rounded-xl`, `px-6 py-3` (standard), `px-8 py-4` (hero/CTA).
- **Inputs**: `rounded-xl`, `px-4 py-3`, `border-gray-300 dark:border-gray-600`.

## Elevation & Depth

- **Cards**: `shadow-lg` or `shadow-xl` plus subtle borders.
- **Hero overlays**: `bg-black/20` / `bg-white/10` over gradient.
- **Backdrops**: `backdrop-blur-md` for glass cards on dark hero sections.
- **Hover lift**: `hover:-translate-y-1` and `hover:shadow-2xl` for cards.

## Motion

- **Transition default**: `transition-all duration-300`.
- **Hover scale**: `hover:scale-105` for CTAs only; avoid on small controls.
- **Page entrance**: `opacity-0 animate-fade-in-up` with `animation-fill-mode: forwards`.
- **Pulse accents**: `animate-pulse` for background decorative orbs.
- Avoid bouncy easings. Prefer `ease-out` for hover and `cubic-bezier(0.4, 0, 0.2, 1)` where custom.

## Components

### Buttons

- **Primary**: `bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-3 shadow-lg hover:from-blue-700 hover:to-purple-700`.
- **Success**: `bg-gradient-to-r from-green-500 to-emerald-600 text-white` for play/start actions.
- **Secondary/Ghost**: `border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`.
- **Disabled**: `disabled:opacity-60 disabled:cursor-not-allowed`.

### Cards

- Standard card: `rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800`.
- Glass card on hero: `bg-white/10 border-white/10 backdrop-blur-md`.
- Feature card: `p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 hover:-translate-y-1`.

### Badges

- Use `rounded-full px-3 py-1 text-xs font-semibold`.
- Beginner: `bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`.
- Intermediate/Medium: `bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`.
- Advanced/Hard: `bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`.
- Coming soon: `bg-gray-500/20 text-gray-200`.

### Forms

- Labels: `block text-sm font-semibold text-gray-700 dark:text-gray-300`.
- Inputs: `w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`.
- Error states: `border-red-500` with `text-red-700` helper text.

### Tables

- `min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg`.
- Header: `bg-gray-50 dark:bg-gray-700 text-xs uppercase tracking-wider`.
- Rows: `divide-y divide-gray-200 dark:divide-gray-700`.

### Toasts

- Position: top-right fixed.
- Success: `bg-green-600 text-white`.
- Error: `bg-red-600 text-white`.
- Info: `bg-blue-600 text-white`.

## Voice

- Address the user as "you". Avoid "we" overuse except in legal/policy text.
- Use encouraging, mission-oriented language: "Train. Coordinate. Defend.", "Start Level", "Welcome back, recruit."
- Avoid fear-mongering. Phrase security advice as empowering actions.
- Keep error messages helpful and specific.

## Anti-patterns

- Do not introduce new color values outside the approved palette; use Tailwind default scale for consistency.
- Do not use Bootstrap classes in new React components. Use Tailwind and `lucide-react` for icons.
- Do not hardcode colors in components; rely on theme tokens and `dark:` variants.
- Avoid animated auto-playing backgrounds, scrolling marquees, or bouncy transitions.
- Do not modify the legacy Flask `app/` directory for the rewrite; keep it untouched for reference.
