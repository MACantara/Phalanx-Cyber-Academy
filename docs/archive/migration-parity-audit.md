# Phalanx Cyber Academy — Migration Feature & Design Parity Audit

This document inventories the remaining work needed to reach parity between the legacy Flask/Jinja2 application (`app/`) and the new FastAPI + React + TypeScript stack (`backend/` and `frontend/`). It covers the public website, authenticated user flows, admin panel, simulated PC learning levels, and the Blue-vs-Red simulation. Each section lists the legacy source of truth, the current migrated status, and the specific gaps or follow-up actions required.

## How to use this document

- Status key: **Not started**, **Partial**, **Migrated**, **Verified**
- Each item identifies the legacy file(s), the new file(s), and the concrete work still required.
- Items are grouped by surface area and ordered roughly by user-facing impact.

## 1. Public-Facing Pages

### 1.1 Home (`/`)
- **Legacy**: `app/templates/home.html`, `app/routes/main.py`
- **New**: `frontend/src/pages/Home.tsx`
- **Status**: Migrated
- **Progress**:
  - Hero copy, CTA text, and section structure were verified against `app/templates/home.html` and match legacy content.
  - `lucide-react` icons are used in place of Bootstrap Icons.
  - The legacy `home.html` does not contain a statistics or partner-logos section, so none were omitted.

### 1.2 About (`/about`)
- **Legacy**: `app/templates/about.html`
- **New**: `frontend/src/pages/About.tsx`
- **Status**: Migrated
- **Progress**:
  - Hero, mission, learning philosophy, team, and features showcase sections from `app/templates/about.html` are all present in `About.tsx`.
  - Team members, roles, and imagery paths match legacy.
  - `lucide-react` icons replace Bootstrap Icons for cards and checklist.
  - Learning Philosophy card titles and descriptions (`Gamification`, `Real-Time Feedback`, `Real Scenarios`) now match `about.html` exactly.
  - Features Showcase card descriptions match the legacy `about.html` copy.
  - No statistics or timeline sections exist in the legacy `about.html`.

### 1.3 Contact (`/contact`)
- **Legacy**: `app/templates/contact.html`, `app/routes/contact.py`
- **New**: `frontend/src/pages/Contact.tsx`, `backend/app/routers/contact.py`
- **Status**: Migrated
- **Progress**:
  - `Contact.tsx` now mirrors the two-column legacy layout: form on the left and a `Get in Touch` panel on the right with Address and Email cards.
  - Added inline success and error banners that display the messages returned by the backend.
  - Submit button shows a `Send` icon and a "Sending Message..." loading state to match the legacy submit text.

### 1.4 Legal Pages (`/privacy`, `/terms`, `/cookies`)
- **Legacy**: `app/templates/policy-pages/`
- **New**: `frontend/src/pages/Privacy.tsx`, `Terms.tsx`, `Cookies.tsx`
- **Status**: Migrated
- **Progress**:
  - `frontend/src/lib/dates.ts` now uses the same update/effective dates as the legacy `get_policy_dates()` (November 03, 2025, effective 14 days later).
  - The `PolicyLayout` component renders `Last Updated` and `Effective Date` bars for all three pages.
  - Section titles, body copy, and placeholders in `Privacy.tsx`, `Terms.tsx`, and `Cookies.tsx` now match the legacy `policy-pages/*.html` wording.
  - Calendar icons in policy change notices use `lucide-react` `Calendar` instead of emoji.
- **Gaps**:
  - None identified.

### 1.5 Navigation & Footer
- **Legacy**: `app/templates/base.html`, `app/templates/partials/navbar.html`
- **New**: `frontend/src/components/Navbar.tsx`, `Footer.tsx`
- **Status**: Migrated
- **Progress**:
  - `Navbar.tsx` now exposes `Home`, `About`, `Contact`, `Leaderboard`, and a `Games` dropdown for authenticated users containing `Levels` and `Blue Team vs Red Team`.
  - The mobile menu uses the same link ordering and a dedicated `Games` section, matching `partials/navbar.html`.
  - `ThemeToggle.tsx` renders a light/dark/system dropdown and persists the selection in `localStorage`, matching the legacy theme dropdown behavior.
- **Gaps**:
  - None identified.

## 2. Authentication & User Management

### 2.1 Passwordless Email-Code Login
- **Legacy**: `app/routes/auth.py` (`/auth/login`, `/auth/verify-code`)
- **New**: `frontend/src/pages/Login.tsx`, `backend/app/routers/auth.py`
- **Status**: Migrated
- **Progress**:
  - `Login.tsx` now catches 429 responses and surfaces the backend lockout detail in a dedicated inline message (e.g., "Too many failed attempts. Try again in X minutes.").

### 2.2 Signup + Email Verification
- **Legacy**: `app/routes/auth.py`
- **New**: `frontend/src/pages/Signup.tsx`, `Verify.tsx`, `backend/app/routers/auth.py`
- **Status**: Migrated
- **Progress**:
  - `POST /auth/signup` and `POST /auth/login` send a 6-digit code, while `POST /auth/verify` and `POST /auth/verify-signup` authenticate the user.
  - `GET /auth/verify-email/{token}` mirrors the legacy deep-link endpoint, validates the token, and returns the authenticated user (login) or creates the account (signup) using optional query parameters for username/timezone/experience.
  - `Verify.tsx` mirrors the legacy `verify-code` page: it shows the destination email, enforces a 6-digit code entry with auto-advance and paste support, enforces the 15-minute expiry/5-attempt backend validation, and redirects to onboarding or the dashboard after success.

### 2.3 Account Lockout
- **Legacy**: `app/routes/login_attempts.py`, `app/routes/auth.py`
- **New**: `backend/app/services/login_attempt_service.py`, `backend/app/routers/auth.py`
- **Status**: Migrated
- **Progress**:
  - `Login.tsx` displays the lockout message returned by the 429 response inline on the form.
  - `LoginAttempt.is_ip_locked` and `get_lockout_time_remaining` count failed attempts only within the configured `lockout_minutes` window, so the lockout naturally resets after that time.

### 2.4 Profile & Edit Profile
- **Legacy**: `app/routes/profile.py`
- **New**: `frontend/src/pages/Profile.tsx`, `EditProfile.tsx`, `backend/app/routers/users.py`
- **Status**: Migrated
- **Progress**:
  - `EditProfile.tsx` loads the user's existing `timezone` (falling back to the browser-detected IANA zone) and submits it to `PUT /users/me`.
  - `backend/app/routers/users.py` accepts and persists `timezone` through the `UpdateProfilePayload` model.
  - The legacy `edit-profile.html` form only contains `username`, `email`, and `timezone`; the new `EditProfile.tsx` covers the same three fields.
- **Gaps**:
  - None identified.

### 2.5 Onboarding
- **Legacy**: onboarding templates in `app/templates/profile/`
- **New**: `frontend/src/pages/Onboarding.tsx`, `frontend/src/context/AuthContext.tsx`
- **Status**: Migrated
- **Progress**:
  - `AuthContext.tsx` now redirects any authenticated user whose `onboarding_completed` is false to `/onboarding` immediately after the user is loaded.

## 3. Learning Levels (Simulated PC)

### 3.1 Simulated PC Shell
- **Legacy**: `app/static/js/simulated-pc/desktop.js`, `boot-sequence.js`, `shutdown-sequence.js`, `loading-screen.js`
- **New**: `frontend/src/features/simulated-pc/SimulatedPC.tsx`, `components/Desktop.tsx`, `components/BootSequence.tsx`, `components/ShutdownSequence.tsx`
- **Status**: Migrated
- **Progress**:
  - Boot and shutdown text/logs and timing were audited against `boot-sequence.js` and `shutdown-sequence.js`. The React versions now render the same log lines and statuses.
  - Windows now have minimize/restore/close controls; the taskbar restores minimized windows and includes a Start menu with app and shutdown options.
  - Desktop icons are generated from `requiredApps` in `content.config` and are now draggable; their positions are persisted per level in `localStorage`.
- **Gaps**:
  - None identified.

### 3.2 Level 1 — The Misinformation Maze
- **Legacy**: `app/static/js/simulated-pc/levels/level-one/`, `app/routes/levels.py`
- **New**: `frontend/src/features/simulated-pc/levels/LevelOne.tsx`, `apps/BrowserApp.tsx`
- **Status**: Migrated
- **Progress**:
  - `BrowserApp.tsx` has been rebuilt with a URL bar, back navigation, security inspector, and the legacy reference sites (`news-site`, `cyberquest`, `secure-bank`, phishing bank, suspicious scam site).
  - `LevelOne.tsx` now renders a simulated `MisinformationBrowser` with a URL bar, lock/unlock icon, security-inspector sidebar, and `Legitimate News` / `Fake News` classification buttons.
  - The Back/Forward toolbar buttons now navigate through the article list, and answers are tracked per article index so users can revisit articles before finishing.
  - Articles from `level_1/data.json` are loaded into the browser, and `completeSession` is called with the percentage of correctly classified articles, matching the legacy score submission pattern.

### 3.3 Level 2 — Shadow in the Inbox
- **Legacy**: `app/static/js/simulated-pc/levels/level-two/`
- **New**: `frontend/src/features/simulated-pc/levels/LevelTwo.tsx`, `apps/EmailApp.tsx`
- **Status**: Migrated
- **Progress**:
  - `EmailApp.tsx` is now an interactive phishing reader: it loads `content.data.emails`, lets the user classify each message as legitimate or phishing, shows the AI analysis and red flags, and calls `completeSession` with the final score.
  - `LevelTwo.tsx` has been reduced to a thin wrapper that renders `EmailApp`, so the simulated email client now drives the level challenge.
  - Scoring follows the legacy pattern: the percentage of emails classified correctly is submitted as the session score.

### 3.4 Level 3 — Malware Mayhem
- **Legacy**: `app/static/js/simulated-pc/levels/level-three/`, `app/routes/level3_api.py`
- **New**: `frontend/src/features/simulated-pc/levels/LevelThree.tsx`
- **Status**: Migrated
- **Progress**:
  - `LevelThree.tsx` is now a tabbed interface with a process monitor, a malware scanner, and a system-logs view.
  - The process monitor keeps the original terminate-and-score flow: the score is the percentage of malicious processes killed while trusted processes remain running.
  - The malware scanner uses `content.data.malware` entries, lets the user scan files, and toggle quarantine.
  - Scan and quarantine actions now respect the per-malware `scanTime` and `removalTime` values (displaying "Scanning..."/"Quarantining..." while running), matching the legacy timing fields.
  - The system-logs view renders simulated events based on the active process list.

### 3.5 Level 4 — The White Hat Test
- **Legacy**: `app/static/js/simulated-pc/levels/level-four/`, `app/routes/level4_api.py`
- **New**: `frontend/src/features/simulated-pc/levels/LevelFour.tsx`, `apps/TerminalApp.tsx`
- **Status**: Partial
- **Progress**:
  - `TerminalApp.tsx` now implements a virtual Linux filesystem loaded from `level_4/data.json` with `ls`, `cd`, `cat`, `pwd`, `whoami`, `nmap`, `find`, `submit`, `exit`, `clear`, and `help`.
  - `LevelFour.tsx` is now a thin wrapper around `TerminalApp`.
  - Players discover `WHT{...}` flags inside files and submit them; once the configured number of session flags are captured, the terminal calls `completeSession` with the percentage score.
  - `TerminalApp.tsx` now shuffles the full flag library and selects the first `flags_per_session` flags for each session, matching the legacy random-selection behavior.
- **Progress**:
  - The legacy Level 4 "ethical dilemma" is simply responsible-disclosure messaging in the intro dialogue and the `WHT{responsible_disclosure}` flag; this is already reflected in `TerminalApp` prompts and the `level_4/data.json` content.

### 3.6 Level 5 — The Hunt for The Null
- **Legacy**: `app/static/js/simulated-pc/levels/level-five/`, `app/routes/level5_api.py`
- **New**: `frontend/src/features/simulated-pc/levels/LevelFive.tsx`
- **Status**: Partial
- **Progress**:
  - `LevelFive.tsx` now renders a two-pane investigation hub: suspects on the left and an evidence-trail panel on the right.
  - Selecting a suspect shows their `evidence_trail` with title, source, description, finding, and recursively rendered `evidence_data`.
  - Users identify suspects and submit the investigation; the score is based on how many null members were identified.
  - A **Forensic Report Preview** section was added: it generates a formatted text report from the case metadata, suspect list, and evidence trail, with Copy-to-Clipboard and Download text-file buttons.
- **Gaps**:
  - Verify suspect-selection scoring matches the legacy investigation flow.

## 4. Blue vs Red (BvR)

### 4.1 Introduction & Tutorial
- **Legacy**: `app/templates/blue-team-vs-red-team-mode/`
- **New**: `frontend/src/pages/blue-vs-red/Introduction.tsx`, `Tutorial.tsx`
- **Status**: Migrated
- **Progress**:
  - `Introduction.tsx` mirrors the legacy hero, CTA card, and three-column overview layout, using `lucide-react` equivalents of the Bootstrap icons.
  - `Tutorial.tsx` covers the blue tools, red-tactics grid, feature highlights, and pro-tips from the legacy tutorial.
  - `App.tsx` routes `/blue-vs-red/tutorial` to `BlueVsRedTutorial` and the Introduction links to the correct route.

### 4.2 BvR Dashboard
- **Legacy**: `app/routes/blue_team_vs_red_team_mode/__init__.py`
- **New**: `frontend/src/pages/blue-vs-red/Dashboard.tsx`, `backend/app/routers/blue_vs_red.py`
- **Status**: Migrated
- **Progress**:
  - A countdown timer decrements each second and calls `stop-game` when it reaches zero.
  - An automated AI-attack loop posts an attack to `/blue-vs-red/ai-action` every 5 seconds and refreshes the game state.
  - The results overlay displays final score, completion bonus, and XP awarded from `/blue-vs-red/stop-game`.
  - `stop-game` and `exit-game` call `Session.end_session` and `XPManager.award_session_xp` to persist sessions and award XP.
  - Player actions, AI actions, asset integrity, alerts, and incident state are managed in the backend game state.
- **Gaps**:
  - Stabilize timing/intervals through runtime testing once the game is played end-to-end.

### 4.3 BvR Backend
- **Legacy**: `app/routes/blue_team_vs_red_team_mode/__init__.py`
- **New**: `backend/app/routers/blue_vs_red.py`
- **Status**: Migrated
- **Progress**:
  - `Session.end_session` and `XPManager.award_session_xp` are called consistently in `stop-game`, `exit-game`, and `reset-game`.
  - The `ai-action` endpoint now advances `currentPhase` through the MITRE ATT&CK chain on each successful attack, matching the legacy phase progression.
  - BvR game state is now loaded from `bvr_game_states` on `_get_state` and saved after every mutation (`start-game`, `update-game-state`, `player-action`, `ai-action`, `stop-game`, `reset-game`, `exit-game`), so the game survives server restarts.
- **Gaps**:
  - Runtime testing is needed to confirm timing/intervals match the desired difficulty curve.

### 4.4 Red-Team NLP API
- **Legacy**: `app/routes/red_team_nlp_api.py`
- **New**: `backend/app/routers/blue_vs_red.py` (`/ai-action`)
- **Status**: Migrated
- **Progress**:
  - The legacy NLP red-team AI is replaced by a deterministic AI-attack loop in the BvR Dashboard.
  - `Dashboard.tsx` posts attacks to `/blue-vs-red/ai-action` every 5 seconds with randomly chosen targets, techniques, and severities.
  - The FastAPI endpoint applies integrity loss, generates alerts, tracks blocked IPs, and updates the per-user game state.
- **Gaps**:
  - Swap in a real NLP/ML model when the dependency is ready; the interface and state effects are already wired.

## 5. Admin Panel

### 5.1 Admin Dashboard / Analytics
- **Legacy**: `app/routes/admin/data_analytics.py`, `admin_core.py`, `app/templates/admin/dashboard/`
- **New**: `frontend/src/pages/admin/Analytics.tsx`, `backend/app/routers/admin.py`
- **Status**: Migrated
- **Progress**:
  - `GET /admin/analytics/dashboard` returns user, signup, session, and score totals.
  - `GET /admin/analytics/levels` returns per-level session counts, completions, and average scores.
  - `Analytics.tsx` displays dashboard stat cards and a per-level progress bar chart.

### 5.2 Users List & User Details
- **Legacy**: `app/routes/admin/admin_core.py`, `app/templates/admin/users/`, `user-details/`
- **New**: `frontend/src/pages/admin/Users.tsx`, `UserDetails.tsx`, `backend/app/routers/admin.py`
- **Status**: Migrated
- **Progress**:
  - `Users.tsx` now has inline activate/deactivate and admin-role toggle buttons that call `/admin/users/{id}/actions`.
  - Added `POST /admin/users/{id}/xp` to grant XP and an inline grant input/button on `UserDetails.tsx`.
  - Added `POST /admin/users` to create user accounts and a create-user form on `Users.tsx`.
  - Explicit lock/unlock is covered by the `toggle_active` admin action; a legacy password reset is not applicable because the new stack uses passwordless email-code authentication.
  - `UserDetails.tsx` covers the legacy activity views (overview, sessions, login attempts, email verifications) and adds a grant-XP control.

### 5.3 Logs
- **Legacy**: `app/routes/admin/logs.py`, `app/templates/admin/logs/`
- **New**: `frontend/src/pages/admin/Logs.tsx`, `backend/app/routers/admin.py`
- **Status**: Migrated
- **Progress**:
  - `_get_logs` now aggregates `login_attempts`, `email_verifications`, `contact_submissions`, `sessions`, and `users` (registrations).
  - `GET /admin/logs` supports `search` and `event_type` filters.
  - `GET /admin/logs/export` streams a CSV of filtered logs.
  - `Logs.tsx` exposes the event-type filter dropdown and an `Export CSV` button.
  - Admin actions (`create_user`, `grant_xp`, `toggle_active`, `toggle_admin`, `delete_user`) are recorded in `admin_audit_logs` by `backend/app/routers/admin.py`.
- **Gaps**:
  - Add additional sources if legacy tracks backups or scheduled jobs.

### 5.4 Backup & Schedule
- **Legacy**: `app/routes/admin/system_backup.py`, `app/templates/admin/system-backup/`
- **New**: `frontend/src/pages/admin/Backup.tsx`, `Schedule.tsx`, `backend/app/routers/backup.py`
- **Status**: Migrated
- **Progress**:
  - `Backup.tsx` and `Schedule.tsx` call `/admin/backups/backups` and `/admin/backups/schedule` endpoints in `backend/app/routers/backup.py`.
  - The backend endpoints are implemented with a clearly marked in-memory mock store (`_fake_backups`, `_fake_schedule`) so create, restore, delete, and schedule operations work from the UI while remaining explicitly stubbed.
- **Gaps**:
  - Replace the in-memory store with real persistence/operations if required.

### 5.5 Reports
- **Legacy**: `app/routes/reports.py`
- **New**: `frontend/src/pages/admin/Reports.tsx`, `backend/app/routers/reports.py`
- **Status**: Migrated
- **Progress**:
  - `Reports.tsx` lets admins select a user and download a `.docx` certificate.
  - `backend/app/routers/reports.py` generates the certificate via `python-docx` and streams it back at `GET /admin/reports/certificate/{user_id}`.
- **Gaps**:
  - Add other legacy report types (analytics export, user activity PDF) if needed.

## 6. Backend APIs & Services

### 6.1 Levels API
- **Legacy**: `app/routes/levels.py` (28 KB)
- **New**: `backend/app/routers/levels.py` (1 KB)
- **Status**: Partial
- **Progress**:
  - `GET /levels/`, `GET /levels/available`, and `GET /levels/{level_id}` are implemented and consumed by `Levels.tsx` and `Level.tsx`.
  - `GET /levels/{level_id}/content` was added to serve the per-level JSON data bundle (`data.json`) from `backend/app/data/level_content/level_{level_id}/data.json`.
  - `GET /levels/` now applies sequential unlocking when `X-User-Id` is supplied: a level is marked `unlocked` if the previous level has a completed session (or it is level 1), and it is marked `completed` for levels with completed sessions.
- **Gaps**:
  - Add richer admin level management if available in legacy.

### 6.2 XP API
- **Legacy**: `app/routes/xp_api.py`
- **New**: `backend/app/routers/xp.py`, `backend/app/services/xp_award.py`, `xp_history_service.py`
- **Status**: Migrated
- **Progress**:
  - `GET /xp/leaderboard` now enriches entries with `username` and `level` and matches the `Leaderboard.tsx` interface.
  - `GET /xp/history` now returns the authenticated user's own history instead of global recent activity.
  - `GET /xp/config` returns the public XP calculation constants for frontend consistency.
  - `POST /xp/recalculate` recomputes the current user's total XP from session history and persists it to `users.total_xp`.
  - `GET /xp/badges` returns the badge catalog alongside the user's earned badges from `badges`/`user_badges`.
  - `GET /xp/streak` returns the user's current and longest daily login streak from `user_streaks`.
  - `POST /auth/verify`, `POST /auth/verify-signup`, and `GET /auth/verify-email/{token}` update the user's streak on a successful login/signup.
  - `XPManager` now calls `_sync_badges` whenever total XP changes, awarding any badge whose `xp_threshold` the user has crossed.
  - Default XP threshold badges are seeded in `supabase_schema.sql`.

### 6.3 Level3 / Level4 / Level5 APIs
- **Legacy**: `app/routes/level3_api.py`, `level4_api.py`, `level5_api.py`
- **New**: Content served from `backend/app/data/level_content/`
- **Status**: Migrated
- **Progress**:
  - Scenario data (processes, malware, emails, filesystems, suspects/evidence) is shipped as `data.json` bundles under `backend/app/data/level_content/`.
  - Scoring logic for Levels 1–5 lives in the React components (`LevelOne.tsx` through `LevelFive.tsx`) using the `content` data.
  - Level 4 shuffles flags each session; Level 5 provides a generated forensic report.
- **Gaps**:
  - None identified.

## 7. Database / Supabase

- **Schema**: `supabase_schema.sql`
- **Legacy models**: `app/models/`
- **Status**: Migrated
- **Progress**:
  - Core tables (`users`, `contact_submissions`, `login_attempts`, `email_verifications`, `levels`, `sessions`, `xp_history`) are implemented and align with the active `User`, `Contact`, `LoginAttempt`, `EmailVerification`, `Level`, `Session`, and `XPHistory` models.
  - The new backend derives `sessions.completed` from `end_time IS NOT NULL` and `sessions.average_score` from the per-level score data, so no extra `completed`/`average_score` columns are required.
  - Extended `supabase_schema.sql` with parity tables: `badges`, `user_badges`, `user_streaks`, `bvr_game_states`, `admin_audit_logs`, and `scheduled_jobs`, plus indexes and RLS policies.
  - `level_content` remains served as JSON bundles from `backend/app/data/level_content/`, matching the legacy pattern of static JS/JSON level data files.
- **Gaps**:
  - None identified.

## 8. Assets & Static Files

- **Status**: Migrated
- **Progress**:
  - Avatars (`Cipher_Neutral_Talking.gif`, `default.png`) copied to `frontend/public/images/avatars/`.
  - Team member images copied from `app/static/images/team-members/` to `frontend/public/images/team/`.
  - Logos copied from `app/static/images/logos/` to `frontend/public/images/logos/`.
  - Level-one image (`senator-johnson.jpeg`) copied to `frontend/public/images/level-one/`.
  - `About.tsx` references `/team/santos.png` etc., which now map to `frontend/public/images/team/`.
  - `Home.tsx` references `/logo-bg.png` and `/logo.png` from the public root.
- **Gaps**:
  - None identified.
- **Legacy CSS/JS**: do not copy; re-implement behavior with Tailwind and React.
- **Icons**: use `lucide-react` only; do not introduce Bootstrap Icons.

## 9. Recommended Roadmap

1. **Completed**
   - Wire the `bvr_game_states` table to the BvR backend so state survives restarts and server reloads.
   - Wire `admin_audit_logs` to admin actions for audit parity.
   - Award badges automatically on XP thresholds by linking `xp_history`/`users.total_xp` to `badges`/`user_badges`.
   - Run end-to-end smoke tests for the migrated public and protected backend flows.

2. **Medium-Term (optional)**
   - Integrate a real red-team NLP/ML model once the dependency is ready; the deterministic replacement is already wired.

3. **Long-Term**
   - Add richer admin reports beyond the current certificate export and logs/analytics.
   - Comprehensive E2E and visual regression coverage.

## 10. Verification Checklist

For each migrated feature:
- `npx tsc --noEmit` passes.
- `npm run build` passes.
- `python -m compileall -q app backend\app` passes.
- Runtime smoke tests confirm the backend boots and public endpoints (`/api/levels/`, `/api/xp/config`) respond correctly.
- Manual side-by-side with the legacy page or flow.
