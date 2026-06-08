# Spec — Chunk 05: Dashboard Rollups

**Branch:** `chunk/05-dashboard` · **Base:** `develop` · **Depends on:** 04

## Objective
Turn the data into the at-a-glance dashboard: money this month, what's due, what needs attention.

## In scope
- Current-month top-line: total invoiced, total collected, outstanding, deals posted, deals pending.
- **"Today" panel:** meetings + reminders due in the next 24h (reminders feed lands fully in chunk 06; render the panel now and wire reminders when 06 is in).
- **"Needs attention" panel:** overdue payments; deals past deadline still un-posted.
- Backing aggregates as a small set of queries or a Postgres view/RPC — **no N+1** fetching in the client. Lean on the indexes from earlier chunks.

## Out of scope
Charts and per-brand reports (chunk 08). Meeting/reminder creation (chunk 06).

## Acceptance criteria
- With seeded deals/payments, every top-line number matches a hand calculation.
- "Needs attention" correctly lists overdue payments and past-deadline unposted deals.
- Rollups load via aggregates, verified (no per-row client fetching).

## Security notes
All aggregates scoped by `user_id = auth.uid()` (RLS + query filter). A view/RPC must not leak cross-tenant rows — test as second user.

## Done
- [ ] Numbers match hand calc · [ ] no N+1 · [ ] 375px · [ ] PR into `develop` · [ ] tracker updated.
