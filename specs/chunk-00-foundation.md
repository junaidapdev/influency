# Spec — Chunk 00: Repo & Tooling Foundation

**Branch:** `chunk/00-foundation` · **Base:** `develop` · **Depends on:** —

## Objective
Stand up the monorepo and make every code standard *real before any feature code exists*, so rules are enforced from line one rather than retrofitted.

## In scope
- Monorepo via **pnpm workspaces + Turborepo**: `apps/web`, `packages/shared`, `backend/`, plus committed `/context`, `/specs`, `/docs`. Root config: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`. Commit `AGENTS.md` and `CLAUDE.md` at root.
- Frontend (`apps/web`): Vite + React 18 + TypeScript (`strict: true`), Tailwind CSS + shadcn/ui, React Router v6, TanStack Query provider, react-i18next bootstrap (catalogs can be near-empty), ESLint + Prettier (lint rule flagging `console.log`).
- `config/env.ts` (frontend) — read + validate env vars once (zod), export typed config. No direct `import.meta.env` elsewhere.
- `constants/` modules: `http.ts` (status codes), `routes.ts`, `queryKeys.ts`, `errors.ts`. Seed with what's known.
- `packages/shared` (`@influency/shared`): `types/api.ts` + helpers `ok(data)` / `fail(code, message)` (the one response envelope) and `constants/http.ts` (status codes). The frontend `constants/http.ts` re-exports these.
- `apps/web/src/lib/insforge.ts` — SDK client (pinned `@insforge/sdk` version), reading config from `config/env.ts`.
- Backend: `backend/functions/`, `backend/migrations/`, `backend/config/env.ts`, `backend/insforge.toml` scaffolding (empty but structured). Confirm edge-function shape via InsForge CLI docs (`npx @insforge/cli docs ...`) — the InsForge MCP `fetch-docs` is the equivalent if the MCP is connected.
- `.gitignore`: `node_modules`, build output, `.env*`, `.cursor/`, `.DS_Store`, scratch `*Fix.md` / scratch notes. Do **not** ignore `/context`, `/specs`, `/docs`, `README`.

## Out of scope
Any feature, table, page, or auth logic. No business data.

## Acceptance criteria
- `pnpm install` then `pnpm build`, `pnpm typecheck`, and `pnpm lint` (all via Turborepo) pass clean on a fresh clone.
- App boots to a blank routed shell; language toggle scaffold flips `<html dir lang>`.
- Importing env anywhere except `config/env.ts` would fail review (pattern established + documented).
- `.gitignore` verified: a dummy `.cursor/` and a `ScratchFix.md` are ignored; `context/*.md` is tracked.

## Security notes
No secrets committed. `.env.example` documents required vars (names only). InsForge SDK reads keys from env, never inline.

## Done
- [ ] Acceptance criteria pass · [ ] standards enforced by tooling · [ ] PR into `develop` · [ ] `06-progress-tracker.md` updated.
