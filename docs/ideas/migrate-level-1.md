# Migrate Level 1 to Article Sandbox

## Problem Statement

How might we migrate the last legacy SimulatedPC level, *The Misinformation Maze*, into a data-driven `article-sandbox` format that lets learners judge credible vs. misleading articles, so the `LegacyRenderer` and `LegacyContent` types can finally be removed?

## Recommended Direction

Use the existing `article-sandbox` content type for Level 1. The 30 legacy articles already match the `Article` type, and `label: 0` maps to `legitimate_news` while `label: 1` maps to `fake_news`. Build an `ArticleSandboxRenderer` that presents one article at a time, lets the learner classify it as **Credible** or **Misinformation**, and records the result.

The legacy scoring model is richer than the current `ScoringRules` type: it has `maxScore: 1000`, `penalties` (incorrect classification and missed fake news), and `bonuses` (accuracy and perfect score). Preserve this by extending `ScoringRules` with optional `penalties` and `bonuses` fields and letting the `ArticleSandboxRenderer` compute the final score, then call `completeSession(finalScore)`. A small `SimulatedPC.tsx` change will prevent the `score` from being overwritten once the session is completed.

Keep the `briefing` and `completion` narratives by folding the legacy `dialogues.json` into `BaseContent.dialogues` or `instructions`.

Once Level 1 works, remove `LegacyRenderer`, `LegacyContent`, and the `legacy` fallback from `types.ts` and `renderers/index.ts`.

## Key Assumptions to Validate

- [ ] `label: 0` consistently means `legitimate_news` and `label: 1` means `fake_news` across all 30 articles.
- [ ] The existing `Article` type is sufficient; only the renderer and scoring logic are missing.
- [ ] `ScoringRules` can be extended with optional `penalties` and `bonuses` without breaking `case-story` or `email-sandbox` levels.
- [ ] The `completeSession(finalScore)` API is robust enough to accept a precomputed score and not be overwritten by the `scoringEvents` `useEffect`.
- [ ] Removing `LegacyRenderer` will not affect any other part of the app once Level 1 is migrated.

## MVP Scope

- Audit `level_1/data.json`, `config.json`, `dialogues.json`, and `news_articles.json`.
- Extend `ScoringRules` in `types.ts` with optional `penalties` and `bonuses`.
- Build `frontend/src/features/simulated-pc/renderers/ArticleSandboxRenderer.tsx`.
- Register `article-sandbox` in `frontend/src/features/simulated-pc/renderers/index.ts`.
- Convert `backend/app/data/level_content/level_1/data.json` to `ArticleSandboxContent`.
- Preserve `briefing`/`completion` narrative and legacy scoring rules in the new `data.json`.
- Update `SimulatedPC.tsx` so `score` is not overwritten after `completeSession` is called.
- Remove `LegacyRenderer`, `LegacyContent`, and the `legacy` type from `types.ts` and `renderers/index.ts`.
- Delete old `level_1` split files (`config.json`, `dialogues.json`, `news_articles.json`).
- Run `npx tsc --noEmit` and `npm run build`.

## Not Doing (and Why)

- **No new content type** — `article-sandbox` already exists and the data already matches it.
- **No new authoring UI** — the migration is the priority, not a no-code editor.
- **No real article-shuffling algorithm** — keep articles in the order they appear in `data.json`; adaptive replay can be added later.

## Decisions

- **Article display** — one article at a time, with a "Next" button that advances to the next article.
- **Classification submission** — per-article: the learner clicks **Credible** or **Misinformation** for each article before moving on.
- **`news_articles.json`** — merge its content into `data.json`, then delete the old `news_articles.json` file.
