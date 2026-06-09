# Active Chunk
Chunk: 08 — Reports
Branch: chunk/08-reports
Base branch: develop
Commit message prefix: Chunk 08:

# Before coding
1. Read AGENTS.md, all of /context (00→06), and /specs/chunk-08-reports.md.
2. Connect the InsForge MCP and call fetch-docs; confirm how to run the aggregate queries / view / RPC for reporting and how RLS applies. Reuse the rollup approach established in chunk 05.
3. Create branch chunk/08-reports off develop. (Requires chunk 05; chunk 07 for any linked Snap context.)

# Scope (implement ONLY this)
A) Monthly total view: a Recharts bar chart of invoiced vs collected per month, for the last 12 months.
B) Per-brand view: a table of brand × month with deal count, total SAR, and collection rate (collected ÷ invoiced).
C) Backing data: aggregate queries or a Postgres view/RPC — same no-N+1 discipline as chunk 05. Lean on existing indexes.
D) Chart config must be RTL-tolerant (axis/legend orientation correct when locale is Arabic). Numbers/currency via the lib helpers.

# Out of scope (do NOT build)
Export to PDF/CSV (not in v1). Snap metrics inside reports beyond the linkage already shown on deals. Settings (chunk 09).

# Standards (binding)
No `any`. Constants for query keys, routes, messages. zod for any edge-function input. No console.log. Currency/number/date formatting via the lib helpers only.

# Security (binding)
Every aggregate scoped by user_id = auth uid (RLS + filter). A view/RPC must not leak cross-tenant rows — verify as a second user.

# Acceptance criteria (PRD verification #5)
- With two brands and three months of seeded deals, the monthly bar chart and the per-brand table BOTH match hand-calculated totals.
- Collection rate is computed correctly, with a guard against divide-by-zero when invoiced is 0 (show 0% or "—", not NaN/Infinity).
- RTL chart renders correctly in Arabic. Second-user test passes. Usable at 375px.

# Finish
Update /context/06-progress-tracker.md (chunk 08 → Completed). Push and open a PR into develop. DO NOT merge. Stop and ask if anything architectural is unclear.