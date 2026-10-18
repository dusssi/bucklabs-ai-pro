# BUCKLABS AI — Vercel Deployment & Operations Runbook

## 1. Architecture Overview

- **Frontend & SSR Framework:** React 19, TypeScript, TanStack Start & TanStack Router, Vite 7, Tailwind CSS v4
- **Package Manager:** Bun (`bun.lock`)
- **Database & Authentication (Source of Truth):** Supabase PostgreSQL (`kyjgpywuoatbhjtvkmax`) + Supabase Auth with Row-Level Security (RLS)
- **Hosting Platform:** Vercel

---

## 2. Environment Variables (Placeholders Only)

Configure the following environment variables in **Vercel Project Settings -> Environment Variables** for both `Preview` and `Production` environments:

```bash
# Public Client & SSR Variables
VITE_SUPABASE_PROJECT_ID="<your-supabase-project-ref>"
VITE_SUPABASE_URL="https://<your-supabase-project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-supabase-anon-or-publishable-key>"

# Server-Side Mirror Variables (Required by SSR auth middleware)
SUPABASE_URL="https://<your-supabase-project-ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="<your-supabase-anon-or-publishable-key>"

# Optional Server-Only Privileged Keys (NEVER prefix with VITE_)
# SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"
# OPENAI_API_KEY="<your-ai-provider-key>"
```

> **Security Rule:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` with a `VITE_` prefix, and never commit `.env` files to Git.

---

## 3. Supabase Authentication Redirect Configuration

In **Supabase Dashboard -> Authentication -> URL Configuration**:

1. Set **Site URL** to your production Vercel domain (e.g., `https://bucklabs-ai-pro.vercel.app`).
2. Add the following to **Redirect URLs**:
   - `https://bucklabs-ai-pro.vercel.app/dashboard`
   - `https://bucklabs-ai-pro.vercel.app/reset-password`
   - `https://*-dusssis-projects.vercel.app/**` (for Vercel Preview deployments)
   - `http://localhost:3000/**` (for local development)

---

## 4. Database Migrations

All database migrations are versioned in `supabase/migrations/`:

1. `supabase/migrations/20261018000001_initial_schema_and_rls.sql` — Creates `profiles`, `learning_paths`, `courses`, `course_enrollments`, `practice_problems`, `problem_bookmarks`, `practice_attempts`, `learning_activity`, `contact_submissions`, and `newsletter_subscriptions` along with triggers, indexes, and 24 Row-Level Security policies.
2. `supabase/migrations/20261018000002_seed_catalogs.sql` — Seeds the 4 structured learning paths, 8 modular courses, and 20 curated coding practice problems across all 16 DSA topics.

---

## 5. Pre-Deployment Verification Commands

```bash
bun install
bun run typecheck
bun run lint
bun run test
bun run build
```

---

## 6. Rollback & Redeployment Procedure

1. **Instant Application Rollback (Vercel):**
   - Open **Vercel Dashboard -> Deployments**.
   - Select the last known healthy Production deployment and click **Instant Rollback**.
2. **Database Migration Rollback (Supabase):**
   - All schema and seed migrations use non-destructive `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE`, and `ON CONFLICT DO UPDATE` clauses.
   - Before running any schema-altering migration in production, create a logical backup or database snapshot in the Supabase Dashboard.
