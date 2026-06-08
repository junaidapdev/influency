# 04 — AI Workflow Rules

Rules for how an AI coding agent works on this repo. (`AGENTS.md` is the master; this expands the workflow specifics.)

## Before coding
1. **Read context first.** `AGENTS.md` → `/context/01`…`06` → this file. Every session, not just the first.
2. **Pull live InsForge docs.** Connect the InsForge MCP, call `fetch-docs`. Do not write backend code from memory of the InsForge API — verify the current surface (auth, RLS, storage, edge-function signature, realtime API) first.
3. **Read the active spec.** Open `/context/00-chunk-map.md`, find the active chunk, read its `/specs/chunk-NN-*.md`. That spec + context = the full brief.

## While coding
- **One feature at a time.** Implement only the active chunk. Do not start the next chunk's work.
- **Do not refactor unrelated files.** Stay inside the chunk's stated scope. If you spot a genuine problem elsewhere, log it under *Known issues* in `06-progress-tracker.md` and leave it alone.
- **Follow the standards.** `03-code-standards.md` is binding: no `any`, no inline constants, no `console.log`, zod for all validation, one response envelope for edge functions.
- **Apply the security boundaries.** New tables get RLS policies in the same change. Never ship a data table without `user_id = auth.uid()` policies.
- **Small commits.** Logical steps, message format `Chunk NN: <change>`.

## When to stop and ask
Ask the human before proceeding if:
- The data model or an auth/security boundary is ambiguous or seems to need a change.
- The spec conflicts with a context file.
- A standard can't be met without an architectural change (e.g. an InsForge limitation blocks the planned approach).
A wrong architectural assumption costs more than a question. Asking is the senior move, not a failure.

## After each change
- Run typecheck + lint; fix before commit.
- Verify the chunk's acceptance criteria (including the RLS second-user test for data chunks, and 375px responsiveness).
- **Update `06-progress-tracker.md`:** move the chunk to *Completed*, record any *Decisions made* and *Known issues*, set *Next steps*.
- Push the branch and open a PR into `develop`. **Do not merge** — the human reviews and merges.

## What never to do
- Never commit secrets, `.env` files, or `.cursor/`.
- Never weaken or skip RLS "to make it work for now."
- Never invent an InsForge API call you haven't confirmed via `fetch-docs`.
- Never merge your own PR or push to `main` directly.
