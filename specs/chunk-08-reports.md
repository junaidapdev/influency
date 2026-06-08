# Spec — Chunk 08: Reports

**Branch:** `chunk/08-reports` · **Base:** `develop` · **Depends on:** 05, 07

## Objective
Two reporting views: monthly money trend, and per-brand performance.

## In scope
- **Monthly total:** Recharts bar chart of invoiced vs collected per month, last 12 months.
- **Per brand:** table of brand × month with deal count, total SAR, collection rate (collected ÷ invoiced).
- Backing aggregates as queries/view/RPC (reuse chunk-05 patterns); RTL-tolerant chart config.

## Out of scope
Export to PDF/CSV (not in v1). Snap metrics in reports beyond linkage already shown on deals.

## Acceptance criteria (PRD verification #5)
- With two brands and three months of seeded deals, the monthly bar chart and the per-brand table match hand-calculated totals.
- Collection rate computed correctly (incl. zero-invoiced guard — no divide-by-zero).

## Security notes
Aggregates scoped by `user_id = auth.uid()`; second-user test confirms no cross-tenant leakage.

## Done
- [ ] Totals match hand calc · [ ] no divide-by-zero · [ ] RTL chart ok · [ ] 375px · [ ] PR into `develop` · [ ] tracker updated.
