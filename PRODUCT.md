# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Self-directed learners (students, career-switchers, general learners building digital-literacy and cybersecurity skills) and educators/institutions evaluating the platform for classes — the landing page must persuade both equally.

## Product Purpose

Game-based cybersecurity learning platform. Teaches phishing detection, malware response, misinformation defense, ethical hacking, and digital forensics through level-based missions, XP, badges, and simulated scenarios in a safe environment. Success: learners sign up, complete onboarding, and progress through levels; institutions trust it as real training.

## Positioning

Cybersecurity education structured as a training academy with missions — real attack scenarios played safely — rather than video courses or capture-the-flag tooling that assumes prior skill.

## Operating Context

Web app with marketing pages (landing, about, legal), auth (Clerk), onboarding (username, experience, timezone), dashboard with XP/levels/streaks/leaderboard, per-level simulated scenarios, admin panel. Vercel-hosted; Docker for local dev.

## Capabilities and Constraints

Confirmed: Clerk auth (email + Google OAuth), profiles with onboarding gate, levels/scenarios, XP history, sessions, badges, streaks, leaderboard, admin panel. Both light and dark themes ship and are equally supported.

## Brand Commitments

Binding: the name "Phalanx Cyber Academy", the shield logo (`frontend/public/logo-bg.png`), and the mission/academy voice ("Train. Coordinate. Defend.", "recruit", "Mission Not Found", "Return to Base"). All other visual decisions are open for replacement.

## Evidence on Hand

Real scenario content: The Misinformation Maze, Shadow in the Inbox, Malware Mayhem, The White Hat Test, The Hunt for The Null. Logo asset at `frontend/public/logo-bg.png`. No testimonials, metrics, or named customers — do not fabricate them.

## Product Principles

- Credible training, playful delivery: the surface must prove both at once.
- Mission language is the product's grammar; every surface speaks it.
- Learning content must stay readable and navigable over decoration.
- Dual light/dark themes are a commitment, not a toggle-afterthought.
