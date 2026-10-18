# PR #2 — Final review and deployment handoff

**Review date:** 2026-10-18  
**PR:** https://github.com/dusssi/bucklabs-ai-pro/pull/2  
**Reviewed original head:** `7464b2314224ddcff70d5db72f851ebe28855e51`  
**Base main:** `09e2bb12ff80b775f334eb91f586932a20c0fdcf`  
**Final status:** **READY FOR MERGE** (code review only; production deployment gate remains closed)

The findings below were resolved on the existing PR branch except owner-controlled
production configuration. No PR merge, deployment, repository relink, environment
mutation, Supabase Auth change, database mutation, or schema change was performed.
This review does not authorize an automatic merge or production rollout.

## 1. Verified facts — actual diff and security review

- Inspected the actual PR diff against freshly fetched `origin/main`, not only
  the historical report. PR #2 is open, mergeable, and has no submitted reviews
  or status checks at inspection time. An empty check list is not a CI pass.
- `vite.config.ts` explicitly enables the existing Nitro dependency's `vercel`
  preset, overrides the shared Lovable Cloudflare output defaults, and retains
  the application's `src/server.ts` SSR error wrapper. Build Output API v3
  output contains `static`, `functions/__server.func/index.mjs`, a Node 22
  function configuration, and filesystem routing followed by catch-all SSR.
- Existing Vercel project is now accessible: `bucklabsai`, project
  `prj_AdzepX3ZJzjMCxCbyBDtmQ4Pbf4q`, team `dusssis-projects`.
  Vercel domain metadata verifies `bucklabsai.vercel.app` belongs to it.
  This is management-plane verification, not a successful browser visit.
- **Wrong repository:** existing project links to **`dusssi/Buckklabs-AI`**,
  Production Branch `main`, not `dusssi/bucklabs-ai-pro`.
  The current aliased Production deployment is **READY**, ID
  `dpl_7CwChz16gXoYMVBUqQYoRDvXNuKU`, SHA
  `043e12f848edfc1f7ce6d116e14fa98e816e8791`, from that other repository.
  It is not a deployment of this PR or the audited main commit.
- Existing project settings: framework `vite`, Node `24.x`, root/output/build/
  install overrides unset. The proposed runbook uses explicit SSR packaging,
  framework Other, and the locally tested Node 22 runtime.
- Scoped environment metadata shows `VITE_SUPABASE_PROJECT_ID`,
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SITE_URL`
  in Production and Preview. Values are sensitive and not decrypted; blank
  redacted API fields are **not** evidence of empty values. Supabase project/key
  provenance cannot be verified from this metadata. Server mirror variables
  and the explicit fallback-disable variable are not listed. Middleware supports
  public-variable mirrors, so missing mirrors alone do not prove auth failure.
  `VITE_SITE_URL` is not used by this repository's auth redirects.
- No dependency versions or `bun.lock` entries changed. The new verifier uses
  already-declared `jsdom` and TanStack Start dependencies.
- Application `src/`, all `supabase/` migrations/policies, and the original
  `tests/security-and-production.test.ts` remain unchanged from PR #1's merged
  main. Verified via diff in addition to inspection of JWT middleware, auth
  attacher, input validation, own-user checks, and persistence guards.
  The nine existing security tests still pass. This does not prove that the
  older app currently deployed from the other repository has these controls.

## 2. Findings with severity and disposition

| Severity                                  | File/configuration                                                                            | Evidence / risk                                                                                                                                                                                                                    | Disposition                                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High — deployment blocker**             | Existing Vercel project → Settings → Git                                                      | Domain-owning project points at another repository; merging this PR cannot update that production site through its current Git link.                                                                                               | **Owner action required.** Do not import a duplicate project, silently disconnect the current app, or redeploy the legacy commit.                                                                                                                                                                         |
| **Medium — verification false positives** | `scripts/verify-vercel-output.mjs` (original route loop); `scripts/route-contracts.mjs`       | Original checks accepted any 200 HTML containing BUCKLABS, including wrong content or a branded error shell. Private SSR pages are loading skeletons, not authenticated workflows.                                                 | **Fixed.** Route-specific DOM contracts, referenced assets, three negative catalog routes, and explicit private-shell limitations. Eight verifier tests reject representative false positives.                                                                                                            |
| **Medium — header coverage gap**          | `nitro.config.ts`; generated `.vercel/output/config.json`; `scripts/verify-vercel-output.mjs` | Original generated Build Output manifest lacked the security headers declared in `vercel.json`; original verifier did not check them. This was an artifact-level omission, not evidence that live Vercel responses lacked headers. | **Fixed.** Explicit Nitro route rules preserve both headers in the self-contained artifact; parity/order and local SSR response assertions pass. Hosted HTML/assets/RPC headers still require live checks.                                                                                                |
| **Medium — production-path coverage gap** | `tests/journeys.test.ts`; `tests/supabase-store-contracts.test.ts`                            | Always-failing offline mock correctly isolates fallback contracts, but cannot catch broken SDK success mapping or authenticated write failures. Earlier negative tests often stopped at the unauthenticated guard.                 | **Fixed coverage gap.** Added eight isolated SDK adapter tests with production mode taking precedence over the fallback flag; actual mocked profile upsert failures must reject and never insert success activity. Kept all original journey assertions and renamed misleading individual RLS/E2E labels. |
| **Low — generated-output tooling**        | `.prettierignore`                                                                             | Newly generated `.vercel` assets were not excluded from broad formatting.                                                                                                                                                          | **Fixed.** Exclude generated deployment output; no generated artifacts committed.                                                                                                                                                                                                                         |

No remaining merge-blocking code defect was found within this PR's scope.
Hosting settings, actual credential provenance, hosted response headers, and
real-user behavior remain separate release gates, not silently accepted risks.

## 3. Automated results rerun for this review

Bun 1.3.11 via npm executable wrapper; Node 22.22.3. Frozen install uses the
tracked lockfile without changes. No production credentials are needed or printed.

| Command/check                    | Result                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile`  | Passed; lockfile unchanged                                                                            |
| `bun run typecheck`              | Passed, zero errors                                                                                   |
| `bun run lint`                   | Passed, zero errors; six existing UI React Refresh warnings                                           |
| `bun run test`                   | **40/40 passed, five suites**: original 24 plus eight route-verifier and eight Supabase adapter tests |
| `bun run build`                  | Passed: client, SSR, Nitro Vercel v3 output; Node 22 SSR function                                     |
| `bun run verify:deployment`      | Passed all packaging, SSR, negative route, security header, and RPC checks below                      |
| Client privileged-reference scan | Passed; scoped reference scan, not a comprehensive production secret audit                            |
| `git diff --check`               | Passed                                                                                                |

Build warnings remain: a client chunk exceeds 500 KB and unused SSR imports
inside dependencies. Negative security tests intentionally log missing variable
names, not values. No dependency update was introduced to suppress warnings.

### What the generated-output verifier actually proves

- V3 route manifest, Node function handler, JS/CSS assets and referenced entry
  files exist; the two security headers match `vercel.json` and precede
  filesystem handling in the generated routing config.
- All 19 routes have their expected title; public routes have their expected
  heading and route-specific form fields, controls, links, or disclosures.
  Script contents cannot satisfy visible-content checks.
- `/profile` and `/dashboard` return only the expected anonymous SSR skeletons,
  without private editors/metrics. Authentication navigation occurs after browser
  hydration and is **not** proved by these two checks.
- Unknown course, path, and problem IDs return HTTP 404.
- All seven server functions are registered under current generated IDs.
  Six POST-only functions reject GET with 405/Allow. Four protected functions
  each reject missing and malformed auth through real RPC requests.
- Uses TanStack's actual client RPC serializer against the generated Vercel
  entry; validates three public missing-input failures and a successful
  deterministic Tutor response with the expected engine disclosure.
- Checks RPC errors as deserialized errors, not just HTTP status: TanStack may
  transport an error in an HTTP 200 serialized envelope.
- Global external transport is blocked and the verifier asserts zero external
  fetch attempts. No valid-session Supabase RPC, network write, email, browser
  hydration, durability, or actual PostgreSQL two-user RLS proof is claimed.

### Journey-isolation conclusion

The original three journey tests intentionally exercise the offline test store.
Their explicit transport mock is appropriate for that scope and does not change
runtime security. They are **not** registration/email E2E or PostgreSQL RLS tests.
The added production-mode SDK tests check session/login/signup mapping, required
confirmation without a session, scoped profile reads/writes, rejection after
actual mocked upserts fail, and cross-user application authorization. These are
still mocks; only live tests with authorized identities can establish real RLS.

## 4. External access, authorization, and manual checks

**Vercel connection is no longer a blocker.** Read-only management access worked
for project listing, domain listing, current deployment retrieval, and scoped
variable metadata. No need to reconnect an already working Vercel connection.
Write permissions, Git integration reassignment, and GitHub App access to the
intended repo have not been exercised. The available project-settings update
operation does not expose a Git repository relink. That must be done safely by
an authorized owner in the existing project's dashboard.

Sandbox outbound restrictions still prevent direct production/Supabase browser
verification, and no browser automation tool or authorized test mailboxes/accounts
is supplied. Domain ownership and Vercel READY metadata do not establish live
application correctness. The previous report's full per-workflow manual checklist
remains applicable; none of its blocked live cases is upgraded to passed here.

Production environment values and intended project/key provenance remain
unverified because sensitive values were not decrypted or logged. The owner
must confirm them privately in Vercel/Supabase dashboards.

**Supabase Auth was not changed.** Although Vercel now verifies domain ownership,
the production domain still serves the other repository and its Supabase key
provenance is unverified. Repointing Auth now could affect a different live app.
At the coordinated cutover, re-read the existing Auth configuration, confirm
this app uses `kyjgpywuoatbhjtvkmax`, and configure only the minimum URLs below.
The earlier observed localhost Site URL and broad redirects are a known
release risk, not newly verified production readiness.

## 5. Exact owner actions (no duplicate project)

1. Review the updated PR #2 diff and this evidence. An authorized person must
   approve and merge it; no automatic merge or deployment is authorized here.
2. In Vercel team **dusssi's projects** → existing **bucklabsai** project,
   record the current production deployment for rollback. Confirm you intend
   to replace the app currently sourced from `dusssi/Buckklabs-AI`.
3. Prepare the existing project's build/environment settings **before triggering
   any new deployment**: framework Other, Node 22.x, root repository directory,
   `bun install --frozen-lockfile`, `bun run build`, output override disabled.
   Keep Nitro's `.vercel/output` artifact; no SPA rewrite or static `dist/client`.
4. Privately reconcile the three `VITE_SUPABASE_*` entries with project
   `kyjgpywuoatbhjtvkmax`; use only its publishable/anon key, never service-role.
   Add matching `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` mirrors as documented,
   and explicitly disable `VITE_ENABLE_LOCAL_FALLBACK` for Production. Separate
   Preview settings where practical. Never put privileged secrets in `VITE_*`.
   Rebuild after changing compile-time variables. Do not paste values into chat.
5. Only after the reviewed fix is merged and settings are ready, use
   **Settings → Git** to replace the current repository link with
   **`dusssi/bucklabs-ai-pro`**, retaining Production Branch `main` and the
   existing domain/project. If Vercel cannot select it, grant the Vercel GitHub
   App access to that repository in GitHub installation settings. Reconnecting
   Git may trigger a build: verify the merged main SHA first. Do not deploy an
   unapproved PR branch or assume a legacy deployment's Redeploy picks up a
   different repository.
6. Verify `bucklabsai.vercel.app` stays attached and the new main deployment's
   source repo/SHA, status, build/runtime logs, and alias are correct. Inspect
   real HTML/assets/RPC security headers and request behavior.
7. During coordinated cutover, in Supabase project `kyjgpywuoatbhjtvkmax` →
   **Authentication → URL Configuration**, set Site URL to
   `https://bucklabsai.vercel.app` and allow exactly:
   - `https://bucklabsai.vercel.app/dashboard` (email confirmation)
   - `https://bucklabsai.vercel.app/reset-password` (recovery)
     Keep confirmation enabled. Inventory approved local/preview clients before
     removing broad wildcard rules; replace them with exact approved URLs or use
     a separate non-production project. Do not invent `/auth/callback`.
8. Execute every workflow in `docs/POST_MERGE_DEPLOYMENT.md` with two approved
   test users/mailboxes: email confirmation/recovery, protected navigation,
   profile/enrollment/progress after refresh/re-login, practice, Tutor/Career
   disclosures, contact/newsletter, mobile/desktop, error states, and private
   row isolation. Use isolated preview data for fault injection/cross-user writes.
   Do not delete data without explicit permission. Record individual outcomes
   without tokens, passwords, keys, or email-link secrets.

The code changes are ready for owner review/merge. Deployment and live E2E are
not complete and must not be inferred from that status.
