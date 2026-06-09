# Active Chunk
Chunk: 01 — Auth + Multi-Tenancy + i18n/RTL Shell
Branch: chunk/01-auth-i18n
Base branch: develop
Commit message prefix: Chunk 01:

# Before coding
1. Read AGENTS.md, then all of /context (00→06). Read /specs/chunk-01-auth-i18n.md.
2. Connect the InsForge MCP and call fetch-docs. Do NOT write auth/RLS/migration code from memory — confirm the live InsForge API for: auth (Google OAuth + email/password + email verification), how to declare row-level security policies (SQL migration vs MCP/dashboard), and the exact function/claim that returns the current authenticated user id. Pin the SDK version.
3. Create branch chunk/01-auth-i18n off develop.

# Scope (implement ONLY this)
A) Auth
   - Enable Google OAuth + email/password (with email verification) via InsForge.
   - JWT held in memory, refreshed via the SDK. No plaintext token in localStorage beyond what the SDK manages.
   - A ProtectedRoute wrapper: no session → redirect to /login.
B) Multi-tenancy spine
   - Migration for table app_users:
       user_id           (PK, equals the auth user id)
       display_name      text
       locale            text  check in ('ar','en')  default 'ar'
       default_currency  text  default 'SAR'
       avatar_url        text  null
       reminder_lead_minutes int default 60
       created_at        timestamptz default now()
   - Row-level security in the SAME migration: a row is selectable/insertable/updatable/deletable ONLY by its owner (user_id = current auth user id), for all four operations. Confirm InsForge's exact policy mechanism via fetch-docs before writing it; do not assume raw Postgres CREATE POLICY works verbatim.
   - On first successful login, create the app_users row with locale + currency defaults; later logins read it.
C) i18n / RTL shell
   - react-i18next with real ar + en catalogs for the shell strings (nav, login, dashboard placeholders). No hard-coded strings in components.
   - Language toggle sets <html dir="rtl|ltr" lang="ar|en">. Use logical spacing utilities (ps-/pe-, ms-/me-), not left/right.
   - lib/date.ts: format a stored ISO/Gregorian date to BOTH Hijri (Intl, calendar 'islamic-umalqura') and Gregorian; Hijri leads when locale is ar. lib/currency.ts: SAR via Intl.NumberFormat.
D) Empty dashboard shell behind auth (panels stubbed, no data yet).

# Out of scope (do NOT build)
Brands/deals/payments tables or pages. Reminders logic. Any feature data.

# Standards (binding — see /context/03-code-standards.md)
No `any`. No inline magic values (use constants modules). zod for all input validation. No console.log in committed code. Read env only through config/env.ts. Any edge function you write uses the common response envelope + status codes.

# Security (binding — see /context/02-architecture.md)
RLS is the tenancy backbone and ships in the same migration as app_users — never client-only gating. After building, verify isolation: sign in as a second user and confirm they cannot read the first user's app_users row.

# Acceptance criteria (PRD verification #1 and #6)
- Sign up with email/password; sign in with Google; both land on the dashboard with their own (empty) data.
- Second user cannot read the first user's rows (RLS test passes).
- Toggle to Arabic → <html dir="rtl">, all shell strings switch, numbers render in ar-SA, dates show Hijri + Gregorian.
- Every screen usable at 375px width.

# Finish
Update /context/06-progress-tracker.md (move chunk 01 to Completed; log decisions + any known issues). Push the branch and open a PR into develop. DO NOT merge. If anything architectural is unclear, stop and ask before coding.