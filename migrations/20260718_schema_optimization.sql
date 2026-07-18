-- 2026-07-18 Schema optimization migration for Phalanx Cyber Academy
-- Removes deprecated/unused columns and the system_test_plans table.

-- 1. Remove deprecated auth column
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- 2. Ensure total_xp exists on users (idempotent; may already be present)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- 3. Remove unused level columns
ALTER TABLE public.levels DROP COLUMN IF EXISTS expected_time_seconds;
ALTER TABLE public.levels DROP COLUMN IF EXISTS requirements;

-- 4. Enforce known difficulty values
ALTER TABLE public.levels DROP CONSTRAINT IF EXISTS chk_difficulty;
ALTER TABLE public.levels ADD CONSTRAINT chk_difficulty CHECK (difficulty IN ('easy', 'medium', 'intermediate', 'hard', 'expert'));

-- 5. Remove obsolete system_test_plans table
DROP TABLE IF EXISTS public.system_test_plans CASCADE;
