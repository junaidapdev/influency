# Active Chunk
Chunk: 02 — Brands CRUD + RLS
Branch: chunk/02-brands
Base branch: develop
Commit message prefix: Chunk 02:

# Before coding
1. Read AGENTS.md, all of /context (00→06), and /specs/chunk-02-brands.md.
2. Connect the InsForge MCP and call fetch-docs; confirm the live API for migrations, RLS policy declaration, and the auto-generated REST/SDK access pattern for a table. Don't code the schema or policies from memory.
3. Create branch chunk/02-brands off develop. (Requires chunk 01 merged into develop — auth + app_users + RLS pattern must already exist.)

# Scope (implement ONLY this)
This chunk establishes the REUSABLE CRUD PATTERN that chunks 03–08 copy. Build it cleanly:
A) Migration for table brands:
       id            (PK)
       user_id       (FK to the auth user; NOT NULL)
       name_en       text NOT NULL
       name_ar       text NOT NULL
       contact_name  text null
       contact_email text null
       contact_phone text null
       notes         text null
       created_at    timestamptz default now()
   - RLS in the same migration: owner-only (user_id = current auth user id) for select/insert/update/delete.
   - Index: brands (user_id) — keep reads scoped and fast.
B) Shared zod schema brandSchema (name_en/name_ar required; email is a valid email if present; phone validated if present). Put it in the shared schema location so frontend + any edge function reuse it.
C) Feature folder features/brands/: brand.types.ts, brand.api.ts, brand.schema.ts, components/.
D) TanStack Query hook useBrands (list/create/update), with query keys from constants/queryKeys.ts.
E) /brands page:
       - Directory list of the user's brands.
       - Add + Edit (modal or sub-route) using react-hook-form + the zod resolver; field errors localized from the i18n catalog; submit disabled while pending.
       - A designed empty state: one line of copy + "Add your first brand" primary action.
       - Brand detail screen MAY render a placeholder section for "deals + lifetime total + last engagement" — those are filled by chunks 03/05. Do not build deal logic here.

# Out of scope (do NOT build)
ad_deals or anything that depends on it (lifetime totals, last-engagement date, deal counts). Payments, meetings, snap.

# Standards (binding)
No `any`. Constants for query keys, routes, statuses, messages. zod everywhere. No console.log. Components are function components + hooks; data fetching lives in the hook, not the view.

# Security (binding)
RLS policies in the SAME migration as the table — no exceptions. Contact fields are user-entered, untrusted: render as plain text, never HTML; no dangerouslySetInnerHTML. Validate email/phone via zod. Never trust a brand id from the client to imply ownership — RLS + a user_id = auth-uid filter gates every read/write.

# Acceptance criteria
- Create, edit, and list brands; each user sees ONLY their own (second-user RLS test passes).
- Validation errors are localized; empty state renders with its primary action.
- /brands fully usable at 375px width.

# Finish
Update /context/06-progress-tracker.md (chunk 02 → Completed; note that the reusable CRUD pattern is now established and where it lives, so later chunks reference it). Push and open a PR into develop. DO NOT merge. Stop and ask if anything architectural is unclear.