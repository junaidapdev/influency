# Active Chunk
Chunk: 04 — Payments + Atomic Mark-Received
Branch: chunk/04-payments
Base branch: develop
Commit message prefix: Chunk 04:

# Before coding
1. Read AGENTS.md, all of /context (00→06), and /specs/chunk-04-payments.md.
2. Connect the InsForge MCP and call fetch-docs and confirm, specifically: (a) how to write an edge function and its request/response shape, (b) whether and how to define a Postgres function (RPC) that runs as a single transaction, and (c) how to invoke that RPC from an edge function. Do NOT assume — this chunk's correctness depends on it.
3. Create branch chunk/04-payments off develop. (Requires chunk 03 merged.)

# Scope (implement ONLY this)
A) Migration for table payments:
       id            (PK)
       user_id       (FK to auth user; NOT NULL)
       deal_id       (FK to ad_deals; NOT NULL)
       amount_sar    numeric NOT NULL
       expected_date date null
       received_date date null
       status        text NOT NULL check in ('pending','received','overdue') default 'pending'
       method        text check in ('bank','cash','other') null
       notes         text null
       created_at    timestamptz default now()
   - RLS in the SAME migration: owner-only for all four operations.
   - Index: payments (user_id, status, expected_date).
   - A deal can have MULTIPLE payments (advance + balance) — do not assume one payment per deal.
B) Shared zod schema paymentSchema. Feature folder features/payments/ following the established CRUD pattern + usePayments hook.
C) /payments page: two tabs — Pending (sorted by expected_date) and Received (sorted by received_date). Add a payment to a deal.
D) ATOMIC MARK-RECEIVED — the core of this chunk:
   - Build an edge function mark-payment-received. It validates input with zod, then calls a single Postgres function (RPC) that, IN ONE TRANSACTION:
       1. sets the payment status = 'received' and received_date,
       2. checks whether ALL payments for that deal are now received, and if so sets the deal status = 'paid'.
     Both steps commit together or roll back together. Do NOT do these as two separate SDK calls from the client or the edge function — that is the bug this pattern exists to prevent (a payment marked received while the deal is left un-paid because the second call failed).
   - The edge function returns the common response envelope and correct HTTP status codes (200 ok, 400 validation, 401/403 auth, 404 not found, 500 unexpected).

# Out of scope (do NOT build)
- WhatsApp delivery (v2).
- The "Send reminder" button on a payment row — DEFER to chunk 06, because it needs the reminders table which chunk 06 owns. Do NOT create the reminders table here (no out-of-scope tables).
- Dashboard rollups (chunk 05) — but the data this chunk writes must make those rollups correct.

# Standards (binding)
No `any`. Constants for statuses, methods, HTTP codes, messages. zod everywhere. One response envelope for the edge function. No console.log.

# Security (binding)
RLS in the same migration. The RPC must enforce that the caller can only mark THEIR OWN payments (user_id = auth uid) — never trust a payment id from the client as proof of ownership. Validate all inputs with zod in the edge function before calling the RPC. OpenAI/other secrets are irrelevant here; do not introduce any.

# Acceptance criteria (PRD verification #2, part)
- Add a payment to a deal, mark it received → when ALL the deal's payments are received, the deal flips to 'paid'. A partially-paid deal stays non-'paid'.
- ATOMICITY TEST: force a failure in the middle of the RPC (e.g. a deliberate error after step 1) and confirm NEITHER the payment NOR the deal changed — the whole thing rolled back.
- Second-user RLS test passes. /payments usable at 375px.

# Finish
Update /context/06-progress-tracker.md (chunk 04 → Completed; note that the atomic-write RPC pattern is now established and where it lives, so later atomic writes copy it). Push and open a PR into develop. DO NOT merge. Stop and ask if anything architectural is unclear.