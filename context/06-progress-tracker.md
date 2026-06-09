# 06 — Progress Tracker

> The agent updates this after every chunk. Humans read it to know where things stand. Keep it current; a stale tracker is worse than none.

## Current phase
**Phase 2 — Brands CRUD: implementation complete, PR open, runtime UI verification pending.** Chunk 01 merged into `develop` (PR #2). Chunk 02 built on `chunk/02-brands` off `develop`; PR open into `develop`. Static checks (build + typecheck + lint) clean; the `brands` migration is applied to the live backend (`20260609120000`) with all four RLS policies + the `user_id` index live. **Not yet runtime-verified:** the brands UI in a browser and the second-user RLS isolation test — both blocked by the same gate as chunk 01 (no completed sign-in yet, so no authenticated session to drive the auth-gated page).

## Chunks

### Completed
- **00 — Foundation** — pnpm + Turborepo monorepo, **two top-level folders: `frontend/` + `backend/`** (shared types in `backend/shared`, imported via the `@shared` alias). Vite 8 / React 19 / TS 6 strict, Tailwind 4 + shadcn (Button), React Router 7, TanStack Query provider, react-i18next (ar/en) with `<html dir lang>` toggle, zod-validated `config/env.ts` (lint-enforced), `constants/` (http/routes/queryKeys/errors/i18n), response envelope (`ok`/`fail`) + HTTP codes in `backend/shared`, pinned `@insforge/sdk` client, `.gitignore`, `.env.example`, backend skeleton + `insforge.toml` stub. **Verified:** build + typecheck + lint clean; app boots to blank shell; toggle flips ar/rtl ↔ en/ltr; gitignore ignores `.cursor/`/scratch and tracks docs.

- **01 — Auth + multi-tenancy + i18n/RTL shell** — merged into `develop` via PR #2. Auth (Google OAuth + email/password + email verification), `app_users` + RLS (live), first-login `ensureAppUser`, `ProtectedRoute`, react-i18next ar/en shell with `<html dir lang>` toggle, dual Hijri+Gregorian dates, SAR currency, empty dashboard. **Code merged; runtime auth checks still outstanding (see Known issues).**

### In progress
- **02 — Brands CRUD + RLS** — code complete, PR open into `develop` (not merged). `brands` table + 4 owner-only RLS policies + `user_id` index (migration applied live); shared `brandFormSchema`/`brandSchema` (zod), `features/brands/` (types/schema/api/components), `useBrands` TanStack hook, `/brands` page (directory list, add/edit modal, designed empty state), nav link. Establishes the reusable CRUD pattern chunks 03–08 copy. Awaiting human review + runtime UI verification.

### Blocked
_(none)_

## Known issues
- **Auth flows not yet exercised end-to-end.** `app_users` has 0 rows; sign-in/sign-up have never been run against the live backend. The first real sign-in is the first exercise of the whole path.
- **Email verification delivery unconfirmed.** `[auth.smtp] enabled = false` on the live project, so email/password OTP delivery is untested — may require SMTP credentials (Resend/SendGrid/SES/etc.) before email signup works.
- **Google OAuth pending live test.** Own Google credentials added in the InsForge dashboard; dev redirect URLs (`http://localhost:5173`, `/dashboard`, `/login`) added to `allowed_redirect_urls`. Full sign-in flow not yet completed in a real browser.
- **Second-user RLS isolation test not yet run** (PRD verification #6). Needs two real users.
- **Config-as-code drift.** Live auth config (email verification, `allowed_redirect_urls`) was set via the CLI/dashboard; the committed `insforge.toml` is still the chunk-00 stub and does not yet capture the `[auth]` section. Reconcile before deploy.
- **Brands UI + second-user RLS test not yet run (chunk 02).** `/brands` is auth-gated, so its UI and the per-tenant isolation test can't be exercised until a real sign-in succeeds (same blocker as the chunk-01 auth items above).
- **`brandSchema` kept feature-local, not in `backend/shared` (chunk 02 deviation).** Spec 02-B says put the shared zod schema in `backend/shared`, but `zod` resolves only from `frontend/node_modules` (pnpm, not hoisted) and there is no Deno import map — a zod schema in `backend/shared` cannot be resolved by the frontend build or by Deno today, and brands has no edge function. Followed the chunk-01 precedent (`features/auth/auth.schema.ts`) and put it in `features/brands/brand.schema.ts`. When an edge function first needs to share an input schema (chunk 04/07), set up backend zod + a Deno import map and move shared schemas then.
- **Migrations live in `backend/migrations/` but the CLI looks in `./migrations` (cwd-relative).** Applying requires staging the `.sql` into root `./migrations`, running `db migrations up`, then cleaning up (root `./migrations` is an empty, untracked dir). Worth a permanent fix (a CLI migrations-dir setting or relocating the canonical dir) before chunk 03 adds more tables.
- **Preview harness can't launch the dev server for this monorepo.** Via `.claude/launch.json` the Vite dev server fails to apply the `@`/`@shared` aliases (cold config load); `pnpm build`, `pnpm typecheck`/`lint`, and a directly-launched dev server all resolve fine. Local tooling only — no effect on the app or the PR.

## Decisions made
- **Backend + frontend = separate folders, one repo (monorepo).** Deliberate override of review point 5; rationale in `02-architecture.md` (little owned backend on a BaaS; shared types).
- **Monorepo tooling = pnpm workspaces + Turborepo**, with **two top-level folders: `frontend/` + `backend/`** (per the user's explicit request and the original `02-architecture.md` layout — npm was swapped for pnpm + Turbo, but the frontend/backend split was kept). No `apps/` or `packages/`. Shared types live in **`backend/shared`** (the API we own is backend-defined): the frontend imports them via the `@shared` path alias; Deno edge functions import the same `.ts` files by relative path. `02-architecture.md`, `03-code-standards.md`, the chunk-00 spec, the chunk map, and README were updated to match.
- **InsForge MCP not assumed.** The steering docs reference an InsForge MCP `fetch-docs` tool; where that MCP is unavailable, the **InsForge CLI** (`npx @insforge/cli docs ...`, `metadata`) is the authoritative equivalent and matches the deployed project version.
- **Library majors = current stable (chunk 00).** The original docs said "React 18 / React Router v6"; the actual installed stack is **React 19, React Router 7, Vite 8, Tailwind 4, TypeScript 6, Zod 4, ESLint 10**. For a greenfield in 2026 the current stable majors are the right default and interoperate cleanly (build/typecheck/lint verified). If a specific dependency needs React 18 later, revisit then.
- **InsForge linked + skills installed (done).** Project **influency** (`2a6142a7-...`, appkey `c3yh855c`, region `ap-southeast`, base `https://c3yh855c.ap-southeast.insforge.app`). Logged in via `--user-api-key`; `link` installed the agent skills (`insforge`, `insforge-cli`, `insforge-debug`, `insforge-integrations`, `find-skills`) and appended an `<!-- INSFORGE -->` block to `AGENTS.md`. Root `.env` (gitignored) holds `VITE_INSFORGE_URL` + `VITE_INSFORGE_ANON_KEY` (public `role: anon` key from `secrets get ANON_KEY`). The admin `ik_` key stays in `.insforge/project.json` (gitignored) for `createAdminClient` only — never bundled. **Env var convention corrected** to InsForge's `VITE_INSFORGE_URL` (was `VITE_INSFORGE_BASE_URL`).
- **Auth facts confirmed from `metadata`** (for chunk 01): OAuth google + github enabled, email verification on (code method), password min length 6. RLS uses `auth.uid()`; FK to `auth.users(id)`.
- **Tailwind v4 vs skill's v3.4 note.** The InsForge SDK skill suggests Tailwind v3.4; we are on v4 (builds clean, shadcn supports v4). Kept v4; revisit only if an InsForge deploy template needs v3.4.
- **Stay on InsForge.** Confirmed. Treat its API as authoritative via the MCP `fetch-docs` tool; pin the SDK version; expect doc gaps (young platform).
- **Edge runtime is Deno** → no server-side PDF rasterization. PDFs converted to PNG **client-side (pdf.js)**; edge function always gets an image.
- **Snap result delivery via realtime (WebSocket pub/sub)**, not polling.
- **Dates:** store ISO/Gregorian (UTC); display **Hijri (Umm al-Qura) + Gregorian**, Hijri leading in Arabic locale.
- **Reminders created in application/edge code, not Postgres triggers** (testable, visible).
- **Profile table named `app_users`** (auth `users` is InsForge's; `app_users` is our extension).
- **DB transactions on a BaaS** = Postgres functions (RPC) called from edge functions; canonical case is `mark-payment-received`.
- **Atomic mutation pattern** established for any multi-row all-or-nothing write.
- **Deploy:** frontend on Vercel; backend on InsForge. Accounts already provisioned (InsForge, OpenAI, Google OAuth).
- **RLS = standard Postgres `CREATE POLICY` (chunk 01).** Confirmed working on InsForge: per-operation policies `TO authenticated` with `user_id = (SELECT auth.uid())` in `USING`/`WITH CHECK`. Shipped in the same migration as `app_users` (`20260608172000_create-app-users.sql`), plus explicit `GRANT`s to `authenticated`. Verified live via `insforge db policies`.
- **Auth specifics (chunk 01).** Google OAuth uses InsForge's built-in provider (own client credentials added in the dashboard for branding); email verification method = `code` (6-digit OTP); password min length 6. `signInWithOAuth` redirects to `${origin}/dashboard`; `getCurrentUser` drives session hydration on load.
- **Dual-calendar dates (chunk 01).** `lib/date.ts` formats via `Intl.DateTimeFormat` with `islamic-umalqura` + `gregory`, UTC time zone; Hijri leads when locale is `ar`. `lib/currency.ts` formats SAR via `Intl.NumberFormat` (ar-SA / en-US).
- **Reusable CRUD pattern (chunk 02) — chunks 03–08 copy this.** Per table: migration with `id uuid default gen_random_uuid()`, `user_id` FK NOT NULL, 4 owner-only RLS policies (`TO authenticated`, `user_id = (SELECT auth.uid())`), a `(user_id)` index, and `GRANT`s — all in one migration. Frontend: `features/<domain>/` holds `<domain>.schema.ts` (zod: a form schema with all-string fields + a row schema that parses every API response), `<domain>.types.ts` (z.infer), `<domain>.api.ts` (insforge.database calls that filter by `user_id` AND rely on RLS — defense in depth, no IDOR; empty optionals mapped to NULL at the boundary). Data access is a `hooks/use<Domain>.ts` TanStack hook keyed from `constants/queryKeys.ts`; the view never calls the API directly. Forms use react-hook-form + zodResolver, localized errors, submit disabled while pending; lists have a designed empty state.
- **Add/edit UI = lightweight modal, no new dep (chunk 02).** `BrandFormDialog` is a self-built accessible overlay (`role="dialog"`, Escape-to-close, backdrop click), keyed by brand id so it remounts with fresh defaults — chosen over adding `@radix-ui/react-dialog`. shadcn currently only ships `Button`; revisit a real Dialog primitive if modals proliferate.

## Next steps
1. **Runtime-verify chunk 01 auth:** sign in with Google in a real browser → land on `/dashboard`; confirm the `app_users` row is created with `locale='ar'`, `default_currency='SAR'`, `reminder_lead_minutes=60`. (Unblocks all UI verification, including chunk 02.)
2. **Runtime-verify chunk 02 brands:** once signed in, create/edit/list brands; confirm validation + empty state; run the **second-user RLS isolation test** (PRD #6) against `brands` (and `app_users`).
3. **Decide on SMTP** for email/password verification (built-in vs. own provider) and confirm OTP delivery.
4. **Human review + merge** the chunk 02 PR into `develop`. Then start chunk 03 (ad deals + status machine).
