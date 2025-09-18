-- ==============================================================================
-- SUPABASE CRON JOB CONFIGURATION FOR AUTOMATED DATA CLEANUP
-- ==============================================================================
-- This file sets up automated cron jobs in Supabase for data retention compliance
-- Run these commands in your Supabase SQL Editor AFTER setting up the cleanup functions
-- ==============================================================================

-- ==============================================================================
-- ENABLE PG_CRON EXTENSION
-- ==============================================================================
-- Note: This may require contacting Supabase support for paid plans
-- Free tier may not support pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ==============================================================================
-- SCHEDULE AUTOMATED CLEANUP JOBS
-- ==============================================================================

-- 1. DAILY CLEANUP JOB - Runs every day at 2:00 AM UTC
-- This is the main cleanup job that handles all data retention
SELECT cron.schedule(
    'cyberquest-daily-cleanup',           -- Job name
    '0 2 * * *',                         -- Cron expression: Every day at 2:00 AM UTC
    'SELECT run_automated_cleanup();'     -- SQL command to execute
);

-- 2. WEEKLY CLEANUP VERIFICATION - Runs every Sunday at 3:00 AM UTC
-- This job verifies cleanup operations and generates summary reports
SELECT cron.schedule(
    'cyberquest-weekly-cleanup-report',
    '0 3 * * 0',                         -- Every Sunday at 3:00 AM UTC
    $$
    INSERT INTO system_logs (operation, details, created_at)
    VALUES (
        'weekly_cleanup_report',
        jsonb_build_object(
            'report_date', NOW(),
            'login_attempts_count', (SELECT COUNT(*) FROM login_attempts),
            'password_reset_tokens_count', (SELECT COUNT(*) FROM password_reset_tokens),
            'contact_submissions_count', (SELECT COUNT(*) FROM contact_submissions),
            'system_logs_count', (SELECT COUNT(*) FROM system_logs),
            'oldest_login_attempt', (SELECT MIN(attempted_at) FROM login_attempts),
            'oldest_contact_submission', (SELECT MIN(created_at) FROM contact_submissions),
            'oldest_system_log', (SELECT MIN(created_at) FROM system_logs)
        ),
        NOW()
    );
    $$
);

-- ==============================================================================
-- ALTERNATIVE CRON SCHEDULES (choose one that fits your needs)
-- ==============================================================================

-- Option 1: More frequent cleanup (every 6 hours)
-- SELECT cron.schedule(
--     'cyberquest-frequent-cleanup',
--     '0 */6 * * *',
--     'SELECT run_automated_cleanup();'
-- );

-- Option 2: Weekly cleanup (every Sunday at 2:00 AM)
-- SELECT cron.schedule(
--     'cyberquest-weekly-cleanup',
--     '0 2 * * 0',
--     'SELECT run_automated_cleanup();'
-- );

-- Option 3: Monthly cleanup (1st day of month at 2:00 AM)
-- SELECT cron.schedule(
--     'cyberquest-monthly-cleanup',
--     '0 2 1 * *',
--     'SELECT run_automated_cleanup();'
-- );

-- ==============================================================================
-- CLEANUP JOB MANAGEMENT COMMANDS
-- ==============================================================================

-- View all scheduled cron jobs
-- SELECT * FROM cron.job;

-- View cron job execution history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Unschedule a job (if needed)
-- SELECT cron.unschedule('cyberquest-daily-cleanup');

-- Update job schedule (unschedule first, then reschedule)
-- SELECT cron.unschedule('cyberquest-daily-cleanup');
-- SELECT cron.schedule('cyberquest-daily-cleanup', '0 3 * * *', 'SELECT run_automated_cleanup();');

-- ==============================================================================
-- MONITORING AND ALERTING
-- ==============================================================================

-- Create a function to check if cleanup jobs are running successfully
CREATE OR REPLACE FUNCTION check_cleanup_health()
RETURNS JSONB AS $$
DECLARE
    last_cleanup_date TIMESTAMP WITH TIME ZONE;
    cleanup_health JSONB;
BEGIN
    -- Get the last successful cleanup date
    SELECT MAX(created_at) INTO last_cleanup_date
    FROM system_logs 
    WHERE operation = 'automated_cleanup_master';
    
    cleanup_health := jsonb_build_object(
        'health_check_date', NOW(),
        'last_cleanup_date', last_cleanup_date,
        'hours_since_last_cleanup', EXTRACT(EPOCH FROM (NOW() - last_cleanup_date)) / 3600,
        'is_healthy', (last_cleanup_date > NOW() - INTERVAL '48 hours')  -- Healthy if cleanup ran within 48 hours
    );
    
    -- Log health check
    INSERT INTO system_logs (operation, details, created_at)
    VALUES ('cleanup_health_check', cleanup_health, NOW());
    
    RETURN cleanup_health;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule daily health check at 4:00 AM UTC
SELECT cron.schedule(
    'cyberquest-cleanup-health-check',
    '0 4 * * *',
    'SELECT check_cleanup_health();'
);

-- ==============================================================================
-- MANUAL CLEANUP COMMANDS (for testing or emergency cleanup)
-- ==============================================================================

-- Run immediate cleanup (for testing)
-- SELECT run_automated_cleanup();

-- Check cleanup job status
-- SELECT 
--     jobname,
--     schedule,
--     active,
--     last_run,
--     next_run
-- FROM cron.job 
-- WHERE jobname LIKE 'cyberquest%';

-- Check recent cleanup logs
-- SELECT 
--     operation,
--     details,
--     created_at
-- FROM system_logs 
-- WHERE operation LIKE 'automated_cleanup%' 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- ==============================================================================
-- TROUBLESHOOTING
-- ==============================================================================

-- If jobs aren't running, check:
-- 1. pg_cron extension is enabled
-- 2. Database timezone is set correctly
-- 3. Function permissions are granted
-- 4. Cron schedule syntax is correct

-- Check database timezone
-- SELECT current_setting('timezone');

-- Check if pg_cron is enabled
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- ==============================================================================
-- RETENTION POLICY SUMMARY
-- ==============================================================================

/*
Current retention policies (matching privacy policy):

1. Login Attempts (Security Logs): 30 days
   - Purpose: Security monitoring and fraud prevention
   - Cleanup: Daily at 2:00 AM UTC

2. Password Reset Tokens: 7 days (for expired tokens)
   - Purpose: Password reset process
   - Cleanup: Daily at 2:00 AM UTC

3. Contact Form Submissions: 1 year (365 days)
   - Purpose: Customer support and communication history
   - Cleanup: Daily at 2:00 AM UTC

4. Session Data: Handled by application logic (Flask-Login)
   - Purpose: User authentication sessions
   - Cleanup: On logout or session expiry

5. System Logs: 30 days
   - Purpose: System monitoring and debugging
   - Cleanup: Daily at 2:00 AM UTC (cleanup logs kept longer for auditing)

Note: Email verification tokens are NOT automatically cleaned up to preserve
verified account records. Manual cleanup may be performed for unverified tokens
if necessary.
*/