# 03 — Code Standards

These are derived from the project's code-review notes. Each rule maps to a review point (R#) so reviews are mechanical. Where a point assumed a backend we run rather than a BaaS, the adaptation is stated.

## TypeScript
- **No `any`.** (R12) Use precise types. If a type is truly unknown at a boundary, use `unknown` and narrow it. `any` fails review.
- `strict: true` in `tsconfig`. Treat type errors as build failures.
- Shared types (deal, payment, brand, API envelope, etc.) live in one place (`backend/shared`, imported by the frontend via the `@shared` alias and by Deno edge functions by relative path). One definition, two consumers.

## Interfaces & modularity
- **Interfaces are modularized, not dumped in one file.** (R3) Co-locate a type with its domain (e.g. `features/deals/deal.types.ts`), or in `shared/types/<domain>.ts`. No `types.ts` god-file.

## Constants & environment
- **No inline magic values.** (R15) Strings, numbers, keys, route paths, query keys, statuses — all live in a constants module per domain (`constants/<domain>.ts`). If a literal appears in code, it belongs in a constants file.
- **Never read `.env` directly in app code.** (R4) Read each variable once in a single typed config module (`config/env.ts` for frontend, `config/env.ts` for edge functions) that validates presence at startup, then import from there. Direct `import.meta.env.X` / `Deno.env.get('X')` scattered through the code fails review.
- **Error messages are constants.** (R9) All user-facing and log messages live in an error-message constants module (and run through i18n for user-facing strings). No hard-coded message strings at the throw site.

## Validation
- **One validation library: zod, everywhere.** (R14) Every form, every edge-function input, every external payload is validated with a zod schema. Do not mix ad-hoc checks with a second library. Frontend forms use `react-hook-form` + the zod resolver; edge functions parse input with the same schemas (shared where possible).

## API / edge-function rules
> These apply to **edge functions we write**. The auto-generated REST that InsForge exposes over tables is InsForge's own contract — we consume it, we don't re-shape it.
- **One common response envelope** for every edge function. (R8) Shape: `{ ok: true, data }` on success, `{ ok: false, error: { code, message } }` on failure. Define it once in `shared/types/api.ts` and a helper (`ok(data)`, `fail(code, message)`); never hand-roll a response object.
- **HTTP status codes are used consistently.** (R11) 200 success, 201 created, 400 validation error, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 429 rate-limited, 500 unexpected. Codes live in a `constants/http.ts`.
- **REST conventions.** (R13) Resource-noun routes, correct verbs, no verbs-in-paths. Keep edge functions thin: validate → authorize → call RPC/DB → return the envelope.
- **DB transactions where applicable.** (R10) Any multi-row write that must be all-or-nothing runs inside a single Postgres function (RPC) called from the edge function, so it commits or rolls back atomically. The canonical case is *mark-payment-received* (updates payment + deal status + affects rollups).

## Components (frontend)
- Function components + hooks only. No class components.
- A component does one thing; extract a child or a hook when it grows two responsibilities.
- Data fetching lives in TanStack Query hooks (`hooks/useDeals.ts`, etc.), never inline in a view.
- No hard-coded English (or Arabic) in components — every string comes from the i18n catalog. (See `05-ui-context.md`.)

## Logging
- **No `console.log` in committed code.** (R7) Use a tiny logger wrapper that is a no-op in production, or remove debug logging before commit. Lint should flag `console.log`.

## Folder structure (monorepo: pnpm workspaces + Turborepo)
Root: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`.

Frontend — `frontend/`:
```
src/
  main.tsx, App.tsx
  routes/                 # one folder per page
  components/             # shared UI; shadcn primitives (components/ui)
  features/
    deals/ brands/ payments/ meetings/ snap/ reports/
      *.types.ts  *.api.ts  *.schema.ts (zod)  components/
  lib/        insforge.ts  i18n.ts  currency.ts  date.ts
  config/     env.ts
  constants/  http.ts  routes.ts  queryKeys.ts  errors.ts  <domain>.ts
  hooks/      useDeals.ts usePayments.ts ...   # TanStack Query wrappers
  locales/    ar/common.json  en/common.json
```
Backend — `backend/` (InsForge artifacts; not a published app):
```
backend/
  shared/     api.ts  http.ts  index.ts   # shared types + envelope; frontend imports via @shared
  functions/  extract-snap-report/  mark-payment-received/  ...   # Deno edge functions
  migrations/ NNNN_<name>.sql        # tables, RLS policies, indexes, RPC
  config/     env.ts                 # Deno env reader
  insforge.toml                      # config-as-code (auth, storage limits, SMTP, retention)
```
> The frontend `constants/http.ts` re-exports the HTTP status codes from `@shared/http` (`backend/shared`) so there is a single definition shared with the edge functions — no duplicated magic values.

## Naming
- Files: `kebab-case` for routes/folders, `PascalCase.tsx` for components, `camelCase.ts` for utilities/hooks.
- Types/interfaces: `PascalCase`. Constants: `UPPER_SNAKE_CASE`. zod schemas: `dealSchema`, `paymentSchema`.
- Booleans read as predicates: `isPaid`, `hasReminder`.

## Git hygiene
- **`.gitignore` excludes scratch fix-notes and tool dirs.** (R1, R2) Ignore `.cursor/`, `.DS_Store`, `node_modules`, build output, env files, and ad-hoc `*Fix.md` / scratch notes. Do **not** blanket-ignore `*.md` — `/context`, `/specs`, `/docs`, and `README` are tracked on purpose. Project docs go in those folders; never leave scratch `.md` files in the repo root.
- `.cursor/` is ignored because InsForge MCP credentials there are per-developer (browser-OAuth bound) and must not be committed. Each dev configures their own MCP locally.
