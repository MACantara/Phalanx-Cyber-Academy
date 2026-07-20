-- 2026-07-19 Final Supabase Auth migration
-- Run this after the base schema script to finish the switch to Supabase Auth email OTP.
-- This script is idempotent and assumes `public.profiles` already exists.

-- 1. Legacy policy cleanup skipped because legacy tables were already removed

-- 2. Drop legacy custom-auth tables (order matters because of FKs)
DROP TABLE IF EXISTS public.email_verifications CASCADE;
DROP TABLE IF EXISTS public.login_attempts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. Ensure the profiles table and trigger fully capture signup metadata
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, email, username, timezone,
        cybersecurity_experience, onboarding_completed
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'username',
        COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'UTC'),
        NEW.raw_user_meta_data ->> 'cybersecurity_experience',
        COALESCE(
            (NEW.raw_user_meta_data ->> 'username') IS NOT NULL
            AND (NEW.raw_user_meta_data ->> 'cybersecurity_experience') IS NOT NULL,
            false
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Re-key child tables to use the UUID profile_id

-- sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.sessions DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.sessions ALTER COLUMN profile_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON public.sessions(profile_id);

-- xp_history
ALTER TABLE public.xp_history ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.xp_history DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.xp_history ALTER COLUMN profile_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_xp_history_profile_id ON public.xp_history(profile_id);

-- user_badges
ALTER TABLE public.user_badges ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_badges DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.user_badges ALTER COLUMN profile_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_badges_profile_id ON public.user_badges(profile_id);

-- user_streaks
ALTER TABLE public.user_streaks ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_streaks DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.user_streaks ALTER COLUMN profile_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_streaks_profile_id ON public.user_streaks(profile_id);

-- bvr_game_states
ALTER TABLE public.bvr_game_states ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.bvr_game_states DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.bvr_game_states ALTER COLUMN profile_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bvr_game_states_profile_id ON public.bvr_game_states(profile_id);

-- admin_audit_logs
ALTER TABLE public.admin_audit_logs DROP COLUMN IF EXISTS admin_id;
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);

-- 5. Re-create RLS policies using public.profiles and auth.uid()
DROP POLICY IF EXISTS "Profiles own data" ON public.profiles;
CREATE POLICY "Profiles own data" ON public.profiles
    FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;
CREATE POLICY "Anyone can create contact submissions" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view levels" ON public.levels;
CREATE POLICY "Anyone can view levels" ON public.levels
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage levels" ON public.levels;
CREATE POLICY "Admins can manage levels" ON public.levels
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
CREATE POLICY "Users can view their own sessions" ON public.sessions
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "Users can create their own sessions" ON public.sessions;
CREATE POLICY "Users can create their own sessions" ON public.sessions
    FOR INSERT WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
CREATE POLICY "Users can update their own sessions" ON public.sessions
    FOR UPDATE USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all sessions" ON public.sessions;
CREATE POLICY "Admins can manage all sessions" ON public.sessions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "Users can view their own XP history" ON public.xp_history;
CREATE POLICY "Users can view their own XP history" ON public.xp_history
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "System can create XP history entries" ON public.xp_history;
CREATE POLICY "System can create XP history entries" ON public.xp_history
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage XP history" ON public.xp_history;
CREATE POLICY "Admins can manage XP history" ON public.xp_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;
CREATE POLICY "Anyone can view badges" ON public.badges
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;
CREATE POLICY "Admins can manage badges" ON public.badges
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" ON public.user_badges
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "System can manage user badges" ON public.user_badges;
CREATE POLICY "System can manage user badges" ON public.user_badges
    FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own streak" ON public.user_streaks;
CREATE POLICY "Users can view own streak" ON public.user_streaks
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "System can manage streaks" ON public.user_streaks;
CREATE POLICY "System can manage streaks" ON public.user_streaks
    FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own BvR state" ON public.bvr_game_states;
CREATE POLICY "Users can view own BvR state" ON public.bvr_game_states
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "System can manage BvR state" ON public.bvr_game_states;
CREATE POLICY "System can manage BvR state" ON public.bvr_game_states
    FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

DROP POLICY IF EXISTS "System can create audit logs" ON public.admin_audit_logs;
CREATE POLICY "System can create audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "Admins can manage scheduled jobs" ON public.scheduled_jobs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
