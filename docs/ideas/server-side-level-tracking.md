# Server-side Tracking of Learning Sessions and XP

Status: Draft

This document outlines a plan to implement server-side tracking of learning sessions and XP in Phalanx Cyber Academy. It relies on the existing client-side level completion logic found under `app/static/js/simulated-pc/levels/` and introduces a robust back-end system to record session activity, XP awards, and history.

## Goals

- Record learning sessions on the server reliably for both levels and Blue Team vs Red Team Mode.
- Calculate and persist XP awards per session and maintain XP history for audit and rollback.
- Support idempotent session management, preventing duplicate session creation.
- Provide APIs for querying user progress and XP history.
- Ensure secure, authenticated endpoints with input validation and rate limiting.
- Provide migration scripts and tests.

## Background / Motivation

Client-side completion events are currently stored or handled in the browser. To support multi-device continuity, anti-fraud measures, and analytics, sessions and XP must be persisted server-side.

The client-side code to inspect: `app/static/js/simulated-pc/levels/` — each level's completion logic should emit an event or call the server API when the level is started and completed.

## High-level Design

1. Client starts a session (POST) to server when beginning a level or Blue Team vs Red Team Mode
2. Server validates authentication, creates session record with start_time
3. Client ends session (POST) with score when level/mode is completed
4. Server calculates XP (using same formula as client or centralized service), stores session end_time and score, creates `xp_change` entry and updates user's total XP
5. Server responds with the awarded XP and new total
6. Optional: Server can enqueue post-processing tasks (notifications, achievements, analytics)

## Data Model

Proposed new tables (SQL examples provided later):

- `sessions`
  - `id` (PK)
  - `user_id` (FK -> users.id)
  - `session_name` (string) -- Level name or 'Blue Team vs Red Team Mode'
  - `score` (int)
  - `start_time` (timestamp)
  - `end_time` (timestamp) -- NULL while session is active
  - `created_at` (timestamp)

- `xp_history`
  - `id` (PK)
  - `user_id` (FK -> users.id)
  - `delta` (int) -- positive or negative XP change
  - `reason` (string) -- e.g., 'session_completion', 'manual_adjustment'
  - `reference_id` (nullable) -- e.g., sessions.id
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

- POST /api/sessions/start
  - Auth: Required (flask-login session or bearer token)
  - Body (JSON):
    {
      "session_name": "The Misinformation Maze" // or "Blue Team vs Red Team Mode"
    }
  - Response (200):
    {
      "success": true,
      "session_id": 123,
      "session_name": "The Misinformation Maze",
      "start_time": "2025-09-18T14:30:00Z"
    }
  - Error codes: 400 (bad request), 401 (unauth), 429 (rate limit)

- POST /api/sessions/end
  - Auth: Required (flask-login session or bearer token)
  - Body (JSON):
    {
      "session_id": 123,
      "score": 85 // optional
    }
  - Response (200):
    {
      "success": true,
      "session_id": 123,
      "awarded_xp": 50,
      "new_total_xp": 1250,
      "time_spent": 120, // seconds
      "session": {
         "session_name": "The Misinformation Maze",
         "score": 85,
         "start_time": "2025-09-18T14:30:00Z",
         "end_time": "2025-09-18T14:32:00Z"
      }
    }
  - Error codes: 400 (bad request), 401 (unauth), 404 (session not found), 429 (rate limit)

- GET /api/sessions/progress
  - Returns user's completed sessions and XP summary

- GET /api/xp/history
  - Returns paginated XP changes

## Session Management

- Sessions are created when a user starts a level or Blue Team vs Red Team Mode
- Sessions track start_time automatically and end_time when completed
- time_spent is calculated as the difference between start_time and end_time
- Active sessions have end_time = NULL
- Only one active session per user is recommended (though not enforced)

Note: the server will validate `session_name` against known level names and 'Blue Team vs Red Team Mode' to ensure data consistency.

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
- Validate session_name against known levels to prevent fake sessions
- Rate-limit session starts/ends per user per minute/IP
- Verify score is within expected bounds
- Use server-side XP calculation and only accept metadata fields explicitly whitelisted

## Migrations

- Provide Alembic migration to add `sessions` and `xp_history` tables and add `total_xp` to users or user_profiles

Example migration SQL (Alembic snippet):

-- create sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_name TEXT NOT NULL,
    score INTEGER,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions can reference level names or special session types like 'Blue Team vs Red Team Mode'

## Server-side Implementation Steps

1. Add database models: `Session`, `XPHistory` in `app/models/` with CRUD helpers
2. Add Alembic migration
3. Implement XP calculation utility in `app/utils/xp.py`
4. Implement Flask endpoints (`app/routes/levels.py` or `app/routes/api/levels.py`)
   - Validate, create session records, end sessions and update totals in a transaction
5. Hook into existing client-side completion logic in `app/static/js/simulated-pc/levels/` to start/end sessions
6. Add unit tests and integration tests
7. Rollout: feature flag behind `ENABLE_SERVER_SIDE_TRACKING` config

## Client Integration (JS)

- Before level start, send POST to `/api/sessions/start` with session_name
- Store returned session_id for later use
- After level completion, send POST to `/api/sessions/end` with session_id and score
- Handle server responses for session tracking
- Retry logic: exponential backoff for transient failures

Note: Leaderboards are intentionally not implemented as a first-class feature in this design. If needed later, leaderboards can be generated efficiently from `xp_history` aggregates (e.g., daily/weekly/monthly snapshots) or by summing `users.total_xp`. Keeping leaderboards derived rather than primary reduces write amplification and simplifies data integrity.

Client sample (pseudo-code):

```js
// Start session
const startPayload = {
  session_name: LEVEL_NAME // or 'Blue Team vs Red Team Mode'
};

const sessionResponse = await fetch('/api/sessions/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(startPayload),
  credentials: 'include'
});

const sessionData = await sessionResponse.json();
const sessionId = sessionData.session_id;

// ... user plays level/mode ...

// End session
const endPayload = {
  session_id: sessionId,
  score: finalScore
};

fetch('/api/sessions/end', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(endPayload),
  credentials: 'include'
}).then(r => r.json()).then(data => {
  if (data.success) {
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