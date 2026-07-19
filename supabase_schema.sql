-- Phalanx Cyber Academy Supabase Database Schema
-- Run this script in your Supabase SQL editor to create the required tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE,
    email VARCHAR(120) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    cybersecurity_experience VARCHAR(20),  -- 'beginner', 'intermediate', 'advanced'
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    total_xp INTEGER DEFAULT 0
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes for contact_submissions table
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_is_read ON contact_submissions(is_read);

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL, -- Support IPv6
    username_or_email VARCHAR(255),  -- Optional: track what was attempted
    success BOOLEAN NOT NULL DEFAULT false,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT  -- Optional: track browser/device
);

-- Create indexes for login_attempts table
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_attempted_at ON login_attempts(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_success ON login_attempts(ip_address, success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- Create email_verifications table (used for email verification and passwordless login codes)
CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(120) NOT NULL,  -- Store email for unregistered users during signup
    token VARCHAR(100) UNIQUE NOT NULL,
    verification_code VARCHAR(10),  -- 6-digit code for passwordless login
    code_type VARCHAR(20) DEFAULT 'signup',  -- 'signup', 'login'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0  -- Track verification attempts
);

-- Create indexes for email_verifications table
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(verification_code);

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
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

-- Create indexes for levels table
CREATE INDEX IF NOT EXISTS idx_levels_level_id ON levels(level_id);
CREATE INDEX IF NOT EXISTS idx_levels_category ON levels(category);
CREATE INDEX IF NOT EXISTS idx_levels_difficulty ON levels(difficulty);
CREATE INDEX IF NOT EXISTS idx_levels_created_at ON levels(created_at);
CREATE INDEX IF NOT EXISTS idx_levels_updated_at ON levels(updated_at);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_name TEXT NOT NULL, -- Level name or 'Blue-Team-vs-Red-Team-Mode'
    level_id INTEGER, -- references levels.level_id or NULL for non-level sessions
    score INTEGER,
    start_time TIMESTAMPTZ NOT NULL,    
    end_time TIMESTAMPTZ, -- NULL while session is active
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_name ON sessions(session_name);
CREATE INDEX IF NOT EXISTS idx_sessions_level_id ON sessions(level_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_sessions_user_session ON sessions(user_id, session_name);

-- Create xp_history table
CREATE TABLE IF NOT EXISTS xp_history (
    id SERIAL PRIMARY KEY,
    xp_change INTEGER NOT NULL,
    balance_before INTEGER DEFAULT 0,
    balance_after INTEGER,
    reason VARCHAR(100) NOT NULL,
    session_id INTEGER REFERENCES sessions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for xp_history table
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON xp_history(created_at);
CREATE INDEX IF NOT EXISTS idx_xp_history_reason ON xp_history(reason);
CREATE INDEX IF NOT EXISTS idx_xp_history_session_id ON xp_history(session_id);

-- Populate levels table with initial data from app/routes/levels.py
-- Difficulty levels must match XPCalculator.BASE_XP keys: easy, medium, intermediate, hard, expert
INSERT INTO levels (level_id, name, description, category, icon, estimated_time, xp_reward, skills, difficulty, unlocked, coming_soon, updated_at) VALUES
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

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for levels table to auto-update updated_at
CREATE TRIGGER update_levels_updated_at 
    BEFORE UPDATE ON levels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (these are basic examples - adjust based on your security needs)

-- Users table policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Contact submissions policies
CREATE POLICY "Admins can view all contact submissions" ON contact_submissions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

CREATE POLICY "Anyone can create contact submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Login attempts policies
CREATE POLICY "Admins can view all login attempts" ON login_attempts
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

CREATE POLICY "System can create login attempts" ON login_attempts
    FOR INSERT WITH CHECK (true);

-- Email verifications policies
CREATE POLICY "Users can view their own email verifications" ON email_verifications
    FOR SELECT USING (user_id = auth.uid()::integer OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

CREATE POLICY "System can manage email verifications" ON email_verifications
    FOR ALL WITH CHECK (true);

-- Levels table policies
CREATE POLICY "Anyone can view levels" ON levels
    FOR SELECT WITH CHECK (true);

CREATE POLICY "Admins can manage levels" ON levels
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON sessions
    FOR SELECT USING (user_id = auth.uid()::integer OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

CREATE POLICY "Users can create their own sessions" ON sessions
    FOR INSERT WITH CHECK (user_id = auth.uid()::integer);

CREATE POLICY "Users can update their own sessions" ON sessions
    FOR UPDATE USING (user_id = auth.uid()::integer);

CREATE POLICY "Admins can manage all sessions" ON sessions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

-- XP history policies
CREATE POLICY "Users can view their own XP history" ON xp_history
    FOR SELECT USING (user_id = auth.uid()::integer OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

CREATE POLICY "System can create XP history entries" ON xp_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage XP history" ON xp_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

-- Profiles table for Supabase Auth metadata (game data store for auth.users)
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

-- Indexes for profiles table
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Service role / admin bypass handled by auth checks in backend

-- ============================================================
-- Extended tables for parity with legacy Flask model surface area
-- ============================================================

-- Badges / achievements catalog
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    xp_threshold INTEGER DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_name ON badges(name);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);

-- User-earned badges / achievements
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Daily streak tracking
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_login_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Detailed Blue-vs-Red game state persistence
CREATE TABLE IF NOT EXISTS bvr_game_states (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bvr_game_states_user_id ON bvr_game_states(user_id);

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);

-- Scheduled backup/maintenance jobs
CREATE TABLE IF NOT EXISTS scheduled_jobs (
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

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_name ON scheduled_jobs(name);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_is_active ON scheduled_jobs(is_active);

-- Auto-update updated_at for scheduled_jobs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_scheduled_jobs_updated_at ON scheduled_jobs;
CREATE TRIGGER update_scheduled_jobs_updated_at
    BEFORE UPDATE ON scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the new tables
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bvr_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Seed default XP threshold badges
INSERT INTO badges (name, description, icon, xp_threshold, category) VALUES
    ('First Steps', 'Earned your first XP.', 'target', 1, 'progress'),
    ('Novice Defender', 'Reached 100 XP.', 'shield', 100, 'progress'),
    ('Cyber Scout', 'Reached 500 XP.', 'search', 500, 'progress'),
    ('Guardian', 'Reached 1,000 XP.', 'award', 1000, 'progress'),
    ('Elite Operator', 'Reached 5,000 XP.', 'star', 5000, 'progress'),
    ('Phalanx Legend', 'Reached 10,000 XP.', 'crown', 10000, 'progress')
ON CONFLICT (name) DO NOTHING;

-- RLS policies for new tables
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON badges
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));

CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (user_id = auth.uid()::integer OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));
CREATE POLICY "System can manage user badges" ON user_badges
    FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view own streak" ON user_streaks
    FOR SELECT USING (user_id = auth.uid()::integer OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));
CREATE POLICY "System can manage streaks" ON user_streaks
    FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view own BvR state" ON bvr_game_states
    FOR SELECT USING (user_id = auth.uid()::integer OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));
CREATE POLICY "System can manage BvR state" ON bvr_game_states
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));
CREATE POLICY "System can create audit logs" ON admin_audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage scheduled jobs" ON scheduled_jobs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::integer AND is_admin = true
    ));