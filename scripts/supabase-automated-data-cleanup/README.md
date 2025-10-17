# Supabase Automated Data Cleanup Setup

This directory contains SQL scripts for setting up automated data retention compliance in Supabase.

## 📋 Overview

The Phalanx Cyber Academy application implements automated data cleanup to comply with the privacy policy retention periods:

- **Security Logs (Login Attempts)**: 30 days
- **Email Verification Codes**: Cleaned up after verification or expiration (10 minutes)
- **Contact Form Submissions**: 1 year (365 days)
- **System Logs**: 30 days (cleanup audit logs kept longer)

## 📁 Files

### 1. `supabase_cleanup_functions.sql`
Contains PostgreSQL functions for data cleanup operations:
- `cleanup_old_login_attempts()` - Removes login attempts older than 30 days
- `cleanup_expired_verification_codes()` - Removes expired email verification codes
- `cleanup_old_contact_submissions()` - Removes contact submissions older than 1 year
- `cleanup_old_system_logs()` - Removes system logs older than 30 days
- `run_automated_cleanup()` - Master function that runs all cleanup operations

### 2. `supabase_cron_jobs.sql`
Contains cron job configurations for automated scheduling:
- Daily cleanup at 2:00 AM UTC
- Weekly health check and reporting
- Monitoring and alerting functions

## 🚀 Setup Instructions

### Step 1: Enable pg_cron Extension
**Note**: pg_cron may require a paid Supabase plan. Contact Supabase support if needed.

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Step 2: Create Cleanup Functions
1. Open your Supabase SQL Editor
2. Copy and paste the contents of `supabase_cleanup_functions.sql`
3. Execute the script to create all cleanup functions

### Step 3: Schedule Cron Jobs
1. In the same SQL Editor
2. Copy and paste the contents of `supabase_cron_jobs.sql`
3. Execute the script to schedule automated cleanup jobs

### Step 4: Verify Setup
```sql
-- Check if cron jobs are scheduled
SELECT * FROM cron.job WHERE jobname LIKE 'Phalanx Cyber Academy%';

-- Test cleanup function
SELECT run_automated_cleanup();

-- Check cleanup logs
SELECT * FROM system_logs WHERE operation LIKE 'automated_cleanup%' ORDER BY created_at DESC LIMIT 5;
```

## 📊 Monitoring

### View Scheduled Jobs
```sql
SELECT 
    jobname,
    schedule,
    active,
    last_run,
    next_run
FROM cron.job 
WHERE jobname LIKE 'Phalanx Cyber Academy%';
```

### Check Job Execution History
```sql
SELECT * FROM cron.job_run_details 
WHERE jobname LIKE 'Phalanx Cyber Academy%' 
ORDER BY start_time DESC LIMIT 10;
```

### View Cleanup Statistics
```sql
SELECT 
    operation,
    details->>'deleted_count' as deleted_count,
    details->>'retention_days' as retention_days,
    created_at
FROM system_logs 
WHERE operation IN (
    'automated_cleanup_login_attempts',
    'automated_cleanup_verification_codes', 
    'automated_cleanup_contact_submissions',
    'automated_cleanup_system_logs'
)
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔧 Manual Operations

### Run Immediate Cleanup
```sql
SELECT run_automated_cleanup();
```

### Check System Health
```sql
SELECT check_cleanup_health();
```

### Unschedule Jobs (if needed)
```sql
SELECT cron.unschedule('Phalanx Cyber Academy-daily-cleanup');
SELECT cron.unschedule('Phalanx Cyber Academy-weekly-cleanup-report');
SELECT cron.unschedule('Phalanx Cyber Academy-cleanup-health-check');
```

## ⚙️ Configuration Options

### Modify Cleanup Schedule
To change the cleanup frequency, unschedule the existing job and create a new one:

```sql
-- Unschedule existing job
SELECT cron.unschedule('Phalanx Cyber Academy-daily-cleanup');

-- Schedule new frequency (example: every 6 hours)
SELECT cron.schedule(
    'Phalanx Cyber Academy-frequent-cleanup',
    '0 */6 * * *',
    'SELECT run_automated_cleanup();'
);
```

### Adjust Retention Periods
Modify the cleanup functions to change retention periods:

```sql
-- Example: Change login attempts retention to 60 days
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM login_attempts 
    WHERE attempted_at < (NOW() - INTERVAL '60 days');  -- Changed from 30 to 60
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    -- ... rest of function unchanged
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🚨 Troubleshooting

### Common Issues

1. **pg_cron not available**
   - Contact Supabase support to enable pg_cron
   - Consider upgrading to a paid plan

2. **Jobs not running**
   - Check if pg_cron extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
   - Verify timezone setting: `SELECT current_setting('timezone');`
   - Check job status: `SELECT * FROM cron.job;`

3. **Permission errors**
   - Ensure functions have proper security definer
   - Grant execute permissions if needed

4. **No cleanup logs**
   - Verify `system_logs` table exists
   - Check if cleanup functions are being called
   - Review cron job execution history

### Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase pg_cron Guide](https://supabase.com/docs/guides/database/extensions/pg_cron)
- Supabase Support (for paid plans)

## 📝 Compliance Notes

This setup ensures compliance with:
- **RA 10173 (Data Privacy Act of 2012)** - Philippines
- **GDPR data retention principles**
- **Phalanx Cyber Academy Privacy Policy** retention periods

All cleanup operations are logged for audit purposes and compliance verification.

**Important Notes:**
- Email verification codes are automatically cleaned up after use or expiration (10 minutes)
- Contact form submissions are retained for 1 year for customer support purposes
- System logs are kept for 30 days with cleanup audit logs preserved longer

## 🔄 Maintenance

### Regular Tasks
1. **Monthly**: Review cleanup logs and statistics
2. **Quarterly**: Verify compliance with retention policies
3. **Annually**: Review and update retention periods as needed

### Monitoring Alerts
Consider setting up monitoring for:
- Failed cleanup operations
- Unexpected data growth
- Jobs not running for >48 hours

The health check function `check_cleanup_health()` can be integrated with external monitoring systems.