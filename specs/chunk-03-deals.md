# Active Chunk
Chunk: 03 — Ad Deals + Deliverables + Status Machine
Branch: chunk/03-deals
Base branch: develop
Commit message prefix: Chunk 03:

# Before coding
1. Read AGENTS.md, all of /context (00→06), and /specs/chunk-03-deals.md.
2. Connect the InsForge MCP and call fetch-docs; confirm the live API for migrations, RLS policy declaration, jsonb columns, and the SDK access pattern. Don't code the schema or policies from memory.
3. Create branch chunk/03-deals off develop. (Requires chunks 01 + 02 merged — auth, app_users, brands, and the CRUD pattern must exist.)

# Scope (implement ONLY this)
A) Migration for table ad_deals:
       id               (PK)
       user_id          (FK to auth user; NOT NULL)
       brand_id         (FK to brands; NOT NULL)
       title            text NOT NULL
       deliverables     jsonb NOT NULL   -- array of { type:'story'|'post'|'reel', count:int, posted_at?:timestamptz }
       agreed_amount_sar numeric NOT NULL
       deadline         date null
       status           text NOT NULL check in ('pending','in_progress','posted','paid','cancelled') default 'pending'
       notes            text null
       created_at       timestamptz default now()
       updated_at       timestamptz default now()
   - RLS in the SAME migration: owner-only (user_id = current auth user id) for all four operations.
   - Index: ad_deals (user_id, status, deadline).
B) Shared zod schema dealSchema, including a strict schema for the deliverables array (no arbitrary jsonb shapes — validate type/count on write).
C) Feature folder features/deals/ following the chunk-02 CRUD pattern: deal.types.ts, deal.api.ts, deal.schema.ts, components/, plus useDeals hook (query keys from constants).
D) STATUS MACHINE — this is the important part. Put all transition logic in ONE module features/deals/status.ts. Allowed automatic transitions:
       pending → in_progress   (when at least one deliverable is marked posted)
       in_progress → posted    (when ALL deliverables are marked posted)
   'paid' is set later by chunk 04 (do not set it here). 'cancelled' is a manual user action.
   Never write status strings ad-hoc anywhere else — compute the next status only via this module. Recompute on every deliverable change.
E) /deals page:
       - List with filters: brand, status, month. (Reuse the indexes.)
       - "Add Deal" modal collecting brand, title, deliverables, agreed_amount_sar, deadline, notes.
       - Expandable deal row: deliverables checklist (mark each story/post/reel posted → drives the status machine), a placeholder for payment status (chunk 04), and a placeholder for a linked Snap report (chunk 07).
F) Brand detail (from chunk 02) now lists this brand's deals + a simple count. Lifetime SAR rollup comes in chunk 05 — do not build aggregation here.

# Out of scope (do NOT build)
Payments or the 'paid' transition (chunk 04). Snap report linkage (chunk 07). Dashboard rollups (chunk 05).

# Standards (binding)
No `any`. Constants for statuses, query keys, routes, messages. zod everywhere (including the deliverables shape). No console.log. Data fetching in the hook, not the view.

# Security (binding)
RLS in the same migration. deliverables jsonb validated by zod on every write. Never trust brand_id or deal_id from the client to imply ownership — RLS + a user_id = auth-uid filter gates everything. User-entered text rendered as plain text only.

# Acceptance criteria (PRD verification #2, part)
- Create a deal with 2 stories. Mark 1 posted → status becomes in_progress. Mark the 2nd → status becomes posted. Both transitions go through features/deals/status.ts, not inline code.
- Filters (brand, status, month) work.
- Second-user RLS test passes. /deals usable at 375px.

# Finish
Update /context/06-progress-tracker.md (chunk 03 → Completed; note the status machine location). Push and open a PR into develop. DO NOT merge. Stop and ask if anything architectural is unclear.