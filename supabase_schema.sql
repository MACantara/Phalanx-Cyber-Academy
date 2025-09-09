-- CyberQuest Supabase Database Schema
-- Run this script in your Supabase SQL editor to create the required tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_admin BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

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

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(120) NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    is_verified BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes for email_verifications table
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_email ON email_verifications(user_id, email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    used_at TIMESTAMPTZ
);

-- Create indexes for password_reset_tokens table
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

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

-- Password reset tokens policies
CREATE POLICY "Users can view their own reset tokens" ON password_reset_tokens
    FOR SELECT USING (user_id = auth.uid()::integer);

CREATE POLICY "System can manage reset tokens" ON password_reset_tokens
    FOR ALL WITH CHECK (true);