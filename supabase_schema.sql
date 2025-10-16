-- CyberQuest Supabase Database Schema
-- Run this script in your Supabase SQL editor to create the required tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- Made nullable for passwordless auth migration
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    cybersecurity_experience VARCHAR(20),  -- 'beginner', 'intermediate', 'advanced'
    onboarding_completed BOOLEAN NOT NULL DEFAULT false
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

-- Create system_test_plans table
CREATE TABLE IF NOT EXISTS system_test_plans (
    id SERIAL PRIMARY KEY,
    test_plan_no VARCHAR(50) UNIQUE NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    screen_design_ref VARCHAR(200),
    description TEXT NOT NULL,
    scenario TEXT,
    expected_results TEXT NOT NULL,
    procedure TEXT NOT NULL,
    test_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    execution_date TIMESTAMPTZ,
    executed_by VARCHAR(80),
    failure_reason TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    category VARCHAR(30) NOT NULL DEFAULT 'functional',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_test_status CHECK (test_status IN ('pending', 'passed', 'failed', 'skipped')),
    CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_category CHECK (category IN ('functional', 'ui', 'performance', 'security', 'integration'))
);

-- Create indexes for system_test_plans table
CREATE INDEX IF NOT EXISTS idx_system_test_plans_test_plan_no ON system_test_plans(test_plan_no);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_module_name ON system_test_plans(module_name);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_test_status ON system_test_plans(test_status);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_priority ON system_test_plans(priority);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_category ON system_test_plans(category);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_executed_by ON system_test_plans(executed_by);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_execution_date ON system_test_plans(execution_date);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_created_at ON system_test_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_system_test_plans_updated_at ON system_test_plans(updated_at);

-- Create email_verifications table (now used for passwordless login codes)
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

-- Password reset tokens table removed - no longer needed for passwordless auth

-- Add total_xp to users table for tracking XP
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    level_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(50),
    estimated_time VARCHAR(50),
    expected_time_seconds INTEGER,
    xp_reward INTEGER DEFAULT 0,
    skills JSONB,
    difficulty VARCHAR(20),
    unlocked BOOLEAN DEFAULT true,
    coming_soon BOOLEAN DEFAULT false,
    requirements JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
INSERT INTO levels (level_id, name, description, category, icon, estimated_time, expected_time_seconds, xp_reward, skills, difficulty, unlocked, coming_soon, requirements, updated_at) VALUES
(1, 'The-Misinformation-Maze', 'Debunk fake news and stop misinformation from influencing an election.', 'Information Literacy', 'bi-newspaper', '15 minutes', 900, 100, '["Critical Thinking", "Source Verification", "Fact Checking"]'::jsonb, 'easy', true, false, null, NOW()),
(2, 'Shadow-in-the-Inbox', 'Spot phishing attempts and practice safe email protocols.', 'Email Security', 'bi-envelope-exclamation', '20 minutes', 1200, 150, '["Phishing Detection", "Email Analysis", "Social Engineering"]'::jsonb, 'medium', true, false, null, NOW()),
(3, 'Malware-Mayhem', 'Isolate infections and perform digital cleanup during a gaming tournament.', 'Threat Detection', 'bi-bug', '25 minutes', 1500, 200, '["Malware Recognition", "System Security", "Threat Analysis"]'::jsonb, 'intermediate', true, false, null, NOW()),
(4, 'The-White-Hat-Test', 'Practice ethical hacking and responsible vulnerability disclosure.', 'Ethical Hacking', 'bi-terminal', '30 minutes', 1800, 350, '["Penetration Testing", "Vulnerability Assessment", "Ethical Hacking"]'::jsonb, 'hard', true, false, null, NOW()),
(5, 'The-Hunt-for-The-Null', 'Final mission: Use advanced digital forensics to expose The Null''s identity.', 'Digital Forensics', 'bi-trophy', '40 minutes', 2400, 500, '["Digital Forensics", "Evidence Analysis", "Advanced Investigation"]'::jsonb, 'expert', true, false, null, NOW())
ON CONFLICT (level_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    estimated_time = EXCLUDED.estimated_time,
    expected_time_seconds = EXCLUDED.expected_time_seconds,
    xp_reward = EXCLUDED.xp_reward,
    skills = EXCLUDED.skills,
    difficulty = EXCLUDED.difficulty,
    unlocked = EXCLUDED.unlocked,
    coming_soon = EXCLUDED.coming_soon,
    requirements = EXCLUDED.requirements,
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