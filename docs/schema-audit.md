# Database Schema Usage Audit

Quick takeaways:

- `users.password_hash` is marked deprecated in the schema and only used in `app/models/user.py`; it is the strongest candidate for removal.
- `users.cybersecurity_experience` is referenced only in `app/models/user.py`; verify whether the onboarding flow still needs it.
- `system_test_plans` is actively used by `app/models/system_test_plan.py` and `app/routes/admin/system_test.py`, so it should stay unless the admin test-plan feature is dropped.
- The "Potential Missing Columns" list is a heuristic; most items are transient JSON keys, computed values, or backup labels (e.g. `time_spent`, `current_streak`), not schema gaps.

This document compares `supabase_schema.sql` to the application code in `app/`, `run.py`, `config.py`, and `tests/` to identify unused tables/columns and gaps.

**Note:** A column hitting many files may still be a false positive (e.g. `id`, `name`, `email`). This audit flags raw reference counts; manual review is required before removing anything.
## Table Usage Summary
| Table | Columns | Referencing Files | Notes |
|-------|---------|-------------------|-------|
| `users` | 13 | app\database.py, app\models\email_verification.py, app\models\session.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\utils\breadcrumb_utils.py, app\utils\player_analytics.py, app\utils\xp.py, config.py | Core auth table; expected high usage |
| `contact_submissions` | 7 | app\database.py, app\models\contact.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py |  |
| `login_attempts` | 6 | app\database.py, app\models\login_attempt.py, app\routes\__init__.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\auth.py, app\routes\login_attempts.py, app\utils\player_analytics.py, config.py |  |
| `system_test_plans` | 16 | app\models\system_test_plan.py |  |
| `email_verifications` | 10 | app\database.py, app\models\email_verification.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py |  |
| `levels` | 16 | app\models\level.py, app\models\session.py, app\routes\__init__.py, app\routes\admin\data_analytics.py, app\routes\auth.py, app\routes\email_api.py, app\routes\level3_api.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\breadcrumb_utils.py, app\utils\player_analytics.py | Gameplay table; expected usage |
| `sessions` | 8 | app\models\session.py, app\models\xp_history.py, app\routes\auth.py, app\routes\level4_api.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py, app\utils\xp.py, config.py | Gameplay table; expected usage |
| `xp_history` | 7 | app\models\xp_history.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py, app\utils\xp.py | Gameplay table; expected usage |

## Column Usage Per Table

### `users`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `username` | app\__init__.py, app\models\email_verification.py, app\models\user.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\profile.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py |  |
| `email` | app\__init__.py, app\models\contact.py, app\models\email_verification.py, app\models\user.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\auth.py, app\routes\contact.py, app\routes\email_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\email_service.py, app\utils\player_analytics.py, config.py, tests\test_auth_persistence.py | Generic term; verify actual usage in model |
| `password_hash` | app\models\user.py |  |
| `is_active` | app\models\user.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\auth.py, app\routes\profile.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py |  |
| `created_at` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py | Common metadata field; likely used implicitly |
| `last_login` | app\models\user.py, app\utils\player_analytics.py |  |
| `is_admin` | app\__init__.py, app\models\user.py, app\routes\admin\admin_core.py, app\routes\admin\admin_utils.py, app\routes\admin\logs.py, app\routes\admin\system_test.py, app\routes\api.py |  |
| `timezone` | app\__init__.py, app\models\user.py, app\routes\admin\logs.py, app\routes\admin\system_test.py, app\routes\auth.py, app\routes\profile.py, app\utils\player_analytics.py, app\utils\timezone_utils.py, config.py, tests\test_auth_persistence.py |  |
| `is_verified` | app\__init__.py, app\models\email_verification.py, app\models\user.py, app\routes\auth.py, app\utils\player_analytics.py, tests\test_auth_persistence.py |  |
| `cybersecurity_experience` | app\models\user.py |  |
| `onboarding_completed` | app\__init__.py, app\models\user.py, app\routes\auth.py, tests\test_auth_persistence.py |  |
| `total_xp` | app\models\user.py, app\models\xp_history.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\streak_tracker.py, app\utils\xp.py |  |

### `contact_submissions`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `name` | app\__init__.py, app\models\contact.py, app\models\level.py, app\models\system_test_plan.py, app\routes\admin\data_analytics.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\routes\level4_api.py, app\routes\levels.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py | Generic term; verify actual usage in model |
| `email` | app\__init__.py, app\models\contact.py, app\models\email_verification.py, app\models\user.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\auth.py, app\routes\contact.py, app\routes\email_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\email_service.py, app\utils\player_analytics.py, config.py, tests\test_auth_persistence.py | Generic term; verify actual usage in model |
| `subject` | app\models\contact.py, app\routes\admin\logs.py, app\routes\contact.py, app\utils\email_service.py |  |
| `message` | app\__init__.py, app\database.py, app\models\contact.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\contact.py, app\routes\csrf_api.py, app\routes\email_api.py, app\routes\level3_api.py, app\routes\level4_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\utils\email_service.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py |  |
| `created_at` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py | Common metadata field; likely used implicitly |
| `is_read` | app\models\contact.py |  |

### `login_attempts`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `ip_address` | app\models\login_attempt.py, app\routes\admin\logs.py, app\routes\login_attempts.py |  |
| `username_or_email` | app\models\login_attempt.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\login_attempts.py |  |
| `success` | app\models\login_attempt.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\contact.py, app\routes\csrf_api.py, app\routes\email_api.py, app\routes\level3_api.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\login_attempts.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py |  |
| `attempted_at` | app\models\login_attempt.py, app\routes\admin\logs.py |  |
| `user_agent` | app\models\login_attempt.py, app\routes\login_attempts.py |  |

### `system_test_plans`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `test_plan_no` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `module_name` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `screen_design_ref` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `description` | app\models\level.py, app\models\system_test_plan.py, app\routes\admin\system_test.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\player_analytics.py |  |
| `scenario` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `expected_results` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `procedure` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `test_status` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `execution_date` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `executed_by` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `failure_reason` | app\models\system_test_plan.py, app\routes\admin\system_test.py |  |
| `priority` | app\models\system_test_plan.py, app\routes\admin\system_test.py, app\utils\email_service.py |  |
| `category` | app\models\level.py, app\models\system_test_plan.py, app\routes\admin\system_test.py, app\routes\level3_api.py, app\routes\level4_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\xp.py |  |
| `created_at` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py | Common metadata field; likely used implicitly |
| `updated_at` | app\models\level.py, app\models\system_test_plan.py, app\routes\admin\system_test.py | Common metadata field; likely used implicitly |

### `email_verifications`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `user_id` | app\__init__.py, app\models\email_verification.py, app\models\session.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py, app\utils\xp.py, tests\test_auth_persistence.py | Generic term; verify actual usage in model |
| `email` | app\__init__.py, app\models\contact.py, app\models\email_verification.py, app\models\user.py, app\routes\admin\admin_core.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\auth.py, app\routes\contact.py, app\routes\email_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\email_service.py, app\utils\player_analytics.py, config.py, tests\test_auth_persistence.py | Generic term; verify actual usage in model |
| `token` | app\__init__.py, app\models\email_verification.py, app\routes\csrf_api.py, app\routes\red_team_nlp_api.py, app\utils\email_service.py, config.py |  |
| `verification_code` | app\models\email_verification.py, app\routes\auth.py, app\utils\email_service.py, tests\test_auth_persistence.py |  |
| `code_type` | app\models\email_verification.py, app\routes\auth.py, tests\test_auth_persistence.py |  |
| `created_at` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py | Common metadata field; likely used implicitly |
| `expires_at` | app\models\email_verification.py, app\routes\admin\logs.py |  |
| `verified_at` | app\models\email_verification.py, app\routes\admin\logs.py |  |
| `attempts` | app\models\email_verification.py, app\models\login_attempt.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\auth.py, app\routes\levels.py, app\routes\login_attempts.py, app\routes\profile.py, app\utils\player_analytics.py, config.py |  |

### `levels`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `level_id` | app\models\level.py, app\models\session.py, app\routes\admin\data_analytics.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\xp.py, tests\unit\test_xp_calculator.py |  |
| `name` | app\__init__.py, app\models\contact.py, app\models\level.py, app\models\system_test_plan.py, app\routes\admin\data_analytics.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\routes\level4_api.py, app\routes\levels.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py | Generic term; verify actual usage in model |
| `description` | app\models\level.py, app\models\system_test_plan.py, app\routes\admin\system_test.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\player_analytics.py |  |
| `category` | app\models\level.py, app\models\system_test_plan.py, app\routes\admin\system_test.py, app\routes\level3_api.py, app\routes\level4_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\xp.py |  |
| `icon` | app\models\level.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\profile.py, app\utils\breadcrumb_utils.py |  |
| `estimated_time` | app\models\level.py, app\routes\levels.py, app\routes\profile.py |  |
| `expected_time_seconds` | app\models\level.py |  |
| `xp_reward` | app\models\level.py, app\routes\levels.py, app\routes\profile.py |  |
| `skills` | app\models\level.py, app\routes\levels.py, app\routes\profile.py, app\utils\player_analytics.py |  |
| `difficulty` | app\models\level.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\xp.py, tests\unit\test_xp_calculator.py |  |
| `unlocked` | app\models\level.py, app\routes\levels.py, app\routes\profile.py |  |
| `coming_soon` | app\models\level.py, app\routes\levels.py, app\routes\profile.py |  |
| `requirements` | app\models\level.py |  |
| `created_at` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py | Common metadata field; likely used implicitly |
| `updated_at` | app\models\level.py, app\models\system_test_plan.py, app\routes\admin\system_test.py | Common metadata field; likely used implicitly |

### `sessions`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `user_id` | app\__init__.py, app\models\email_verification.py, app\models\session.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py, app\utils\xp.py, tests\test_auth_persistence.py | Generic term; verify actual usage in model |
| `session_name` | app\models\session.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\xp.py |  |
| `level_id` | app\models\level.py, app\models\session.py, app\routes\admin\data_analytics.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\xp.py, tests\unit\test_xp_calculator.py |  |
| `score` | app\models\session.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\player_analytics.py, app\utils\xp.py, tests\unit\test_xp_calculator.py |  |
| `start_time` | app\models\session.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\utils\player_analytics.py |  |
| `end_time` | app\models\session.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\utils\player_analytics.py, app\utils\streak_tracker.py |  |
| `created_at` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py | Common metadata field; likely used implicitly |

### `xp_history`

| Column | Referencing Files | Notes |
|--------|-------------------|-------|
| `id` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\login_attempt.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\admin_core.py, app\routes\admin\system_backup.py, app\routes\admin\system_test.py, app\routes\api.py, app\routes\auth.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\level4_api.py, app\routes\level5_api.py, app\routes\levels.py, app\routes\news_api.py, app\routes\profile.py, app\routes\red_team_nlp_api.py, app\routes\xp_api.py, app\utils\email_service.py, app\utils\player_analytics.py, app\utils\xp.py, tests\test_auth_persistence.py | Common metadata field; likely used implicitly |
| `xp_change` | app\models\xp_history.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\utils\streak_tracker.py, app\utils\xp.py |  |
| `balance_before` | app\models\xp_history.py, app\utils\xp.py |  |
| `balance_after` | app\models\xp_history.py, app\utils\xp.py |  |
| `reason` | app\models\session.py, app\models\xp_history.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\xp_api.py, app\utils\xp.py |  |
| `session_id` | app\models\session.py, app\models\xp_history.py, app\routes\blue_team_vs_red_team_mode\__init__.py, app\routes\levels.py, app\routes\profile.py, app\routes\xp_api.py, app\utils\xp.py |  |
| `created_at` | app\models\contact.py, app\models\email_verification.py, app\models\level.py, app\models\session.py, app\models\system_test_plan.py, app\models\user.py, app\models\xp_history.py, app\routes\admin\logs.py, app\routes\admin\system_backup.py, app\routes\contact.py, app\utils\player_analytics.py, app\utils\streak_helpers.py, app\utils\streak_tracker.py | Common metadata field; likely used implicitly |

## Potential Missing Columns
The following are column-like keys accessed in the model layer but not found in the schema (heuristic based on `data.get('...')` and `data['...']` patterns).

- `app\routes\admin\system_backup.py`: contact_submissions, email_verifications, login_attempts, users
- `app\routes\admin\system_test.py`: status
- `app\routes\auth.py`: field
- `app\routes\blue_team_vs_red_team_mode\__init__.py`: action, sourceIP, target, technique, type
- `app\routes\level5_api.py`: null_members, null_members_full, selected_member
- `app\routes\levels.py`: user_progress
- `app\routes\news_api.py`: label
- `app\routes\red_team_nlp_api.py`: actualSuccess, context, predictedSuccess, reward, techniqueUsed
- `app\routes\xp_api.py`: time_spent
- `app\utils\streak_tracker.py`: current_streak, days_since_last_activity, longest_streak, streak_status

## Recommendations
1. **Review tables with zero references** (`system_test_plans` etc.) in `app/routes` and admin panels. If unused, drop the table, its indexes, RLS policies, and the corresponding `app/models/*.py` and `app/routes/admin/*.py` files.
2. **Review columns with zero references** for each table. If a column is not read or written, consider dropping it and removing the related model attribute.
3. **Address missing columns** identified above by either adding them to the schema or removing the code that expects them.
4. **Keep core columns** (`id`, `created_at`, `updated_at`, `is_active`) unless you intentionally refactor the model layer.
5. After deciding, update `supabase_schema.sql` and regenerate or edit any live Supabase migrations.
