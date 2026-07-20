# Supabase Auth Setup Guide

This guide covers configuring Supabase Auth email OTP for Phalanx Cyber Academy and connecting the FastAPI backend and React frontend to it.

## Prerequisites

- A Supabase project.
- Node.js and npm installed for the frontend.
- Python 3.11+ installed for the backend.

## 1. Create or open a Supabase project

1. Create a new project in the Supabase dashboard (or open an existing one).
2. Go to Project Settings > API and copy the following:
   - `Project URL` for `SUPABASE_URL` / `VITE_SUPABASE_URL`.
   - `anon public` API key for `VITE_SUPABASE_ANON_KEY`.
   - `service_role` secret API key for `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Configure Auth URLs

In the Supabase dashboard, go to Authentication > URL Configuration and set:

- **Site URL**: `https://phalanx-cyber-academy.vercel.app/`
- **Redirect URLs**:
  - `http://localhost:5173`
  - `http://localhost:5173/onboarding`
  - `https://phalanx-cyber-academy.vercel.app/`
  - `https://phalanx-cyber-academy.vercel.app/onboarding`

These allow the login OTP flow and the signup confirmation link to redirect back to the app and complete on both local development and the Vercel production deployment.

## 3. Enable the Email provider

### Enable the Email provider

1. Go to Authentication > Providers and enable `Email`.
2. **Login** uses `signInWithOtp` with an email OTP (`verifyOtp`).
3. **Signup** uses `signUp` with a confirmation link (`emailRedirectTo: /onboarding`) from the `Confirm Signup` template. No custom email API is required.

### Configure a custom SMTP sender (optional)

Using your own SMTP provider gives you control over the sender address, rate limits, and deliverability.

1. Go to Authentication > SMTP Settings.
2. Toggle `Enable Custom SMTP`.
3. Fill in the SMTP details:
   - **SMTP Host**: your provider's host (e.g., `smtp.gmail.com`, `smtp-relay.sendinblue.com`, or `smtp.brevo.com`)
   - **SMTP Port**: usually `587` for TLS
   - **Username**: your SMTP username or API key name
   - **Password**: your SMTP password or API key
   - **Sender Email**: the address shown to recipients (e.g., `noreply@yourdomain.com`)
   - **Sender Name**: the from name shown to recipients (e.g., `Phalanx Cyber Academy`)
4. Save the settings. Supabase will now deliver OTP and auth emails through your SMTP server.
5. If custom SMTP is not configured, Supabase's built-in mailer is used and is subject to Supabase rate limits.

### Configure email templates

The app uses a mixed passwordless flow: **login** uses an email OTP, and **signup** uses a confirmation link.

1. Go to Authentication > Templates.
2. Copy the HTML from the matching file in `frontend/email-templates/` into each Supabase template:
   - **Magic Link** (used for login OTP) → `frontend/email-templates/email-otp.html`
   - **Confirm Signup** (used for signup confirmation) → `frontend/email-templates/confirm-signup.html`
   - **Change Email Address** → `frontend/email-templates/change-email.html`
3. Available Supabase variables:
   - `{{ .Token }}` — the 6-digit OTP code (used in the Magic Link template for login)
   - `{{ .ConfirmationURL }}` — the confirmation URL (used in Confirm Signup and Change Email)
   - `{{ .SiteURL }}` — the configured site URL
   - `{{ .Email }}` — the recipient's email
   - `{{ .NewEmail }}` — the new email address (Change Email template only)
4. Save each template after editing.

## 4. Run the database schema

1. Open the Supabase SQL Editor.
2. Copy the contents of `supabase_schema.sql` from the project root and run it.
3. The script creates the `public.profiles` table, all child tables keyed by `profile_id`, the `handle_new_user` trigger, and RLS policies.

If you are migrating an existing database that still contains the legacy `users` table, run `migrations/20260719_final_supabase_auth.sql` after the base schema.

## 5. Configure environment variables

Create `backend/.env` from `backend/.env.template` and set:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEBUG=true
```

Create `frontend/.env` from `frontend/.env.template` and set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=/api
```

For Vercel production, add the same `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and a production `VITE_API_URL` to the Vercel project environment variables.

## 6. Start the application

Start the backend:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend:

```bash
cd frontend
npm run dev
```

## 7. Verify the setup

- Visit `/signup`, enter an email, and submit the form.
- Enter the 6-digit OTP from your email on the `/verify` page.
- After verification, check the `public.profiles` table; a row should be created with the signup metadata.
- Confirm that authenticated requests to `GET /api/users/me` include `Authorization: Bearer <access_token>` and return the profile.
- Test that the login OTP flow works the same way.

## Troubleshooting

- **OTP email not received**: Check spam/junk folders. If using a custom SMTP provider, verify the SMTP credentials in Supabase.
- **No `public.profiles` row after signup**: Confirm the `handle_new_user` trigger is installed and that the `public.profiles` table exists.
- **`users/me` returns 401**: Verify the frontend `api.ts` interceptor is attaching the Supabase access token as `Authorization: Bearer <token>`.
- **RLS errors**: Ensure the authenticated user's UUID matches `profile_id` in child tables and that the RLS policies were created by `supabase_schema.sql`.
