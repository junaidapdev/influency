# Spec — Chunk 03: Ad Deals + Deliverables + Status Machine

**Branch:** `chunk/03-deals` · **Base:** `develop` · **Depends on:** 02

## Objective
Deals with deliverables and an automatic status machine — the operational heart of the app.

## In scope
- `ad_deals` migration + RLS + index `(user_id, status, deadline)`. Fields per `02-architecture.md` (incl. `deliverables` jsonb, `agreed_amount_sar`, `deadline`, `status`, `updated_at`).
- zod schema; `features/deals/`; `useDeals` hook.
- `/deals`: list with filters (brand, status, month), add/edit modal collecting brand, title, deliverables, agreed SAR, deadline, notes. Expandable row: deliverables checklist + (placeholder) payment status + (placeholder) linked Snap report.
- **Status machine:** marking deliverables posted advances status `pending → in_progress → posted`. Define transitions explicitly in one place (`features/deals/status.ts`); never scatter status strings. `paid` is set by chunk 04; `cancelled` is manual.
- Brand detail page now shows this brand's deals + a simple count (full lifetime SAR rollup in 05).

## Out of scope
Payments and the `paid` transition (chunk 04). Snap linkage (chunk 07).

## Acceptance criteria (PRD verification #2, part)
- Create a deal with 2 stories; mark 1 posted → `in_progress`; mark 2nd → `posted`. Transitions are driven by the central status module, not ad-hoc.
- Filters work; RLS second-user check passes.

## Security notes
RLS in-migration. `deliverables` jsonb validated by zod on write (no arbitrary shapes). `brand_id` ownership enforced by RLS, not trusted from client.

## Done
- [ ] Criteria pass · [ ] status transitions centralized · [ ] 375px · [ ] PR into `develop` · [ ] tracker updated.
