# BUCKLABS AI — Security Audit & Repository Reconciliation Report

**Repository:** `https://github.com/dusssi/bucklabs-ai-pro`  
**Audit Branch:** `arena/62a1c1c3-bucklabs-ai-pro` (branched from `main` @ `aaf4fe08ab11c788e9d44c26a0848760c1df0e0b`)  
**Authoritative Supabase Project:** `kyjgpywuoatbhjtvkmax` (_dusssi's Project_, `ap-northeast-1`, PostgreSQL 17.6)  
**Audit Date:** 2026-10-18

---

## 1. Phase A — Repository & Implementation Report Reconciliation Matrix

An inspection comparing `origin/main` (`aaf4fe08ab11c788e9d44c26a0848760c1df0e0b`), the working branch (`arena/62a1c1c3-bucklabs-ai-pro`), and the live Supabase database (`kyjgpywuoatbhjtvkmax`) produced the following reconciliation matrix:

| Component                                | Reported Status                     | Actual Status Before Remediation                                                                                                                                                                                                                                                                          | Evidence                                                                  | Risk                                                                                                                                      | Required Fix & Final Status                                                                                                                                                                                                |
| :--------------------------------------- | :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Synchronization**               | Implemented in workspace            | **Confirmed defect** — Workspace changes on `arena/62a1c1c3-bucklabs-ai-pro` had not yet been committed/pushed to GitHub (`origin/main` remained at `aaf4fe0`).                                                                                                                                           | `git status -s`, `git log -n 5`                                           | High — Uncommitted work is invisible to GitHub/Vercel CI.                                                                                 | Stage, commit, push `arena/62a1c1c3-bucklabs-ai-pro`, and open a Pull Request. (**Fixed & Verified**)                                                                                                                      |
| **Tracked `.env` & Secret Hygiene**      | `.env` untracked                    | **Confirmed defect** — `.env` was tracked in Git index from commit `aaf4fe0` (`M .env`) containing legacy Lovable project keys (`gnbnvyhepmkrbpnsobbo`).                                                                                                                                                  | `git status -s .env`                                                      | High — Tracked `.env` files risk accidental credential commits.                                                                           | Executed `git rm --cached .env`, retained `.env` on `.gitignore`, updated `.env.example` with safe placeholders. (**Fixed & Verified**)                                                                                    |
| **Supabase Project Reference**           | `kyjgpywuoatbhjtvkmax`              | **Verified & Reconciled** — `aaf4fe0` referenced Lovable's template project `gnbnvyhepmkrbpnsobbo`; authenticated Supabase organization `xlmibfxgbzehzpvbcuqh` (_dusssi's Org_) owns `kyjgpywuoatbhjtvkmax`.                                                                                              | `supabase__get_project`, `supabase/config.toml`                           | Medium — Misaligned project refs cause schema/auth drift.                                                                                 | Aligned `supabase/config.toml`, migrations, and docs to `kyjgpywuoatbhjtvkmax`. (**Verified & Passing**)                                                                                                                   |
| **Supabase Schema & Migrations**         | 10 tables, 24 RLS policies          | **Confirmed defect (minor RLS hardening gaps)** — Tables & 24 policies existed on `kyjgpywuoatbhjtvkmax`, but `practice_attempts` allowed client-supplied `verification_type='verified_integration'` and `contact_submissions` allowed non-`received` initial `status`.                                   | `supabase/migrations/20261018000001_initial_schema_and_rls.sql`           | Medium — Clients could spoof judge-verified status via direct REST API calls.                                                             | Applied `20261018000003_security_rls_hardening.sql` enforcing `FORCE ROW LEVEL SECURITY`, immutability triggers, and `WITH CHECK` constraints. (**Fixed & Verified**)                                                      |
| **Seed & Catalog Data**                  | 4 paths, 8 courses, 20 problems     | **Verified and passing** — Live database query confirmed `learning_paths=4`, `courses=8`, `practice_problems=20`.                                                                                                                                                                                         | `supabase__execute_query` (`20261018000002_seed_catalogs.sql`)            | Low                                                                                                                                       | None required. (**Verified & Passing**)                                                                                                                                                                                    |
| **Server Functions & Auth Middleware**   | Protected via `requireSupabaseAuth` | **Confirmed defect** — `requireSupabaseAuth` existed in `src/integrations/supabase/auth-middleware.ts` but was not attached to server functions in `src/lib/api/platform.functions.ts`; `getRequest()` was imported in client-reachable module scope.                                                     | `src/lib/api/platform.functions.ts`, `vite build` import-protection trace | High — Server functions lacked enforced JWT claim verification and broke client bundle import protection if `getRequest()` was top-level. | Extracted server logic to `src/lib/api/platform.server.ts`, hardened `verifySupabaseBearerToken`, and registered `.middleware([requireSupabaseAuth])` on protected server functions. (**Fixed & Verified**)                |
| **Persistent Platform Data Store**       | Supabase + local fallback           | **Confirmed defect** — `src/services/platform-store.ts` and `platform.functions.ts` used module-level mutable singletons (`memoryState`, `serverContactRecords`) and silently fell back to local storage even when `NODE_ENV === "production"`, reporting false success states on failed Supabase writes. | `src/services/platform-store.ts`, `src/lib/api/platform.functions.ts`     | Critical — Production users could experience silent data loss or cross-request SSR state bleed.                                           | Disabled local fallback in production (`isLocalFallbackAllowed() === false` when `NODE_ENV === "production"`), removed SSR mutable singletons, and threw explicit errors on failed Supabase writes. (**Fixed & Verified**) |
| **User Profile & Onboarding**            | Connected to `profiles`             | **Verified and passing** — Validated with `onboardingProfileSchema`, scoped to authenticated user ID, persisted to `public.profiles`.                                                                                                                                                                     | `src/routes/profile.tsx`, `src/services/platform-store.ts`                | Low                                                                                                                                       | Hardened production write failure handling. (**Verified & Passing**)                                                                                                                                                       |
| **Course Enrollment & Progress**         | Connected to `course_enrollments`   | **Verified and passing** — Module toggles calculate exact completion percentages (`calculateCourseProgress`) and upsert via `UNIQUE(user_id, course_id)`.                                                                                                                                                 | `src/routes/courses.$courseId.tsx`, `src/services/platform-store.ts`      | Low                                                                                                                                       | Hardened production write failure handling. (**Verified & Passing**)                                                                                                                                                       |
| **Coding Practice Catalogue & Progress** | 20 problems across 16 topics        | **Verified and passing** — Canonical links to LeetCode, HackerRank, and Codeforces with source attribution, bookmarks, self-reported statuses, and notes.                                                                                                                                                 | `src/data/practice-problems.ts`, `src/routes/practice.tsx`                | Low                                                                                                                                       | Enforced `verification_type = 'user_reported'` at PostgreSQL RLS level. (**Verified & Passing**)                                                                                                                           |
| **AI Tutor Workflow**                    | 5 pedagogical modes                 | **Confirmed defect (transparency & rate-limit scope)** — Used a single global rate-limit bucket (`ai-tutor:global`) and did not explicitly badge that the beta runs a deterministic curriculum rule engine when no external LLM key is configured.                                                        | `src/lib/api/platform.functions.ts`, `src/routes/ai-tutor.tsx`            | Medium — Global rate limit allowed single-caller DoS; deterministic outputs must not be misrepresented as live LLM outputs.               | Scoped rate limits per caller IP/identity and added explicit `generationEngine: "deterministic_beta_engine"` UI badges. (**Fixed & Verified**)                                                                             |
| **Contact & Newsletter Forms**           | Connected to server functions       | **Confirmed defect** — Lacked honeypot spam fields, idempotency deduplication, and production failure propagation when Supabase inserts failed.                                                                                                                                                           | `src/routes/contact.tsx`, `src/components/site/SiteFooter.tsx`            | High — False success toast if DB insert failed in production.                                                                             | Added honeypot spam rejection, per-caller rate limiting, 2-minute idempotency deduplication, and strict error propagation. (**Fixed & Verified**)                                                                          |
| **Vercel Deployment Config**             | `vercel.json` & `DEPLOYMENT.md`     | **Verified and passing** — Configured for Bun + TanStack Start SSR (`dist/client`, `dist/server/server.js`). Live Vercel deployment requires external Vercel account credentials.                                                                                                                         | `vercel.json`, `DEPLOYMENT.md`                                            | Low                                                                                                                                       | Added `docs/ENVIRONMENT_SETUP.md` and `docs/BETA_READINESS.md`. (**Verified & Passing**)                                                                                                                                   |
| **Automated Tests & Type Checking**      | 15 tests passing                    | **Verified & Expanded** — Expanded from 15 to 24 unit, integration, and security/production-integrity tests + 14 live PostgreSQL RLS tests.                                                                                                                                                               | `tests/*.test.ts`, `docs/TEST_REPORT.md`                                  | Low                                                                                                                                       | Added `tests/security-and-production.test.ts`. (**Verified & Passing**)                                                                                                                                                    |

---

## 2. Detailed Security Findings & Remediations

### `SEC-01` — Silent Fallback to Local/In-Memory Storage on Production Database Failure

- **Severity:** Critical
- **Affected Files:** `src/services/platform-store.ts`, `src/lib/api/platform.functions.ts`, `src/lib/api/platform.server.ts`
- **Description:** Previously, `catch` blocks around Supabase Auth and PostgreSQL calls fell back to `window.localStorage` or module-scoped in-memory objects (`memoryState`, `serverContactRecords`, `serverNewsletterEmails`) regardless of whether `NODE_ENV` was `"production"`. In SSR contexts (`typeof window === "undefined"`), `memoryState` acted as a shared mutable singleton across requests.
- **Remediation:**
  - Implemented `isLocalFallbackAllowed()` in `src/services/platform-store.ts` and `isServerTestFallbackAllowed()` in `src/lib/api/platform.server.ts`, which strictly return `false` whenever `NODE_ENV === "production"`.
  - Removed shared SSR mutable singletons outside isolated Vitest test runs.
  - Guaranteed that any failed Supabase write or auth request in production mode throws an actionable error and never produces a false success state.
- **Verification Status:** **RESOLVED** — Verified by `tests/security-and-production.test.ts` (`disables local mock persistence in production mode and rejects failed Supabase writes instead of reporting false success`).

### `SEC-02` — Tracked `.env` File in Git Index

- **Severity:** High
- **Affected Files:** `.env`, `.gitignore`, `.env.example`
- **Description:** Commit `aaf4fe0` committed a `.env` file containing the legacy Lovable project reference (`gnbnvyhepmkrbpnsobbo`) and its publishable anon key. Adding `.env` to `.gitignore` alone does not remove an already-tracked file from the Git index.
- **Remediation:**
  - Executed `git rm --cached .env` so the file is removed from the Git repository index while remaining excluded via `.gitignore` (`.env`, `.env.*`, `!.env.example`).
  - Verified that `dist/client/` contains zero occurrences of `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, or `sb_secret_`.
- **Verification Status:** **RESOLVED** — Verified via `git status -s` (`D .env`) and bundle grep check.

### `SEC-03` — Server-Function Authentication Middleware & Import-Protection Boundary

- **Severity:** High
- **Affected Files:** `src/integrations/supabase/auth-middleware.ts`, `src/lib/api/platform.functions.ts`, `src/lib/api/platform.server.ts`
- **Description:** `requireSupabaseAuth` was not attached to protected server functions in `src/lib/api/platform.functions.ts`, and `auth-middleware.ts` did not validate UUID format on `claims.sub` or check `VITE_SUPABASE_*` fallbacks. Additionally, importing `@tanstack/react-start/server` (`getRequest`) directly in `platform.functions.ts` outside `.server.ts` triggered TanStack Start's client import protection during `vite build`.
- **Remediation:**
  - Hardened `extractBearerToken` and `verifySupabaseBearerToken` in `src/integrations/supabase/auth-middleware.ts` to verify JWT claims via Supabase Auth, enforce UUID format on `claims.sub`, and check token expiration (`claims.exp`).
  - Moved server-only helpers (`getRequest`, rate limiting, Supabase server client) into `src/lib/api/platform.server.ts`.
  - Registered `.middleware([requireSupabaseAuth])` on `getVerifiedSessionServerFn`, `saveLearnerProfileServerFn`, `enrollCourseProtectedServerFn`, and `savePracticeAttemptProtectedServerFn`, enforcing `authorizeServerOperation(context.userId, data.targetUserId)` to block IDOR attacks.
- **Verification Status:** **RESOLVED** — Verified by `tests/security-and-production.test.ts` and clean `bun run build`.

### `SEC-04` — Client Spoofing of `verification_type` and `status` in PostgreSQL RLS Policies

- **Severity:** Medium
- **Affected Files:** `supabase/migrations/20261018000003_security_rls_hardening.sql`
- **Description:** While `practice_attempts` RLS policies verified `auth.uid() = user_id`, an authenticated user calling the Supabase PostgREST API directly with their JWT could pass `verification_type = 'verified_integration'`. Similarly, `contact_submissions_insert_public` did not constrain `status = 'received'`, and `UPDATE` policies lacked immutability triggers on `user_id` and `id`.
- **Remediation:**
  - Created and applied migration `20261018000003_security_rls_hardening.sql` to `kyjgpywuoatbhjtvkmax`.
  - Enabled `FORCE ROW LEVEL SECURITY` on all 10 tables.
  - Added `WITH CHECK (auth.uid() = user_id AND verification_type = 'user_reported')` on `practice_attempts` `INSERT` and `UPDATE` policies.
  - Added `WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND status = 'received')` on `contact_submissions_insert_public`.
  - Added `BEFORE UPDATE` triggers (`prevent_profile_identity_mutation`, `prevent_user_ownership_mutation`) preventing primary-key or `user_id` ownership reassignment.
- **Verification Status:** **RESOLVED** — Verified by live PostgreSQL 17 RLS test suite (14/14 assertions passed on `kyjgpywuoatbhjtvkmax`).

### `SEC-05` — Open-Redirect Risk in Post-Authentication Navigation

- **Severity:** Medium
- **Affected Files:** `src/lib/validation.ts`, `src/routes/login.tsx`
- **Description:** Redirecting after login using unvalidated query parameters can allow protocol-relative (`//evil.com`) or external URL redirects.
- **Remediation:**
  - Implemented `sanitizeRedirectPath(redirect, defaultPath)` in `src/lib/validation.ts`, rejecting `//`, `http:`, `https:`, `javascript:`, `data:`, and backslashes (`\`), and wired it into `src/routes/login.tsx`.
- **Verification Status:** **RESOLVED** — Verified by unit tests in `tests/security-and-production.test.ts`.

### `SEC-06` — Global AI Tutor Rate-Limit Bucket & Engine Attribution Transparency

- **Severity:** Medium
- **Affected Files:** `src/lib/api/platform.server.ts`, `src/routes/ai-tutor.tsx`, `src/routes/career.tsx`
- **Description:** `askAiTutorServerFn` used a single global rate-limit key (`ai-tutor:global`), allowing one user to exhaust the quota for all users. In addition, beta rule-based guidance needed explicit attribution so users do not mistake deterministic curriculum guidance for live generative LLM output.
- **Remediation:**
  - Scoped rate-limit buckets per caller (`ai-tutor:${callerKey}`).
  - Added `generationEngine: "deterministic_beta_engine"` and `engineBadge` to `AiTutorResponse` and displayed explicit transparency badges on `/ai-tutor` and `/career`.
- **Verification Status:** **RESOLVED** — Verified in `src/routes/ai-tutor.tsx`, `src/routes/career.tsx`, and `tests/security-and-production.test.ts`.

### `SEC-07` — Secret & Token Redaction in Server Error Logs

- **Severity:** Medium
- **Affected Files:** `src/lib/config.server.ts`, `src/start.ts`, `src/server.ts`
- **Description:** Unhandled server errors logged via raw `console.error(error)` could inadvertently output JWTs, Bearer tokens, or connection URIs.
- **Remediation:**
  - Implemented `redactSensitiveData()` and `sanitizePublicErrorMessage()` in `src/lib/config.server.ts` and wired them into `src/start.ts`, `src/server.ts`, and `src/lib/api/platform.server.ts`.
- **Verification Status:** **RESOLVED** — Verified by unit tests in `tests/security-and-production.test.ts`.

### `SEC-08` — Resume File Upload & Public Form Spam Hardening

- **Severity:** Low
- **Affected Files:** `src/lib/validation.ts`, `src/routes/career.tsx`, `src/routes/contact.tsx`, `src/components/site/SiteFooter.tsx`
- **Description:** Client-side file reading in `/career` needed MIME-type and null-byte binary rejection in addition to extension and 100 KB size checks. Public forms (`/contact`, footer newsletter) needed honeypot spam protection.
- **Remediation:**
  - Implemented `validateResumeFilePayload()` in `src/lib/validation.ts` enforcing `.txt`/`.md` extensions, allowed MIME types (`text/plain`, `text/markdown`), size `<= 100 KB`, null-byte rejection, and control-character stripping.
  - Added hidden honeypot fields (`honeypot`) validated on the server in `contactSubmissionSchema` and `newsletterSchema`.
- **Verification Status:** **RESOLVED** — Verified by `tests/security-and-production.test.ts`.

---

## 3. Live PostgreSQL 17 Row-Level Security (RLS) Verification Matrix (`kyjgpywuoatbhjtvkmax`)

Executed directly on `kyjgpywuoatbhjtvkmax` across `ROLE anon` and `ROLE authenticated` (`User A = 00000000-0000-4000-a000-000000000001`, `User B = 00000000-0000-4000-a000-000000000002`):

| Test ID | Actor    | Operation       | Target Table               | Scenario                                                                      |  Result  | Evidence                     |
| :-----: | :------- | :-------------- | :------------------------- | :---------------------------------------------------------------------------- | :------: | :--------------------------- |
|    1    | `anon`   | `SELECT`        | `courses`                  | Read published courses catalog                                                | **PASS** | `count=8`                    |
|    2    | `anon`   | `SELECT`        | `profiles`                 | Block anonymous read of user profiles                                         | **PASS** | `count=0`                    |
|    3    | `anon`   | `INSERT`        | `courses`                  | Block anonymous write to public catalog                                       | **PASS** | `RLS 42501 enforced`         |
|    4    | `anon`   | `INSERT/SELECT` | `contact_submissions`      | Allow public contact insert; block public `SELECT` of submissions             | **PASS** | `visible_rows_to_anon=0`     |
|    5    | `anon`   | `INSERT`        | `contact_submissions`      | Block forged `status='resolved'` on public contact insert                     | **PASS** | `RLS 42501 enforced`         |
|    6    | `anon`   | `INSERT/SELECT` | `newsletter_subscriptions` | Allow public newsletter subscribe; block public `SELECT` of subscriber emails | **PASS** | `visible_rows_to_anon=0`     |
|    7    | `user_a` | `SELECT`        | `profiles`                 | User A reads only own profile (not User B)                                    | **PASS** | `visible_profiles=1`         |
|    8    | `user_a` | `INSERT`        | `user_tables`              | User A inserts own enrollment, bookmark, attempt, and activity                | **PASS** | `own_enrollments=1`          |
|    9    | `user_a` | `INSERT`        | `practice_attempts`        | Block client spoofing of `verification_type='verified_integration'`           | **PASS** | `RLS 42501 enforced`         |
|   10    | `user_b` | `SELECT`        | `all_user_tables`          | User B cannot read any of User A's private records                            | **PASS** | `leaked_rows=0`              |
|   11    | `user_b` | `INSERT`        | `course_enrollments`       | Block User B forging insert with User A's `user_id`                           | **PASS** | `RLS 42501 enforced`         |
|   12    | `user_b` | `UPDATE`        | `practice_attempts`        | Block User B updating User A's practice notes                                 | **PASS** | `updated_rows=0`             |
|   13    | `user_b` | `DELETE`        | `problem_bookmarks`        | Block User B deleting User A's bookmarks                                      | **PASS** | `deleted_rows=0`             |
|   14    | `user_a` | `UPDATE`        | `course_enrollments`       | Block ownership reassignment (`user_id` mutation) on update                   | **PASS** | `Ownership mutation blocked` |
