# Spec — Chunk 04: Payments + Atomic Mark-Received

**Branch:** `chunk/04-payments` · **Base:** `develop` · **Depends on:** 03

## Objective
Installment payments per deal, and the project's canonical **atomic multi-row write**: marking a payment received updates the payment and the deal status together, or not at all.

## In scope
- `payments` migration + RLS + index `(user_id, status, expected_date)`. Fields per `02-architecture.md` (multiple installments per deal; `status pending|received|overdue`; `method`).
- zod schema; `features/payments/`; `usePayments` hook.
- `/payments`: **Pending** tab (by expected date) + **Received** tab (by received date). Add payment to a deal.
- **`mark-payment-received` edge function** → calls a **Postgres function (RPC)** that, in one transaction: sets the payment `received`/`received_date`, and if all of a deal's payments are received, sets the deal `paid`. Uses the common response envelope + correct status codes. This is the reference implementation for "DB transactions where applicable."
- "Send reminder" button drops an in-app `reminders` row (no external delivery in v1). (The `reminders` table itself is created in chunk 06; if 06 hasn't landed, gate this behind a follow-up note — do not create the table out of scope. Coordinate ordering with the human if needed.)

## Out of scope
WhatsApp delivery. Dashboard rollups (chunk 05) — but the data this chunk writes must make those correct.

## Acceptance criteria (PRD verification #2, part)
- Add a payment, mark received → deal flips to `paid` when fully paid. Partial payments leave the deal non-`paid`.
- The mark-received operation is atomic: a forced failure mid-way leaves neither the payment nor the deal changed.
- RLS second-user check passes.

## Security notes
RLS in-migration. The RPC runs with the caller's identity / checks `user_id = auth.uid()` — a user can only mark *their own* payments. Validate inputs with zod in the edge function before the RPC.

## Done
- [ ] Atomicity verified (failure rolls back) · [ ] envelope + status codes correct · [ ] 375px · [ ] PR into `develop` · [ ] tracker updated.
