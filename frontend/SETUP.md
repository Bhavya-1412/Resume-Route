# ResumeRoute — Setup

The app is fully wired to your Supabase project, Gemini API, and Adzuna API.
You only need to run two one-time setup steps in your Supabase project.

## 1. Apply the database schema

In your Supabase Dashboard → **SQL Editor**, paste and run `supabase/migrations/001_init.sql`.
This creates:
- `profiles` table (id, email, full_name, skills[], resume_url, created_at)
- `job_matches` table (user_id, job_title, company, match_score, job_url, alerted, …)
- `resumes` storage bucket (public-read, per-user write)
- Row-Level Security policies + a trigger that auto-creates a profile on signup

## 2. Deploy the email alert Edge Function

Browsers cannot send SMTP, so email alerts run from a Supabase Edge Function.

```bash
# install supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
supabase login
supabase link --project-ref uebafdvtjopgbcxhivog

# set Gmail credentials as secrets
supabase secrets set \
  GMAIL_EMAIL=soniyash4095@gmail.com \
  GMAIL_APP_PASSWORD="uiry pwps bqbc qrtl"

# deploy
supabase functions deploy send-alert --no-verify-jwt
```

After deploy, the app will automatically call `send-alert` whenever a resume produces job matches with a score ≥ 70%.

## Flow

1. Sign up / log in → Supabase auth, profile auto-created
2. Upload resume (PDF) → pdf.js extracts text → file stored in `resumes` bucket
3. Gemini 1.5 Flash extracts skills → saved to `profiles.skills`
4. Adzuna (India, `/jobs/in/search/1`) fetched with extracted skills
5. Each job scored against skills; top 10 inserted into `job_matches`
6. Matches ≥ 70% trigger the `send-alert` Edge Function → Gmail SMTP email
7. Dashboard & Jobs pages render live data

## Security note

`VITE_*` env vars are bundled into the browser. Gemini and Adzuna keys are exposed to clients by design here. For production, proxy those calls through Edge Functions and remove the `VITE_` prefixes.
