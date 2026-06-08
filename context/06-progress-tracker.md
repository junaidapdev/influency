# 06 — Progress Tracker

> The agent updates this after every chunk. Humans read it to know where things stand. Keep it current; a stale tracker is worse than none.

## Current phase
**Phase 0 — Foundation.** Context system authored. No code written yet. Active chunk: **00 — Repo & tooling foundation** (`chunk/00-foundation`).

## Chunks

### Completed
_(none yet)_

### In progress
- **00 — Foundation** — not started.

### Blocked
_(none)_

## Known issues
_(none yet — log anything spotted but out of the active chunk's scope here)_

## Decisions made
- **Backend + frontend = separate folders, one repo (monorepo).** Deliberate override of review point 5; rationale in `02-architecture.md` (little owned backend on a BaaS; shared types).
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
1. Run chunk 00 (foundation).
2. Then chunk 01 (auth + multi-tenancy + i18n/RTL shell) — first data + the RLS second-user isolation test.
