# 06 — Progress Tracker

> The agent updates this after every chunk. Humans read it to know where things stand. Keep it current; a stale tracker is worse than none.

## Current phase
**Phase 0 — Foundation complete.** Chunk 00 built and verified on `chunk/00-foundation`; PR open into `develop` (awaiting human review/merge). Next active chunk after merge: **01 — Auth + multi-tenancy + i18n/RTL shell**.

## Chunks

### Completed
- **00 — Foundation** — pnpm + Turborepo monorepo (`apps/web` + `packages/shared` + `backend`). Vite 8 / React 19 / TS 6 strict, Tailwind 4 + shadcn (Button), React Router 7, TanStack Query provider, react-i18next (ar/en) with `<html dir lang>` toggle, zod-validated `config/env.ts` (lint-enforced), `constants/` (http/routes/queryKeys/errors/i18n), `@influency/shared` response envelope (`ok`/`fail`) + HTTP codes, pinned `@insforge/sdk` client, `.gitignore`, `.env.example`, backend skeleton + `insforge.toml` stub. **Verified:** build + typecheck + lint clean; app boots to blank shell; toggle flips ar/rtl ↔ en/ltr; gitignore ignores `.cursor/`/scratch and tracks docs.

### In progress
_(none — chunk 00 PR awaiting review)_

### Blocked
_(none)_

## Known issues
_(none yet — log anything spotted but out of the active chunk's scope here)_

## Decisions made
- **Backend + frontend = separate folders, one repo (monorepo).** Deliberate override of review point 5; rationale in `02-architecture.md` (little owned backend on a BaaS; shared types).
- **Monorepo tooling = pnpm workspaces + Turborepo** (`apps/web` + `packages/shared` + `backend`). Supersedes the earlier "`/frontend` + `/backend` two-folder, npm" wording; `02-architecture.md`, `03-code-standards.md`, the chunk-00 spec, and the chunk map were updated in chunk 00 to match. Shared types live in `packages/shared` (`@influency/shared`), imported by the web app as a workspace package and by Deno edge functions via relative `.ts` path.
- **InsForge MCP not assumed.** The steering docs reference an InsForge MCP `fetch-docs` tool; where that MCP is unavailable, the **InsForge CLI** (`npx @insforge/cli docs ...`, `metadata`) is the authoritative equivalent and matches the deployed project version.
- **Library majors = current stable (chunk 00).** The original docs said "React 18 / React Router v6"; the actual installed stack is **React 19, React Router 7, Vite 8, Tailwind 4, TypeScript 6, Zod 4, ESLint 10**. For a greenfield in 2026 the current stable majors are the right default and interoperate cleanly (build/typecheck/lint verified). If a specific dependency needs React 18 later, revisit then.
- **InsForge project linked via CLI, not committed.** `npx @insforge/cli login` is browser-interactive; link with `npx @insforge/cli link --project-id 2a6142a7-a02d-48e2-940a-2ea54b6ee8f9`, then `metadata` to populate root `.env` (gitignored) with `VITE_INSFORGE_BASE_URL` + `VITE_INSFORGE_ANON_KEY`. Chunk 00 ships with placeholder env so the shell boots; chunk 01 needs the real values.
- **Stay on InsForge.** Confirmed. Treat its API as authoritative via the MCP `fetch-docs` tool; pin the SDK version; expect doc gaps (young platform).
- **Edge runtime is Deno** → no server-side PDF rasterization. PDFs converted to PNG **client-side (pdf.js)**; edge function always gets an image.
- **Snap result delivery via realtime (WebSocket pub/sub)**, not polling.
- **Dates:** store ISO/Gregorian (UTC); display **Hijri (Umm al-Qura) + Gregorian**, Hijri leading in Arabic locale.
- **Reminders created in application/edge code, not Postgres triggers** (testable, visible).
- **Profile table named `app_users`** (auth `users` is InsForge's; `app_users` is our extension).
- **DB transactions on a BaaS** = Postgres functions (RPC) called from edge functions; canonical case is `mark-payment-received`.
- **Atomic mutation pattern** established for any multi-row all-or-nothing write.
- **Deploy:** frontend on Vercel; backend on InsForge. Accounts already provisioned (InsForge, OpenAI, Google OAuth).

## Next steps
1. **Human review + merge** the chunk 00 PR into `develop`.
2. Before chunk 01: `npx @insforge/cli login && link --project-id 2a6142a7-... && metadata`; put the real `VITE_INSFORGE_*` values in root `.env`. Connect the InsForge MCP if available (otherwise use the CLI for `fetch-docs`).
3. Chunk 01 (auth + multi-tenancy + i18n/RTL shell) — first data + the RLS second-user isolation test.
