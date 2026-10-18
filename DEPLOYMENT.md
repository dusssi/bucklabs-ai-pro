# BUCKLABS AI — Vercel Deployment & Operations Runbook

## Architecture and deployment gate

React 19 / TanStack Start SSR / Vite 7 / Bun; Supabase project
`kyjgpywuoatbhjtvkmax`; Vercel hosting. This is **not** a static Vite SPA.
See [the post-merge verification report](docs/POST_MERGE_DEPLOYMENT.md) for current
execution evidence and blocked live checks. Previous readiness reports do not prove deployment.

## 1. Inspect the existing Vercel project first

1. In Vercel, select the existing team/project that owns `bucklabsai.vercel.app`.
   Do not import a second project or reassign its domain.
2. Under **Settings → Git**, verify repository `dusssi/bucklabs-ai-pro` and
   Production Branch `main` (the label may be under Production environment settings).
3. Under **Settings → Domains**, verify `bucklabsai.vercel.app` belongs to that
   project and has valid configuration. Open it in a real browser.
4. In **Deployments**, inspect the current Production deployment, its Git source
   SHA, deployment URL, build logs, runtime logs, and status. An HTTP 200 alone
   does not establish which commit is deployed.
5. Review any deployment-fix PR before deployment. This session never merges it.

## 2. Environment variables

Use `.env.example` and [ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md).
In **Settings → Environment Variables**, configure Production scope:

- `VITE_SUPABASE_PROJECT_ID`: the authoritative project reference above.
- `VITE_SUPABASE_URL` and `SUPABASE_URL`: that project's Supabase API URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PUBLISHABLE_KEY`: the same
  publishable (or legacy **anon**, never service-role) key from that project's
  **Settings → API Keys**. Verify its source in the dashboard without copying
  values into logs, screenshots, reports, or chat.
- `VITE_ENABLE_LOCAL_FALLBACK`: explicitly disabled for Production.

No privileged key is required for the implemented learner workflows. Never set a
service-role key, AI provider secret, or management token in **any** `VITE_*`
variable. The current Tutor and Career Lab use deterministic engines; adding an
`OPENAI_API_KEY` alone does not enable a live provider integration.

Configure Preview separately; prefer a separate non-production Supabase project.
Client `VITE_*` configuration is compiled at build time: redeploy after changes.
Do not export environment values or use verbose CLI commands that print them.

## 3. Build settings

- **Framework Preset:** Other (explicit Nitro Vercel adapter, not static Vite).
- **Root Directory:** repository root.
- **Node.js:** 22.x (tested locally on Node 22).
- **Install Command:** `bun install --frozen-lockfile` (repository default is
  `bun install`; either uses the tracked Bun lockfile).
- **Build Command:** `bun run build`.
- **Output Directory:** leave override disabled. Nitro emits Vercel Build Output
  API v3 into `.vercel/output`, including `functions/__server.func`, `static`,
  and `config.json`. Do **not** set the output to `dist/client`, `dist`, or add
  an SPA rewrite; server functions and authentication require SSR routing.
- `vercel.json` retains the existing security headers and build command.

`vite.config.ts` explicitly enables Nitro's `vercel` preset and output paths.
Without that override the shared Lovable config skips Nitro outside Lovable;
its sandbox default is Cloudflare, not Vercel.

Before shipping:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build
bun run verify:deployment
```

`verify:deployment` validates the manifest, Node function, asset presence,
privileged-reference scan, and 19 local SSR HTML responses. It blocks external
transport and performs no database writes; it does not test browser hydration,
email, production credentials, durable persistence, or real-user RLS isolation.

## 4. Supabase Auth URLs — only after verifying the domain

In project `kyjgpywuoatbhjtvkmax` → **Authentication → URL Configuration**:

- Site URL: `https://bucklabsai.vercel.app`
- Exact Production Redirect URLs:
  - `https://bucklabsai.vercel.app/dashboard` (registration confirmation)
  - `https://bucklabsai.vercel.app/reset-password` (password recovery)

These match `registerUser()` and `requestPasswordReset()` in
`src/services/platform-store.ts`; there is no separate `/auth/callback` route.
Keep email confirmation enabled. Verify actual email delivery, link destination,
and session establishment; configuration inspection alone cannot prove them.

Prefer separate Auth configuration/projects for local and preview use. If one
project must be shared, add only known origins with the same two exact paths
(e.g. localhost ports actually used). Inventory legitimate preview clients before
removing existing rules. Replace broad `*.vercel.app` and `*.e2b.app` wildcards
with exact approved URLs; do not add new wildcards.

## 5. Deploy and verify

Once access, environment, Git source, and build settings are confirmed, deploy
from `main` via the existing project's Git integration or redeploy the intended
`main` deployment. If a PR changes packaging, the owner must authorize and merge
it before that version exists on `main`. Do not promote this session branch to
Production as a substitute.

Confirm **Ready**, the Production alias, and the expected source SHA in Vercel.
Inspect build and runtime logs for missing config, import failures, route errors,
and SSR 500s. Run every live checklist item in
[POST_MERGE_DEPLOYMENT.md](docs/POST_MERGE_DEPLOYMENT.md); never substitute local
contract tests for live verification. Recheck security headers on HTML and assets.

## 6. Database safety and rollback

All three migrations are in `supabase/migrations/`: initial schema/RLS, catalog
seeds, and security hardening. Remote migration timestamps differ from local
filenames; inspect history and schema before applying anything. Do not rerun
migrations merely to fix deployment settings.

For an application rollback use the existing project's **Deployments → last
healthy Production deployment → Instant Rollback**, then recheck auth URLs and
critical workflows. Migrations are not automatic rollback scripts: even an
`IF NOT EXISTS` migration can change policies, triggers, or seed records. Take a
backup and obtain explicit authorization before any database change. This
post-merge task requires no schema changes, test-account deletion, or data purge.
