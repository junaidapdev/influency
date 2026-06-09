# Active Chunk
Chunk: 05 — Dashboard Rollups
Branch: chunk/05-dashboard
Base branch: develop
Commit message prefix: Chunk 05:

# Before coding
1. Read AGENTS.md, all of /context (00→06), and /specs/chunk-05-dashboard.md.
2. Connect the InsForge MCP and call fetch-docs; confirm how to run aggregate queries and/or define a read-only Postgres view or RPC for rollups, and how RLS applies to a view. Don't code from memory.
3. Create branch chunk/05-dashboard off develop. (Requires chunk 04 merged — needs deals + payments data.)

# Scope (implement ONLY this)
A) Current-month top-line numbers:
       - total invoiced  (sum of agreed_amount_sar for the month's deals)
       - total collected (sum of received payments this month)
       - outstanding     (invoiced − collected)
       - deals posted    (count, status 'posted' or 'paid')
       - deals pending   (count, status 'pending' or 'in_progress')
B) "Today" panel: meetings + reminders due in the next 24h.
       - Reminders are fully wired by chunk 06. For now, render the panel and wire the meetings/reminders sources behind a clean interface; if the reminders table doesn't exist yet, the reminders portion may stub empty. Do NOT create the reminders table here.
C) "Needs attention" panel:
       - overdue payments (expected_date passed, status not 'received')
       - deals past their deadline still not 'posted'/'paid'.
D) Backing data: implement the rollups as a SMALL number of aggregate queries, or a Postgres view/RPC — NOT one query per row in the client. (Fetching a list and then firing a query per item is the "N+1 query problem"; it's the thing to avoid here.) Lean on the indexes from chunks 03/04.

# Out of scope (do NOT build)
Charts and per-brand reports (chunk 08). Meeting/reminder CREATION (chunk 06). Settings (chunk 09).

# Standards (binding)
No `any`. Constants for query keys, routes, messages, status sets. zod for any edge-function input. One envelope if you add an edge function. No console.log. Numbers/currency/dates formatted via the lib helpers (Hijri+Gregorian, SAR), never ad-hoc.

# Security (binding)
Every aggregate is scoped by user_id = auth uid (RLS + query filter). A view or RPC must NOT leak cross-tenant rows — verify by signing in as a second user and confirming the dashboard shows only their own totals.

# Acceptance criteria
- With seeded deals + payments, every top-line number matches a hand calculation.
- "Needs attention" correctly lists overdue payments and past-deadline unposted deals.
- Confirm rollups load via aggregates/view — no per-row client fetching (no N+1).
- Second-user test passes. Dashboard usable at 375px.

# Finish
Update /context/06-progress-tracker.md (chunk 05 → Completed). Push and open a PR into develop. DO NOT merge. Stop and ask if anything architectural is unclear.