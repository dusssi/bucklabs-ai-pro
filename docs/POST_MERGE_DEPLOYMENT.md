# BUCKLABS AI — Post-merge deployment verification

**Date:** 2026-10-18 (UTC)  
**Final classification:** **BLOCKED**  
**Repository:** https://github.com/dusssi/bucklabs-ai-pro  
**Inspected `main` SHA:** `09e2bb12ff80b775f334eb91f586932a20c0fdcf`  
**Fix branch:** `arena/f489797e-bucklabs-ai-pro`  
**Requested production URL:** https://bucklabsai.vercel.app/ — **not verified**  
**Deployed SHA / Vercel status:** Unknown; no deployment triggered or claimed.  
**Supabase:** `kyjgpywuoatbhjtvkmax`

## Evidence and access boundaries

- Initial working tree was clean. Local HEAD, `git ls-remote origin main`, and
  GitHub's current main commit API agreed on the SHA above (merged PR #1).
- Read `DEPLOYMENT.md`, `docs/ENVIRONMENT_SETUP.md`, `docs/BETA_READINESS.md`,
  `docs/TEST_REPORT.md`, `.env.example`, build config, implementation, and tests.
  All three migrations and security tests are present.
- Vercel connector lookup returned **disconnected**. No Vercel token or local
  project link was present. No project was created, linked, or redeployed.
  Connect Vercel in Arena to allow authorized inspection, or follow the owner
  dashboard procedure in `DEPLOYMENT.md`. Do not paste credentials into chat.
- GitHub deployment listing returned HTTP 403, **Resource not accessible by
  integration**. Latest main had no check runs and no commit status entries;
  combined status was `pending`. This does not establish a Vercel deployment.
- Direct `curl -I` to the requested production URL failed before receiving an
  HTTP response (`SSL_ERROR_SYSCALL`). Sandbox egress permits only the listed
  GitHub/package hosts, not Vercel or Supabase endpoints. This is not evidence
  that the public site is down. No live browser automation tool is available.
- Existing Vercel project identity, Git connection, Production branch, domain
  attachment, environment variables, publishable-key provenance, deployed SHA,
  deployment/build/runtime logs, and current public response remain **BLOCKED**.
  The local build uses no production credentials and cannot validate those.

## Fresh Supabase checks (read-only connector access)

- Project lookup: intended project exists, region `ap-northeast-1`,
  `ACTIVE_HEALTHY`; Auth, database, and REST health checks are healthy.
- Remote migration history contains `initial_schema_and_rls`, `seed_catalogs`,
  and `security_rls_hardening`, with versions `20261018043545`, `20261018043955`,
  and `20261018075021`. These timestamps differ from repository filenames;
  migrations were not reapplied.
- Catalog-only counts: 4 learning paths, 8 courses, 20 practice problems.
- `pg_class` / `pg_policies` / `pg_trigger` inspection: all 10 public tables have
  RLS enabled and forced; 24 policies include own-user read/write checks,
  `user_reported` verification restrictions, published-only catalog reads,
  and restricted submission inserts. Five immutable identity/ownership triggers
  and `on_auth_user_created` are enabled.
- **Scope:** metadata inspection verifies deployed controls exist. It is not a
  two-user authenticated data-isolation exercise. No private learner records
  were read, no test identities created, and no production records changed.
- Auth currently has Site URL `http://localhost:3000`, broad localhost/E2B/Vercel
  redirect wildcards, email confirmation required, signup enabled, refresh-token
  rotation enabled, and no custom SMTP host. Auth email rate limit is 2/hour;
  email delivery must be tested within those limits or with owner-configured SMTP.
- **Auth configuration not changed:** the requested domain could not first be
  verified in Vercel. Once verified, configure the exact production Site URL and
  `/dashboard`, `/reset-password` redirects documented in `DEPLOYMENT.md`.
  Inventory legitimate preview/local clients before replacing wildcard rules.

## Reproduced regressions and focused fixes

1. **Missing Vercel SSR packaging.** Original `bun run build` exited successfully
   but logged that Nitro was skipped outside Lovable and generated only
   `dist/client` and `dist/server`. Shared config defaults to Cloudflare when
   enabled in Lovable; merely choosing Vite in Vercel does not explicitly package
   this SSR application. Set `nitro.preset = vercel` and explicit Build Output API
   directories. The new build generates a v3 route manifest, static assets, and
   `functions/__server.func` with Node 22 runtime and catch-all SSR routing.
2. **Non-hermetic journey tests.** Original clean-checkout result: 21/24 passed;
   all three journeys failed because missing Supabase config was not a network
   failure. The journeys intend to exercise the existing offline test store.
   Mocked only their Supabase client transport to fail explicitly, preventing
   accidental real signups/writes, and labeled them offline store contracts.
   Production implementation and fail-closed controls were not relaxed.
3. Added `verify:deployment` to validate packaging, scan client assets for
   privileged references, and exercise 19 local SSR routes using the actual
   generated Vercel entry. Network transport is blocked inside that verifier.
   Added generated `.vercel/` output to Git and ESLint ignores.
4. Corrected the deployment runbook/environment guide: actual production domain,
   exact auth paths, SSR output, Node version, owner access steps, and no claim
   that setting an LLM key enables an unimplemented live-provider integration.

No migrations, policies, authentication middleware, production fallbacks,
production data, Auth settings, or external deployment configuration were changed.
No merge is performed. PR review is required before these fixes reach `main`.

## Fresh verification results

Bun was absent from the sandbox. Commands ran via npm's executable wrapper with
Bun **1.3.11**, using Node **22.22.3** and the repository's frozen `bun.lock`.
No real credentials were fetched or needed for local checks.

| Check                                   | Actual result                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile`         | Completed; lockfile unchanged                                                                                 |
| `bun run typecheck`                     | Passed, zero errors                                                                                           |
| `bun run lint`                          | Passed, zero errors; six existing React Refresh warnings                                                      |
| `bun run test`                          | 24/24 passed in three suites after test-only isolation fix                                                    |
| `bun run build`                         | Passed; client, SSR, and Nitro Vercel artifacts generated                                                     |
| `bun run verify:deployment`             | Passed; v3 manifest, Node SSR function, JS/CSS assets, client privileged-reference scan, 19 local HTML routes |
| `git diff --check`                      | Passed                                                                                                        |
| Vercel deployment/build/runtime logs    | **BLOCKED** — disconnected Vercel account                                                                     |
| Production environment/key verification | **BLOCKED** — cannot inspect Vercel project                                                                   |

Build warnings remain: a client chunk exceeds 500 KB and dependency SSR imports
are unused. Expected negative security tests log missing-config variable names,
not values. A privileged-reference scan is not a comprehensive proof that an
unknown production deployment contains no secrets.

Local SSR routes exercised: `/`, `/about`, `/privacy`, `/terms`, `/contact`,
`/login`, `/register`, `/forgot-password`, `/reset-password`, `/profile`,
`/dashboard`, `/learning`, `/learning/dsa-interview-mastery`, `/courses`,
`/courses/python-programming-foundations`, `/practice`,
`/practice/two-sum-lookup`, `/ai-tutor`, `/career`.
Each returned HTTP 200 HTML containing BUCKLABS. This tests local rendering only,
not authentication, hydration, data persistence, or deployment availability.

## Production workflows: individual outcomes and exact manual tests

**All entries below are BLOCKED**, not passed. Shared blockers: inaccessible
production endpoint from this sandbox, disconnected Vercel, no browser tool, and
no supplied authorized test accounts/mailboxes. Use two owner-approved test
accounts with disposable test data; redact tokens, email links, and credentials
from evidence. Prefer a separate non-production project for fault injection and
cross-user mutation attempts. Do not delete records without explicit permission.

| Workflow                               | Outcome     | Owner/manual verification                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Homepage/navigation                 | **BLOCKED** | Open production `/`; click Learn, Courses, Practice, AI Tutor, Career, Contact, About, Privacy, Terms. Hard-refresh each destination; inspect network/console for failed JS and SSR 500s.                                                                                                                                                                                                                                                       |
| 2. Registration/email confirmation     | **BLOCKED** | Use `/register` with an approved mailbox; confirm no authenticated access before confirmation. Follow the received link, verify it returns to production `/dashboard`, establishes a session, and provisions a profile. Respect Auth email limits.                                                                                                                                                                                              |
| 3. Login/logout/protected access       | **BLOCKED** | Visit `/dashboard` and `/profile` signed out; verify no private data. Log in at `/login`, check intended navigation and refresh. Log out, refresh/back-navigate, and verify private reads/writes are denied. Test an external `redirect` parameter cannot navigate off-site.                                                                                                                                                                    |
| 4. Forgot/reset password               | **BLOCKED** | Submit `/forgot-password`; follow actual recovery email to production `/reset-password`; change password. Sign out and confirm old password fails/new password works. Try expired/invalid link in incognito; no password change or false success.                                                                                                                                                                                               |
| 5. Profile create/update               | **BLOCKED** | At `/profile`, complete preferences, save, refresh, log out/in, and verify values persist for that account only.                                                                                                                                                                                                                                                                                                                                |
| 6. Learning paths/course details       | **BLOCKED** | Open `/learning/dsa-interview-mastery` and `/courses/python-programming-foundations`; check curriculum links, descriptions, navigation, and deep-link refresh.                                                                                                                                                                                                                                                                                  |
| 7. Enrollment/progress                 | **BLOCKED** | Enroll in that course, toggle a module, record progress; hard-refresh and re-login. Compare module state/dashboard percentage to actual completion and verify no duplicate enrollment.                                                                                                                                                                                                                                                          |
| 8. Practice/bookmarks/attempts         | **BLOCKED** | Open `/practice/two-sum-lookup`; verify canonical external judge link, bookmark, mark solved with a test note; refresh/re-login and check persistence. Ensure status remains explicitly learner-reported, not judge-verified.                                                                                                                                                                                                                   |
| 9a. AI Tutor                           | **BLOCKED** | On `/ai-tutor`, submit each mode; verify response, quota/error behavior, and deterministic beta-engine disclosure. Current server implementation always returns deterministic guidance; do not expect setting an API key alone to enable an LLM.                                                                                                                                                                                                |
| 9b. Career Lab                         | **BLOCKED** | On `/career`, choose a role and analyze test skills/resume; verify deterministic rubric disclosure. Accept small `.txt`/`.md`, reject wrong MIME/oversize input, clear uploaded content, and check Phase 2 labels.                                                                                                                                                                                                                              |
| 10a. Contact                           | **BLOCKED** | Submit a clearly marked approved test message at `/contact`; owner confirms one persisted row. Verify validation, honeypot, duplicate/rate-limit behavior. A failed insert must not show success.                                                                                                                                                                                                                                               |
| 10b. Newsletter                        | **BLOCKED** | Submit an approved mailbox in the footer; owner confirms persistence. Retry to verify duplicate handling; never expose subscriber lists.                                                                                                                                                                                                                                                                                                        |
| 11. Responsive layouts                 | **BLOCKED** | At 390×844 and 1440×900, inspect all core pages; open/close mobile menu, navigate by keyboard, inspect overflow, dialogs, forms, focus, and touch targets.                                                                                                                                                                                                                                                                                      |
| 12. Unavailable Supabase/failed writes | **BLOCKED** | In an isolated preview with fallback disabled, block Supabase requests in DevTools and attempt profile save, enrollment, bookmark, contact, newsletter. Require error/retry UI and no success indication or durable-state change. Restore connection and confirm real writes work. Do not break production credentials to test this.                                                                                                            |
| 13. Cross-user authorization isolation | **BLOCKED** | In separate sessions A/B, create approved private test records. Using B's browser/API client, query A's profile/enrollment/bookmark/attempt/activity IDs and attempt update/delete/reassignment. Require zero returned private rows or authorization errors, unchanged A records, and rejection of forged `targetUserId` by protected server functions. Also test anonymous access. Run on non-production data; do not record JWTs in evidence. |

## Owner completion sequence

1. Connect Vercel in Arena, or use the **existing** domain-owning project dashboard.
2. Inspect Git source/main, domain, environment scopes, and intended Supabase key
   provenance using `DEPLOYMENT.md`; do not create a replacement project.
3. Review the focused PR. If approved, owner merges it, then confirms the updated
   `main` SHA before deploying. This session branch is not a production substitute.
4. Set build settings and Production environment, then trigger the authorized
   `main` deployment. Capture deployment status, source SHA, and Production alias
   without exposing environment values.
5. Verify the domain, then correct Supabase Site URL and exact redirect URLs;
   keep preview/local use separate. Re-read Auth configuration afterward.
6. Inspect logs, exercise every live checklist item above, and record independent
   outcomes and the actual deployed SHA. Do not label this release verified until
   these checks are executed.

Until these steps have evidence, the only supported classification is **BLOCKED**.
