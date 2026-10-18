# BUCKLABS AI — Environment & Deployment Setup Guide

> **Security Policy:** Never commit real API keys, tokens, database passwords, or `.env` files to version control. All examples below use safe placeholders.

---

## 1. Authoritative Supabase Project Reconciliation

During the security audit, two project references were investigated:

- `gnbnvyhepmkrbpnsobbo` — Legacy template reference present in the initial Lovable scaffold commit (`aaf4fe0`).
- `kyjgpywuoatbhjtvkmax` — Authoritative project (_dusssi's Project_, region `ap-northeast-1`, PostgreSQL 17.6) owned by the authenticated organization (`xlmibfxgbzehzpvbcuqh`).

`supabase/config.toml` and all database migrations (`20261018000001_initial_schema_and_rls.sql`, `20261018000002_seed_catalogs.sql`, `20261018000003_security_rls_hardening.sql`) are aligned with **`kyjgpywuoatbhjtvkmax`**.

---

## 2. Environment Variable Reference

Create a local `.env` file (copied from `.env.example`) for local development, and configure the same variable names in **Vercel Project Settings -> Environment Variables** for `Preview` and `Production`:

| Variable Name                   | Scope              | Required | Description & Safe Placeholder                                                                                                               |
| :------------------------------ | :----------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_PROJECT_ID`      | Client & SSR       |   Yes    | Supabase project reference ID (e.g., `your-supabase-project-ref`)                                                                            |
| `VITE_SUPABASE_URL`             | Client & SSR       |   Yes    | Public Supabase project URL (`https://your-supabase-project-ref.supabase.co`)                                                                |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client & SSR       |   Yes    | Public Supabase anon/publishable key (`your-supabase-anon-or-publishable-key`). Enforce security via RLS; never use a service-role key here. |
| `SUPABASE_URL`                  | Server Only        |   Yes    | Server-side Supabase URL (`https://your-supabase-project-ref.supabase.co`)                                                                   |
| `SUPABASE_PUBLISHABLE_KEY`      | Server Only        |   Yes    | Server-side Supabase anon/publishable key (`your-supabase-anon-or-publishable-key`)                                                          |
| `VITE_ENABLE_LOCAL_FALLBACK`    | Dev / Sandbox Only |    No    | Must be `"false"` or unset in Production. Set to `"true"` only in isolated offline development sandboxes.                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server Only        |    No    | Optional privileged key for administrative server tasks. **NEVER prefix with `VITE_`.**                                                      |
| `OPENAI_API_KEY`                | Server Only        |    No    | Optional server-only LLM API key. **NEVER prefix with `VITE_`.**                                                                             |
| `AI_MODEL_ID`                   | Server Only        |    No    | Optional model identifier (defaults to `gpt-4o-mini`).                                                                                       |

---

## 3. Startup Environment Validation

`src/lib/config.server.ts` provides `validateServerEnv()` which automatically verifies:

1. `SUPABASE_URL` (or `VITE_SUPABASE_URL`) is present and uses `https://` in non-local environments.
2. `SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`) is present.
3. No client-visible `VITE_*` variable contains a service-role key, secret token (`sb_secret_`, `sk-`, `sbp_`), or private credential.

---

## 4. Supabase Authentication URL Configuration

On project `kyjgpywuoatbhjtvkmax`, the following authentication settings are configured:

- **Refresh Token Rotation:** Enabled (`refresh_token_rotation_enabled = true`, reuse interval `10s`)
- **Allowed Redirect URIs (`uri_allow_list`):**
  - `http://localhost:3000/**`
  - `http://localhost:8080/**`
  - `https://*.e2b.app/**`
  - `https://*.vercel.app/**`

When a custom production domain is attached in Vercel, update **Site URL** in **Supabase Dashboard -> Authentication -> URL Configuration** to match the primary production domain.

---

## 5. Vercel Build & Deployment Settings

- **Framework Preset:** Other / Vite (TanStack Start SSR)
- **Install Command:** `bun install`
- **Build Command:** `bun run build`
- **Node.js Runtime Version:** `20.x` or `22.x`
- **Security Headers (`vercel.json`):**
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
