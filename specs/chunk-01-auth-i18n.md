# Spec — Chunk 01: Auth + Multi-Tenancy + i18n/RTL Shell

**Branch:** `chunk/01-auth-i18n` · **Base:** `develop` · **Depends on:** 00

## Objective
Working auth, the tenancy spine (RLS pattern + `app_users`), and the bilingual RTL shell. After this chunk, two users can sign in and provably cannot see each other's data.

## In scope
- InsForge auth: Google OAuth + email/password (with email verification). Confirm flow via MCP `fetch-docs`.
- `app_users` migration + RLS (`user_id = auth.uid()`); create the row on first login with `locale`, `default_currency='SAR'`, `reminder_lead_minutes=60`.
- Auth state: JWT in memory, SDK refresh; `ProtectedRoute` redirects to `/login` with no session.
- i18n: real `ar` + `en` catalogs for shell strings; language toggle sets `<html dir="rtl|ltr" lang>`; logical spacing utilities adopted.
- `lib/date.ts`: Hijri (Umm al-Qura) + Gregorian formatting helper; `lib/currency.ts`: SAR formatter.
- Empty dashboard shell behind auth (panels stubbed).

## Out of scope
Brands/deals/payments data and pages. Reminders logic.

## Acceptance criteria (PRD verification #1, #6)
- Sign up with email/password; sign in with Google; both land on the dashboard with their own (empty) data.
- **RLS test:** second user cannot read first user's rows.
- Toggle to Arabic → `<html dir="rtl">`, strings switch, numbers/dates render in `ar-SA`, dates show Hijri + Gregorian.

## Security notes
RLS is the isolation backbone — `app_users` ships with policies in the same migration. No client-only gating. Tokens never persisted to localStorage in plain form beyond what the SDK manages.

## Done
- [ ] Criteria pass incl. RLS second-user test · [ ] 375px usable · [ ] PR into `develop` · [ ] tracker updated.
