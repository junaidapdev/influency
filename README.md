# Influency — Context & Specs Scaffold

This is the steering layer for building **Influency** with an AI coding agent (Claude Code / Cursor / Codex). Unzip it at the root of your project repo.

```
AGENTS.md                      # master, tool-neutral instructions — the single source of truth
CLAUDE.md                      # thin pointer so Claude Code auto-loads and redirects to AGENTS.md
context/
  00-chunk-map.md              # the PRD broken into shippable chunks (+ build order, dependencies)
  01-project-overview.md       # what it is, who for, flows, MVP scope, out of scope, stack
  02-architecture.md           # system design, data model, auth/storage rules, security, performance
  03-code-standards.md         # the code-review standards, encoded (each rule maps to a review point)
  04-ai-workflow-rules.md      # how the agent works: read-first, one chunk, no scope creep, ask when unclear
  05-ui-context.md             # visual style, colors, type, layout, loading/empty/error states, dates
  06-progress-tracker.md       # current phase, completed/in-progress/blocked, decisions log, next steps
  07-mobile-readiness.md       # rules to keep feature code portable to a future React Native app
specs/
  chunk-00..09-*.md            # one implementation spec per chunk — the "active feature spec"
prompts/
  claude-code-prompts.md       # one paste-in activation block per chunk (thin pointer to spec + context)
```

## Code layout (added by chunk 00)
The app is a **pnpm + Turborepo monorepo** (see `context/02-architecture.md`):
```
frontend/         # Vite + React + TS frontend (→ Vercel) — the only Node/pnpm package
backend/          # InsForge artifacts: edge functions (Deno), SQL migrations, insforge.toml
  shared/         # shared TS types + API envelope; frontend imports via the @shared alias
```

## Toolchain
- Node 20+ (developed on 24), **pnpm** (via corepack: `corepack enable pnpm`).
- Install: `pnpm install`. Build/lint/typecheck: `pnpm build` / `pnpm lint` / `pnpm typecheck` (Turborepo). Dev: `pnpm dev`.
- Backend uses the **InsForge CLI**: `npx @insforge/cli login`, then `npx @insforge/cli link --project-id <id>`, then `npx @insforge/cli metadata` to populate `.env` (copy from `.env.example`).

## How the pieces relate
- **`/context`** = steering files. Stable rules that rarely change. The agent reads all of them every session.
- **`/specs`** = per-chunk plans. The agent reads only the *active* chunk's spec.
- **`prompts/`** = what you paste into the agent to activate a chunk. Deliberately thin — the brief lives in context + specs, so the prompt can't drift from the truth.

## How to run it
1. Unzip at repo root. Create a `develop` branch off `main`.
2. Open `prompts/claude-code-prompts.md`, copy the **Chunk 00** block, paste into Claude Code.
3. Agent branches `chunk/00-foundation` off `develop`, builds, opens a PR into `develop`.
4. **You review and merge.** Then run the next chunk. Repeat through chunk 09.
5. Chunk 09 ends with the one-time `develop` → `main` merge.

## The one rule that keeps this clean
The agent **opens PRs but never merges its own work**, and **never pushes to `main`**. Author and reviewer are different roles — that's the whole point of the PR gate.
