-- 2026-07-18 Setup Supabase Auth security enhancements
-- Run this in the Supabase SQL editor (or via psql) to prepare the live DB for the React/FastAPI migration.
-- This migration is additive: it does not drop the legacy public.users / email_verifications / login_attempts tables.

-- 1. Profiles table (application data linked to auth.users identities)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(80) UNIQUE,
    email VARCHAR(120) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    cybersecurity_experience VARCHAR(20),
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    total_xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 2. Auto-create a profiles row on every Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, timezone)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'username',
        COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'UTC')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Prepare game tables for future UUID profile references (additive, nullable until migration)
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON public.sessions(profile_id);

ALTER TABLE public.xp_history ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_xp_history_profile_id ON public.xp_history(profile_id);
