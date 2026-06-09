# Active Chunk
Chunk: 06 — Meetings + Reminders
Branch: chunk/06-meetings-reminders
Base branch: develop
Commit message prefix: Chunk 06:

# Before coding
1. Read AGENTS.md, all of /context (00→06), and /specs/chunk-06-meetings-reminders.md.
2. Connect the InsForge MCP and call fetch-docs; confirm migrations, RLS, jsonb, and the SDK access pattern. Don't code from memory.
3. Create branch chunk/06-meetings-reminders off develop. (Requires chunk 05 merged.)

# Scope (implement ONLY this)
A) Migration for table meetings:
       id              (PK)
       user_id         (FK to auth user; NOT NULL)
       brand_id        (FK to brands; null)
       deal_id         (FK to ad_deals; null)
       title           text NOT NULL
       scheduled_at    timestamptz NOT NULL
       location_or_link text null
       attendees       jsonb null        -- array of { name, contact? }
       notes           text null
       status          text NOT NULL check in ('upcoming','done','cancelled') default 'upcoming'
       created_at      timestamptz default now()
   - RLS in the SAME migration: owner-only, all four operations.
   - Index: meetings (user_id, scheduled_at).
B) Migration for table reminders:
       id          (PK)
       user_id     (FK to auth user; NOT NULL)
       kind        text NOT NULL check in ('meeting','payment','deliverable','custom')
       ref_id      text null            -- id of the meeting/payment/deal this points to
       ref_table   text null            -- 'meetings' | 'payments' | 'ad_deals'
       due_at      timestamptz NOT NULL
       message_en  text NOT NULL
       message_ar  text NOT NULL
       channel     text NOT NULL check in ('in_app','whatsapp') default 'in_app'
       is_done     boolean NOT NULL default false
       is_sent_at  timestamptz null
       created_at  timestamptz default now()
   - RLS in the SAME migration: owner-only, all four operations.
   - Index: reminders (user_id, due_at, is_done).
   - The channel + is_sent_at columns exist NOW so the v2 WhatsApp delivery cron is purely additive — no future migration of existing rows. Do NOT build WhatsApp delivery.
C) Feature folder features/meetings/ following the established CRUD pattern + useMeetings + useReminders hooks.
D) /meetings page: a month-grid calendar view AND a list view. Add a meeting (optionally link a brand or deal).
E) REMINDER CREATION — in application/edge code, NOT a Postgres trigger:
   - When a meeting is created, create a reminders row with due_at = scheduled_at − app_users.reminder_lead_minutes (read the user's lead time). Update/clear that reminder when the meeting is edited or cancelled.
   - Centralize "create a reminder for X" in one helper so payment/deliverable reminders reuse it.
F) Complete the deferred reminder hooks this chunk owns:
   - Wire the dashboard "Today" panel's reminders source (the stub from chunk 05) to real reminders due in the next 24h.
   - Build the "Send reminder" button on a payment row (deferred from chunk 04): it drops an in-app reminders row (kind='payment'). No external delivery.

# Out of scope (do NOT build)
WhatsApp delivery / the v2 cron. External calendar sync (Google Calendar, etc.).

# Standards (binding)
No `any`. Constants for kinds, channels, statuses, query keys, messages. zod for all input incl. attendees jsonb. No console.log. Dates via the lib helper (Hijri+Gregorian).

# Security (binding)
RLS in the same migration for BOTH tables. Validate attendees jsonb with zod. Reminder messages are stored in both ar + en; treat any user-entered text as untrusted (it must be safely escaped before it ever reaches a future delivery channel). Never trust meeting/reminder ids from the client — RLS + user_id filter gates everything.

# Acceptance criteria (PRD verification #3)
- Create a meeting 30 minutes in the future → a reminder row appears in the dashboard "Today" panel.
- Editing the meeting's time moves its reminder; cancelling the meeting clears/marks its reminder.
- The payment "Send reminder" button creates an in-app reminder.
- Reminders are created in code, NOT by a DB trigger (confirm none was added).
- Second-user RLS test passes. /meetings usable at 375px.

# Finish
Update /context/06-progress-tracker.md (chunk 06 → Completed; note the reminder-creation helper location). Push and open a PR into develop. DO NOT merge. Stop and ask if anything architectural is unclear.