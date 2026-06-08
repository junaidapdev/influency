# AGENTS.md — Master Instructions (Influency)

> This is the single source of truth for any AI coding agent (Claude Code, Cursor, Codex, etc.) working on this repo. Tool-specific files (e.g. `CLAUDE.md`) only point back here.

## 1. Reading order — do this every session, before writing any code

1. Read this file (`AGENTS.md`) fully.
2. Read every file in `/context` in numeric order (`01` → `07`). These are the project's *steering files*: stable rules that rarely change.
3. Connect the **InsForge MCP** and call its `fetch-docs` tool. Do **not** rely on your own memory of the InsForge API — it is a young platform and your training data may be wrong or stale. Treat the live docs as authoritative.
4. Read `/context/00-chunk-map.md` to see the full plan and which chunk is active.
5. Read the **active feature spec** in `/specs/` for the current chunk. That spec, plus these context files, is your complete brief.

If anything in the active spec contradicts a context file, **stop and ask** — do not guess.

## 2. Golden rules (non-negotiable)

- **Scope discipline.** Implement *only* the active chunk's spec. Do not build ahead. Do not "improve" or refactor files outside the chunk's stated scope, even if you see something you'd do differently. If you spot a real problem outside scope, note it in `/context/06-progress-tracker.md` under *Known issues* and keep going.
- **One feature at a time.** Finish and verify the active chunk before touching the next one.
- **Ask when architecture is unclear.** A wrong architectural assumption is far more expensive than a question. If the data model, an auth boundary, or a security rule is ambiguous, ask before coding.
- **Verify, don't assume.** Before using any InsForge primitive (auth, RLS, storage, edge functions, realtime), confirm the current API via the MCP `fetch-docs` tool.
- **Update progress after every change.** When a chunk's acceptance criteria are met, update `/context/06-progress-tracker.md` (move the chunk to *Completed*, log any *Decisions made* and *Known issues*).

## 3. Standards & security

- Follow `/context/03-code-standards.md` exactly. The most-violated ones: no `any`, no inline magic values (use the constants files), no `console.log` in committed code, one validation library (zod) everywhere, one API response envelope for every edge function.
- Follow the security boundaries in `/context/02-architecture.md`. The tenant-isolation backbone is Postgres RLS (`user_id = auth.uid()` on every table). RLS is the security; everything in the client is convenience and must never be the only check.

## 4. Git protocol (per chunk)

1. Branch off `develop`: `chunk/NN-short-name` (exact name is in the chunk's spec and prompt).
2. Commit in small, logical steps. Commit message format: `Chunk NN: <what changed>`.
3. Push the branch and **open a PR into `develop`**.
4. **Do not merge.** The human reviews and merges. You are the author, not the reviewer of your own work.
5. `develop` → `main` happens once, at the end, after the final chunk passes review.

`main` is always deployable. `develop` is the integration branch. Feature work never targets `main` directly.

## 5. Definition of done (every chunk)

- [ ] All acceptance criteria in the active spec pass.
- [ ] Matches `/context/03-code-standards.md` (typecheck clean, lint clean, no `any`, no `console.log`).
- [ ] RLS / security boundaries from `/context/02-architecture.md` are in place and tested for the new tables.
- [ ] Works at 375px width (mobile-first; this is the dry-run for the future React Native port).
- [ ] `/context/06-progress-tracker.md` updated.
- [ ] PR opened into `develop`. Not merged.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **influency** (API base `https://c3yh855c.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
