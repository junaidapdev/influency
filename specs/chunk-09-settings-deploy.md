# Spec — Chunk 09: Settings + Polish + Deploy

**Branch:** `chunk/09-settings-deploy` · **Base:** `develop` · **Depends on:** all

## Objective
Settings page, final quality pass, and ship to production. Ends with the one-time `develop` → `main` merge.

## In scope
- `/settings`: language toggle (ar/en + dir), default reminder lead time (`app_users.reminder_lead_minutes`), profile (display name, avatar), sign-out.
- **Polish pass:** every page usable at 375px (PRD verification #7); loading/empty/error states present everywhere; `rtl:` mirroring correct.
- **Standards sweep:** no `console.log` in committed code (R7); no `any` (R12); no inline magic values (R15); confirm one response envelope + consistent status codes across all edge functions.
- Deploy frontend to **Vercel** (env wired, OAuth redirect URIs set for the prod domain); confirm InsForge backend prod config.
- After review: merge `develop` → `main`. `main` is the deployable line.

## Out of scope
Any v2 feature (WhatsApp, React Native, attachments, non-Snap OCR).

## Acceptance criteria
- Settings changes persist (e.g. reminder lead time changes future reminder timing; language persists across sessions).
- Full 375px pass; all states present.
- Clean typecheck/lint, no `console.log`, no `any`.
- Production deploy reachable; auth round-trip works on the deployed URL.

## Security notes
Production secrets only in Vercel/InsForge env. OAuth redirect URIs locked to the prod domain. Final RLS spot-check across tables as a second user.

## Done
- [ ] Settings persist · [ ] 375px full pass · [ ] standards sweep clean · [ ] deployed · [ ] PR into `develop`, reviewed, then `develop` → `main` · [ ] tracker updated to "v1 shipped".
