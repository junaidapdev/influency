# Spec — Chunk 06: Meetings + Reminders

**Branch:** `chunk/06-meetings-reminders` · **Base:** `develop` · **Depends on:** 05

## Objective
Meetings (calendar + list) and the in-app reminder system that feeds the "Today" panel. Reminders are created in code, not by DB triggers.

## In scope
- `meetings` migration + RLS + index `(user_id, scheduled_at)`. Fields per `02-architecture.md` (optional `brand_id`/`deal_id`, `attendees` jsonb, `status`).
- `reminders` migration + RLS + index `(user_id, due_at, is_done)`. Include `channel` (default `in_app`) and `is_sent_at` now so v2 WhatsApp is additive.
- `/meetings`: month-grid calendar + list view; add meeting (optionally link brand/deal).
- **On meeting create:** create a `reminders` row at `scheduled_at − app_users.reminder_lead_minutes`, in application/edge code (not a trigger). Same pattern reused for payment/deliverable reminders.
- Wire reminders into the dashboard "Today" panel (completes chunk 05's stub).

## Out of scope
WhatsApp delivery (v2 cron is additive — do not build it). External calendar sync.

## Acceptance criteria (PRD verification #3)
- Create a meeting 30 min out → a reminder row appears in "Today".
- Editing/cancelling a meeting updates/clears its reminder consistently.
- RLS second-user check passes.

## Security notes
RLS in-migration for both tables. `attendees` jsonb validated by zod. Reminder messages stored in both `ar`/`en` (no injection of unescaped user text into a future delivery channel).

## Done
- [ ] Reminder appears in Today · [ ] created in code not triggers · [ ] 375px · [ ] PR into `develop` · [ ] tracker updated.
