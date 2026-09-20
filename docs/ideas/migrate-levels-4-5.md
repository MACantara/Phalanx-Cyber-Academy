# Migrate Levels 4 & 5 to the Data-Driven Engine

## Problem Statement

The legacy SimulatedPC levels 4 and 5 are too bloated for a single level. Learners lose focus and the content becomes harder to maintain. We need to decompose them into smaller, goal-driven experiences and finish replacing the legacy renderer.

## Recommended Direction

Replace the old levels 4 and 5 with five new, sequentially numbered levels. Each new level uses the `SimulationContent` schema and the existing `CaseStoryRenderer` where possible. A dedicated Evidence Viewer will handle Level 5 artifacts that do not fit in a text file. Leave Level 1 as legacy until the new levels are proven, then migrate it last.

Proposed split with new sequential IDs:

- **Level 4** → `4` Network Reconnaissance (`case-story` with terminal evidence)
- **Level 5** → `5` Responsible Vulnerability Disclosure (`case-story`)
- **Level 6** → `6` Evidence Acquisition & Chain of Custody (`case-story`)
- **Level 7** → `7` Evidence Analysis: laptop, memory, logs (`case-story` with a dedicated evidence viewer)
- **Level 8** → `8` Forensic Report & Identify The Null (`case-story`)

## Key Assumptions to Validate

- [ ] The existing Level 4 `data.json` can be cleanly separated into "nmap/recon" and "responsible disclosure" without losing narrative.
- [ ] Level 5's three workflow phases can each stand alone as 10-15 minute case stories.
- [ ] A dedicated evidence viewer can render Level 5 artifacts (laptop image, memory dump, network logs) better than plain `FileItem` content.
- [ ] The `levels` table can be updated with new `level_id` rows (4-8) and `coming_soon` flags without breaking the dashboard.

## MVP Scope

- Audit existing `data.json` and `config.json` for the old Levels 4 and 5.
- Define new `case-story` JSON bundles for `4`, `5`, `6`, `7`, and `8`.
- Build or extend an Evidence Viewer to render images, hex dumps, and packet summaries for Level 7 artifacts.
- Add new level metadata to `supabase_schema.sql` and `backend/app/data/level_content/level_{4..8}/data.json`.
- Set `coming_soon` to `true` for the new levels while their data is being authored, then flip to `false` as each one is ready.
- Update `frontend/src/pages/Levels.tsx` and `Dashboard.tsx` to list the new levels.
- Remove legacy split files (`config.json`, `dialogues.json`) for the old Levels 4 and 5.

## Not Doing (and Why)

- **Level 1 migration**: it is a simpler legacy level and a good last migration candidate; keep scope on 4/5 first.
- **New `terminal-ctf` renderer**: the terminal content can be represented as `FileItem` or `terminal` evidence inside `case-story` for now.
- **Authoring UI / no-code editor**: valuable later, but it does not help ship the migration and it is not the learner's pain.
- **Adaptive replay for case stories**: the engine supports it, but the first pass should be static; add replay only if the split proves it is needed.

## Decisions

- **Level IDs**: use new sequential IDs `4-8`. The old levels 4 and 5 are removed, so their numbers are reassigned to the first two split levels.
- **`coming_soon` flags**: yes. Add the new `level_id` rows early with `coming_soon: true`, then flip them to `false` as each level's `data.json` is ready.
- **Evidence viewer**: yes. A dedicated evidence viewer is appropriate for the laptop image, memory dump, and network logs in the forensics levels.
