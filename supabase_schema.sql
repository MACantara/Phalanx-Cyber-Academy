-- Phalanx Cyber Academy Supabase Database Schema (Supabase Auth edition)
-- Run this script in a fresh Supabase project to set up the full schema.

-- Drop legacy custom-auth tables if they exist from earlier iterations
DROP TABLE IF EXISTS public.email_verifications CASCADE;
DROP TABLE IF EXISTS public.login_attempts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Application user profiles, linked 1:1 to auth.users
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

-- Auto-create a public.profiles row when a new auth.users row is created
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

-- Contact submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_is_read ON public.contact_submissions(is_read);

-- Levels catalog
CREATE TABLE IF NOT EXISTS public.levels (
    id SERIAL PRIMARY KEY,
    level_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(50),
    estimated_time VARCHAR(50),
    xp_reward INTEGER DEFAULT 0,
    skills JSONB,
    difficulty VARCHAR(20),
    unlocked BOOLEAN DEFAULT true,
    coming_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_difficulty CHECK (difficulty IN ('easy', 'medium', 'intermediate', 'hard', 'expert'))
);

CREATE INDEX IF NOT EXISTS idx_levels_level_id ON public.levels(level_id);
CREATE INDEX IF NOT EXISTS idx_levels_category ON public.levels(category);
CREATE INDEX IF NOT EXISTS idx_levels_difficulty ON public.levels(difficulty);
CREATE INDEX IF NOT EXISTS idx_levels_created_at ON public.levels(created_at);
CREATE INDEX IF NOT EXISTS idx_levels_updated_at ON public.levels(updated_at);

INSERT INTO public.levels (level_id, name, description, category, icon, estimated_time, xp_reward, skills, difficulty, unlocked, coming_soon, updated_at) VALUES
(1, 'The Misinformation Maze', 'Navigate through fake news and stop misinformation from influencing an election.', 'Information Literacy', 'bi-newspaper', '15 minutes', 100, '["Critical Thinking", "Source Verification", "Fact Checking"]'::jsonb, 'easy', true, false, NOW()),
(2, 'Shadow in the Inbox', 'Spot phishing attempts and practice safe email protocols while defending against social engineering.', 'Email Security', 'bi-envelope-exclamation', '20 minutes', 150, '["Phishing Detection", "Email Analysis", "Social Engineering"]'::jsonb, 'medium', true, false, NOW()),
(3, 'Malware Mayhem', 'Isolate infections and perform digital cleanup during a gaming tournament under pressure.', 'Threat Detection', 'bi-bug', '25 minutes', 200, '["Malware Recognition", "System Security", "Threat Analysis"]'::jsonb, 'intermediate', true, false, NOW()),
(4, 'The White Hat Test', 'Practice ethical hacking and responsible vulnerability disclosure in controlled scenarios.', 'Ethical Hacking', 'bi-terminal', '30 minutes', 350, '["Penetration Testing", "Vulnerability Assessment", "Ethical Hacking"]'::jsonb, 'hard', true, false, NOW()),
(5, 'The Hunt for The Null', 'Use advanced digital forensics to expose The Null''s identity in the ultimate cybersecurity challenge.', 'Digital Forensics', 'bi-trophy', '40 minutes', 500, '["Digital Forensics", "Evidence Analysis", "Advanced Investigation"]'::jsonb, 'expert', true, false, NOW())
ON CONFLICT (level_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    estimated_time = EXCLUDED.estimated_time,
    xp_reward = EXCLUDED.xp_reward,
    skills = EXCLUDED.skills,
    difficulty = EXCLUDED.difficulty,
    unlocked = EXCLUDED.unlocked,
    coming_soon = EXCLUDED.coming_soon,
    updated_at = EXCLUDED.updated_at;

-- Game sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_name TEXT NOT NULL,
    level_id INTEGER,
    score INTEGER,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON public.sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_name ON public.sessions(session_name);
CREATE INDEX IF NOT EXISTS idx_sessions_level_id ON public.sessions(level_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON public.sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_sessions_profile_session ON public.sessions(profile_id, session_name);

-- XP history
CREATE TABLE IF NOT EXISTS public.xp_history (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    xp_change INTEGER NOT NULL,
    balance_before INTEGER DEFAULT 0,
    balance_after INTEGER,
    reason VARCHAR(100) NOT NULL,
    session_id INTEGER REFERENCES public.sessions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON public.xp_history(created_at);
CREATE INDEX IF NOT EXISTS idx_xp_history_reason ON public.xp_history(reason);
CREATE INDEX IF NOT EXISTS idx_xp_history_session_id ON public.xp_history(session_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_profile_id ON public.xp_history(profile_id);

-- Badges / achievements catalog
CREATE TABLE IF NOT EXISTS public.badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    xp_threshold INTEGER DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_name ON public.badges(name);
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);

-- User-earned badges / achievements
CREATE TABLE IF NOT EXISTS public.user_badges (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (profile_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_profile_id ON public.user_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- Daily streak tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_login_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_profile_id ON public.user_streaks(profile_id);

-- Detailed Blue-vs-Red game state persistence
CREATE TABLE IF NOT EXISTS public.bvr_game_states (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    state JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bvr_game_states_profile_id ON public.bvr_game_states(profile_id);

-- Admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);

-- Scheduled backup/maintenance jobs
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    cron_expression VARCHAR(100),
    config JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_name ON public.scheduled_jobs(name);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_is_active ON public.scheduled_jobs(is_active);

-- Auto-update updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_levels_updated_at ON public.levels;
CREATE TRIGGER update_levels_updated_at
    BEFORE UPDATE ON public.levels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_jobs_updated_at ON public.scheduled_jobs;
CREATE TRIGGER update_scheduled_jobs_updated_at
    BEFORE UPDATE ON public.scheduled_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default XP threshold badges
INSERT INTO public.badges (name, description, icon, xp_threshold, category) VALUES
    ('First Steps', 'Earned your first XP.', 'target', 1, 'progress'),
    ('Novice Defender', 'Reached 100 XP.', 'shield', 100, 'progress'),
    ('Cyber Scout', 'Reached 500 XP.', 'search', 500, 'progress'),
    ('Guardian', 'Reached 1,000 XP.', 'award', 1000, 'progress'),
    ('Elite Operator', 'Reached 5,000 XP.', 'star', 5000, 'progress'),
    ('Phalanx Legend', 'Reached 10,000 XP.', 'crown', 10000, 'progress')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bvr_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Profiles own data" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
CREATE POLICY "Anyone can create contact submissions" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view levels" ON public.levels
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage levels" ON public.levels
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Users can view their own sessions" ON public.sessions
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
CREATE POLICY "Users can create their own sessions" ON public.sessions
    FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update their own sessions" ON public.sessions
    FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Admins can manage all sessions" ON public.sessions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Users can view their own XP history" ON public.xp_history
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
CREATE POLICY "System can create XP history entries" ON public.xp_history
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage XP history" ON public.xp_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Anyone can view badges" ON public.badges
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Users can view own badges" ON public.user_badges
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
CREATE POLICY "System can manage user badges" ON public.user_badges
    FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view own streak" ON public.user_streaks
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
CREATE POLICY "System can manage streaks" ON public.user_streaks
    FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view own BvR state" ON public.bvr_game_states
    FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
CREATE POLICY "System can manage BvR state" ON public.bvr_game_states
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
CREATE POLICY "System can create audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage scheduled jobs" ON public.scheduled_jobs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
