-- ==============================================================================
-- SUPABASE AUTOMATED DATA CLEANUP FUNCTIONS
-- ==============================================================================
-- This file contains SQL functions for automated data cleanup in Supabase
-- Run these in your Supabase SQL Editor to set up automated data retention
-- ==============================================================================

-- Enable the pg_cron extension (if not already enabled)
-- Note: This may require superuser privileges - contact Supabase support if needed
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ==============================================================================
-- 1. CLEANUP FUNCTION FOR OLD LOGIN ATTEMPTS (30 days retention)
-- ==============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete login attempts older than 30 days
    DELETE FROM login_attempts 
    WHERE attempted_at < (NOW() - INTERVAL '30 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO system_logs (operation, details, created_at)
    VALUES (
        'automated_cleanup_login_attempts',
        jsonb_build_object(
            'deleted_count', deleted_count,
            'retention_days', 30,
            'cleanup_date', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. CLEANUP FUNCTION FOR EXPIRED EMAIL VERIFICATION TOKENS (7 days retention)
-- ==============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_email_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired and unverified email verification tokens older than 7 days
    DELETE FROM email_verifications 
    WHERE expires_at < NOW() 
    AND is_verified = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO system_logs (operation, details, created_at)
    VALUES (
        'automated_cleanup_email_tokens',
        jsonb_build_object(
            'deleted_count', deleted_count,
            'retention_days', 7,
            'cleanup_date', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. CLEANUP FUNCTION FOR OLD CONTACT SUBMISSIONS (1 years retention)
-- ==============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_contact_submissions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete contact submissions older than 1 years (365 days)
    DELETE FROM contact_submissions 
    WHERE created_at < (NOW() - INTERVAL '365 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO system_logs (operation, details, created_at)
    VALUES (
        'automated_cleanup_contact_submissions',
        jsonb_build_object(
            'deleted_count', deleted_count,
            'retention_days', 365,
            'cleanup_date', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. CLEANUP FUNCTION FOR OLD SYSTEM LOGS (90 days retention)
-- ==============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_system_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete system logs older than 90 days (keep cleanup logs longer for auditing)
    DELETE FROM system_logs 
    WHERE created_at < (NOW() - INTERVAL '90 days')
    AND operation NOT LIKE 'automated_cleanup_%';  -- Keep cleanup audit logs longer
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation (this will be kept for 90 days)
    INSERT INTO system_logs (operation, details, created_at)
    VALUES (
        'automated_cleanup_system_logs',
        jsonb_build_object(
            'deleted_count', deleted_count,
            'retention_days', 90,
            'cleanup_date', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 5. MASTER CLEANUP FUNCTION (Runs all cleanup operations)
-- ==============================================================================

CREATE OR REPLACE FUNCTION run_automated_cleanup()
RETURNS JSONB AS $$
DECLARE
    login_attempts_deleted INTEGER;
    email_tokens_deleted INTEGER;
    contact_submissions_deleted INTEGER;
    system_logs_deleted INTEGER;
    cleanup_result JSONB;
BEGIN
    -- Run all cleanup functions
    SELECT cleanup_old_login_attempts() INTO login_attempts_deleted;
    SELECT cleanup_expired_email_tokens() INTO email_tokens_deleted;
    SELECT cleanup_old_contact_submissions() INTO contact_submissions_deleted;
    SELECT cleanup_old_system_logs() INTO system_logs_deleted;
    
    -- Prepare result summary
    cleanup_result := jsonb_build_object(
        'cleanup_date', NOW(),
        'login_attempts_deleted', login_attempts_deleted,
        'email_tokens_deleted', email_tokens_deleted,
        'contact_submissions_deleted', contact_submissions_deleted,
        'system_logs_deleted', system_logs_deleted,
        'total_records_deleted', (
            login_attempts_deleted + 
            email_tokens_deleted + 
            contact_submissions_deleted + 
            system_logs_deleted
        )
    );
    
    -- Log the master cleanup operation
    INSERT INTO system_logs (operation, details, created_at)
    VALUES (
        'automated_cleanup_master',
        cleanup_result,
        NOW()
    );
    
    RETURN cleanup_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. CREATE SYSTEM LOGS TABLE (if not exists)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_operation ON system_logs(operation);

-- ==============================================================================
-- 7. GRANT PERMISSIONS (adjust based on your Supabase setup)
-- ==============================================================================

-- Grant execute permissions to the service role (adjust as needed)
-- GRANT EXECUTE ON FUNCTION cleanup_old_login_attempts() TO service_role;
-- GRANT EXECUTE ON FUNCTION cleanup_expired_email_tokens() TO service_role;
-- GRANT EXECUTE ON FUNCTION cleanup_old_contact_submissions() TO service_role;
-- GRANT EXECUTE ON FUNCTION cleanup_old_system_logs() TO service_role;
-- GRANT EXECUTE ON FUNCTION run_automated_cleanup() TO service_role;

-- ==============================================================================
-- 8. MANUAL TEST COMMANDS (uncomment to test)
-- ==============================================================================

-- Test individual cleanup functions:
-- SELECT cleanup_old_login_attempts();
-- SELECT cleanup_expired_email_tokens();
-- SELECT cleanup_old_contact_submissions();
-- SELECT cleanup_old_system_logs();

-- Test master cleanup function:
-- SELECT run_automated_cleanup();

-- Check cleanup logs:
-- SELECT * FROM system_logs WHERE operation LIKE 'automated_cleanup_%' ORDER BY created_at DESC LIMIT 10;