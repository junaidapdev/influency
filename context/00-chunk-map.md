# 00 — Chunk Map

The PRD broken into shippable chunks. Each chunk is one branch, one PR into `develop`, and is independently reviewable. Build them in order — later chunks depend on earlier ones. Full briefs live in `/specs/`.

| # | Chunk | Branch | Depends on | Ships |
|---|---|---|---|---|
| 00 | Repo & tooling foundation | `chunk/00-foundation` | — | Monorepo, Vite+React+TS strict, Tailwind+shadcn, ESLint/Prettier, env→config module, constants/error/http modules, response-envelope helper, `.gitignore`, InsForge SDK client, committed `/context` + `AGENTS.md`. |
| 01 | Auth + multi-tenancy + i18n/RTL shell | `chunk/01-auth-i18n` | 00 | Google + email/password auth, `app_users` row on first login, protected routes, base RLS pattern, language toggle (ar/en + dir), Hijri+Gregorian date helper, empty dashboard shell. |
| 02 | Brands CRUD + RLS | `chunk/02-brands` | 01 | `brands` table + RLS + indexes, brands directory page, add/edit, empty state. |
| 03 | Ad Deals + deliverables + status machine | `chunk/03-deals` | 02 | `ad_deals` table + RLS, deliverables jsonb, status transitions (pending→in_progress→posted), deals list + filters + add/edit modal. |
| 04 | Payments + atomic mark-received | `chunk/04-payments` | 03 | `payments` table + RLS, pending/received tabs, `mark-payment-received` edge function + RPC (atomic: payment + deal status), drop in-app reminder row. |
| 05 | Dashboard rollups | `chunk/05-dashboard` | 04 | Monthly totals (invoiced/collected/outstanding/posted/pending), "Today" panel, "Needs attention" panel, backing aggregate queries/view. |
| 06 | Meetings + Reminders | `chunk/06-meetings-reminders` | 05 | `meetings` + `reminders` tables + RLS, calendar + list, reminder created in app code at meeting time − lead minutes, feeds "Today". |
| 07 | Snap analytics (upload + AI extract) | `chunk/07-snap-analytics` | 05 | Storage upload with file hardening, client-side PDF→PNG (pdf.js), `extract-snap-report` edge function (OpenAI vision, structured output, per-user rate limit, prompt-injection-safe), realtime result, editable fields, link-to-deal. |
| 08 | Reports | `chunk/08-reports` | 05, 07 | Monthly invoiced-vs-collected bar chart (Recharts), per-brand × month table with deal count, total SAR, collection rate. |
| 09 | Settings + polish + deploy | `chunk/09-settings-deploy` | all | Settings (language, reminder lead time, profile, sign-out), 375px responsive pass, `console.log` sweep, deploy to Vercel, final `develop` → `main`. |

## Why this order
- **Foundation before features.** Chunk 00 makes every standard real *before* any feature code, so the rules aren't retrofitted later. Retrofitting standards is where projects rot.
- **Auth + tenancy first (01).** Multi-tenancy is the spine. RLS must exist before any data table, so the very first data chunk can be tested for tenant isolation.
- **Vertical slices, not horizontal layers.** Brands → Deals → Payments each ship a working end-to-end slice (table + RLS + UI), so each PR is demonstrable. The dashboard (05) sits on top once there's data to roll up.
- **Snap (07) and Reports (08) are leaves** — they depend on data existing but nothing depends on them, so they're low-risk to land late.
- **Settings/deploy last (09).** Polish and the one-time `develop` → `main` merge.

## Maps to PRD verification
- Chunk 01 → verification #1 (auth round-trip + RLS).
- Chunks 02–05 → verification #2 (deal lifecycle) and dashboard totals.
- Chunk 06 → verification #3 (meeting → reminder in Today).
- Chunk 07 → verification #4 (Snap extraction ar + en, manual override persists).
- Chunk 08 → verification #5 (reports match hand-calculated totals).
- Chunks 01 & 09 → verification #6 (i18n/RTL) and #7 (375px responsive).
