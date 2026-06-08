# 01 — Project Overview

## What it is
**Influency** is a multi-tenant web app for Saudi influencers to run the operational side of their brand-deal business in one place: ad deals, meetings & reminders, payment collection, Snapchat analytics, and brand + monthly reports. Today this work is scattered across notes, screenshots, WhatsApp, and Snap Insights. Influency consolidates it into five connected views.

## Who it is for
Individual Saudi influencers. **Multi-tenant SaaS** — every influencer signs up and sees only their own data. There is no shared/team data in v1.

## Core flows
1. **Sign up / sign in** (Google OAuth or email + password) → land on the dashboard with your own data only.
2. **Track a deal end-to-end:** create a brand → create a deal with deliverables and an agreed SAR amount → mark deliverables posted (deal status advances automatically) → record payment(s) → mark received (deal becomes `paid`).
3. **Stay on top of time:** add meetings (optionally linked to a brand/deal); reminders surface in a "Today" dashboard panel.
4. **Prove performance:** upload a Snap Insights screenshot/PDF → AI extracts the numbers → optionally link the report to a deal so a brand can see *their* campaign's results.
5. **Report:** monthly invoiced-vs-collected, and per-brand lifetime totals and collection rate.

## MVP scope (v1)
- Auth: Google OAuth + email/password (with email verification).
- Multi-tenancy with row-level security (RLS).
- Localization: Arabic + English, RTL toggle from day one.
- Dashboard, Ad Deals, Brands, Payments, Meetings, Snapchat Analytics, Reports, Settings.
- Snap analytics via OpenAI vision, server-side (key never on the client).
- Reminders: **in-app only** in v1 (a `reminders` table + a "Today" panel).
- Currency: SAR. Dates: stored as ISO/Gregorian, displayed as Hijri (Umm al-Qura) + Gregorian.
- Mobile-first responsive (usable at 375px) — the dry-run for a later React Native port.

## Out of scope (explicit v2+)
- WhatsApp reminder delivery (Twilio/Meta). Table is structured now so v2 is purely additive.
- React Native (iOS + Android) app sharing this backend.
- Contract/file attachments on deals, agency/commission split.
- OCR for non-Snap platforms (TikTok, Instagram Insights).
- Any team/multi-user-per-account features.

## Tech stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript | Fast dev loop; no SSR needed for an authed dashboard; logic ports cleanly to React Native later. |
| Styling | Tailwind CSS + shadcn/ui | RTL-friendly via `dir="rtl"` + Tailwind `rtl:` variants; accessible primitives, no heavy design-system lock-in. |
| Server state | TanStack Query + InsForge JS SDK | Caching, optimistic updates, retries over InsForge's REST-style API. |
| Routing | React Router v6 | Standard SPA routing. |
| Forms + validation | react-hook-form + **zod** (the one validation library, everywhere) | Type-safe forms with i18n error messages. |
| i18n | react-i18next + `dir` attribute toggle | `ar` and `en` locale files; switching locale sets `<html dir lang>`. |
| Charts | Recharts | Brand totals + monthly trends; lightweight, RTL-tolerant. |
| Dates | `Intl.DateTimeFormat` (+ date-fns where helpful) | Hijri via `islamic-umalqura` calendar; Gregorian stored under the hood. |
| Backend | **InsForge** — Postgres, JWT auth (Google + email/password), S3 storage, edge functions (Deno), realtime, model gateway | One platform, one SDK; scales to the mobile app later. |
| AI | OpenAI Vision, called from an InsForge **edge function** | Keeps the key off the client; structured-output JSON parsing of Snap screenshots. |
| Hosting | Frontend on **Vercel**; backend hosted by InsForge | Free tier covers early users; CDN included. |

> Repo layout note: frontend and backend live as **separate folders in one repo** (a monorepo). See `02-architecture.md` for why this deviates deliberately from the original "separate repos" review note.
