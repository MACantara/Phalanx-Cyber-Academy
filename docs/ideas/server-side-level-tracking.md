# Server-side Tracking of Level Completion and XP

Status: Draft

This document outlines a plan to implement server-side tracking of level completion and XP in CyberQuest. It relies on the existing client-side level completion logic found under `app/static/js/simulated-pc/levels/` and introduces a robust back-end system to record completions, XP awards, and history.

## Goals

- Record level completions on the server reliably.
- Calculate and persist XP awards per completion and maintain XP history for audit and rollback.
- Support idempotent submission from clients, preventing double-counting.
 - Provide APIs for querying user progress and XP history.
- Ensure secure, authenticated endpoints with input validation and rate limiting.
- Provide migration scripts and tests.

## Background / Motivation

Client-side completion events are currently stored or handled in the browser. To support multi-device continuity, anti-fraud measures, and analytics, completions and XP must be persisted server-side.

The client-side code to inspect: `app/static/js/simulated-pc/levels/` — each level's completion logic should emit an event or call the server API when the level is completed.

## High-level Design

1. Client emits a completion event (POST) to server with payload: user_id (or inferred server-side), level_id, level_type, score, time_spent, difficulty, metadata (optional), client_generated_event_id (UUID)
2. Server validates authentication, checks idempotency (based on client_generated_event_id or combination of user_id+level_id+timestamp), records completion if new
3. Server calculates XP (using same formula as client or centralized service), stores a `xp_change` entry and updates user's total XP
4. Server responds with the awarded XP and new total
5. Optional: Server can enqueue post-processing tasks (notifications, achievements, analytics)

## Data Model

Proposed new tables (SQL examples provided later):

- `level_completions`
  - `id` (PK)
  - `user_id` (FK -> users.id)
  - `level_id` (string or int)
  - `level_type` (string)
  - `score` (int)
  - `time_spent` (int) -- seconds
  - `difficulty` (string)
  - `metadata` (json)
  - `client_event_id` (uuid/null) -- optional, for idempotency
  - `created_at` (timestamp)
  - `source` (string) -- e.g., 'web', 'api'

- `xp_history`
  - `id` (PK)
  - `user_id` (FK -> users.id)
  - `delta` (int) -- positive or negative XP change
  - `reason` (string) -- e.g., 'level_completion', 'manual_adjustment'
  - `reference_id` (nullable) -- e.g., level_completions.id
  - `balance_after` (int) -- user total XP after applying delta
  - `metadata` (json)
  - `created_at` (timestamp)

- `user_profiles` (if not present) extend users table with `total_xp` and `level_progress` as needed

- `levels`
  - `id` (PK)
  - `level_id` (string or int, unique) -- the client-side identifier (e.g., 1 or 'level-1')
  - `name` (string)
  - `description` (text)
  - `category` (string) -- grouping/category (matches `category` in `levels.py`)
  - `icon` (string) -- icon name used in UI (e.g. 'bi-trophy')
  - `estimated_time` (string) -- human-readable (e.g. '15 minutes')
  - `expected_time_seconds` (int) -- canonical expected time in seconds (optional)
  - `xp_reward` (int) -- XP reward for completion (maps to `xp_reward` in `levels.py`)
  - `skills` (json) -- array of skills the level teaches (maps to `skills` in `levels.py`)
  - `difficulty` (string) -- canonical difficulty for the level
  - `unlocked` (boolean) -- whether level is available
  - `coming_soon` (boolean)
  - `metadata` (json)
  - `created_at` (timestamp)

## API Contract

- POST /api/levels/complete
  - Auth: Required (flask-login session or bearer token)
  - Body (JSON):
    {
      "level_id": "level-1",
      "level_type": "simulation",
      "score": 850,
      "time_spent": 120, // seconds
      "difficulty": "normal",
      "metadata": { ... },
      "client_event_id": "uuid-v4-string"
    }
  - Response (200):
    {
      "success": true,
      "awarded_xp": 50,
      "new_total_xp": 1250,
      "is_new_completion": true,
      "level": {
         "level_id": 1,
         "name": "The Misinformation Maze",
         "xp_reward": 100,
         "icon": "bi-newspaper",
         "category": "Information Literacy",
         "estimated_time": "15 minutes",
         "skills": ["Critical Thinking","Source Verification","Fact Checking"],
         "unlocked": true,
         "coming_soon": false
      }
    }
  - Error codes: 400 (bad request), 401 (unauth), 429 (rate limit), 409 (duplicate)

- GET /api/levels/progress
  - Returns user's completed levels and XP summary

- GET /api/xp/history
  - Returns paginated XP changes

## Idempotency and Duplication Handling

- If the client sends `client_event_id`, the server will check `level_completions.client_event_id` for existing record and return existing result.
- If missing, server will fallback to dedup logic: combination of (user_id, level_id, created_at within short window, score) to detect duplicates.
- The API should return `is_new_completion: false` when duplicate detected.

Note: the server will validate `level_id` against the new `levels` table when available and attach canonical level information to the response.

## XP Calculation

- Prefer centralizing XP calculation server-side to prevent client tampering.
- Suggested formula (configurable):
  - base_xp = 10 + floor(score / 100)
  - difficulty multiplier: easy=0.8, normal=1.0, hard=1.2
  - time bonus: small bonus if time_spent < expected_time
  - no-hint bonus: if metadata.hints_used == 0

- Implement XP calculation function in Python (`app/utils/xp.py`) and reuse in both API and background tasks.

## Security

- Require authentication (Flask-Login current_user) or API tokens
- Validate level_id against known levels to prevent fake levels
- Rate-limit submissions per user per minute/IP
- Verify score is within expected bounds
- Use server-side XP calculation and only accept metadata fields explicitly whitelisted

## Migrations

- Provide Alembic migration to add `level_completions` and `xp_history` tables and add `total_xp` to users or user_profiles

Example migration SQL (Alembic snippet):

-- create level_completions
CREATE TABLE level_completions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    level_id TEXT NOT NULL,
    level_type TEXT,
    score INTEGER,
    time_spent INTEGER,
    difficulty TEXT,
    metadata JSONB,
    client_event_id UUID,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create xp_history
CREATE TABLE xp_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id INTEGER,
    balance_after INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- add total_xp to users
ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;

-- create levels table
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  level_id TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  module TEXT,
  expected_time_seconds INTEGER,
  base_xp INTEGER DEFAULT 0,
  difficulty TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- link level_completions.level_id to levels.level_id (application-level foreign key)
-- Optionally, you may migrate level_completions.level_id to a FK using an integer levels.id column for stricter integrity.

## Server-side Implementation Steps

1. Add database models: `LevelCompletion`, `XPHistory` in `app/models/` with CRUD helpers
2. Add Alembic migration
3. Implement XP calculation utility in `app/utils/xp.py`
4. Implement Flask endpoints (`app/routes/levels.py` or `app/routes/api/levels.py`)
   - Validate, deduplicate, create records, update totals in a transaction
5. Hook into existing client-side completion logic in `app/static/js/simulated-pc/levels/` to POST completions
6. Add unit tests and integration tests
7. Rollout: feature flag behind `ENABLE_SERVER_SIDE_TRACKING` config

## Client Integration (JS)

- After level completion, send POST to `/api/levels/complete` with payload above
- Include a client_event_id UUID generated per completion attempt
- Handle server responses: if `is_new_completion` is false, don't award duplicate XP locally
- Retry logic: exponential backoff for transient failures

Note: Leaderboards are intentionally not implemented as a first-class feature in this design. If needed later, leaderboards can be generated efficiently from `xp_history` aggregates (e.g., daily/weekly/monthly snapshots) or by summing `users.total_xp`. Keeping leaderboards derived rather than primary reduces write amplification and simplifies data integrity.

Client sample (pseudo-code):

```js
const payload = {
  level_id: LEVEL_ID,
  level_type: LEVEL_TYPE,
  score: score,
  time_spent: elapsedSeconds,
  difficulty: difficulty,
  metadata: { hints_used, mistakes },
  client_event_id: generateUUID()
};

fetch('/api/levels/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  credentials: 'include'
}).then(r => r.json()).then(data => {
  if (data.success && data.is_new_completion) {
    // Update UI, show awarded XP, sync local state
  }
});
```

## Tests

- Unit tests for XP calculation edge cases
- API tests for idempotency and validation
- Integration test simulating multiple submissions

## Rollout Plan

- Add feature flag `ENABLE_SERVER_SIDE_TRACKING` in config
- Deploy code disabled, run migrations in staging
- Enable in staging, request QA testing
- Enable in production for a subset of users (5-10%) and monitor
- Full rollout after validation

## Open Questions

- Should we tie completions to `user_progress` model if already exists? (Yes, reuse existing models when possible)
- Do we need to store raw client payload for forensics? (store sanitized metadata only)
- What is the expected retention period for `xp_history`? (suggest 1 year archiving policy)

## Next Steps

- Implement models and migration (todo #2)
- Implement API and client samples (todo #3)
- Add tests and QA plan

---

*Document created by automated assistant on request.*