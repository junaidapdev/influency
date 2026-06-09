# Active Chunk
Chunk: 09 — Settings + Polish + Deploy
Branch: chunk/09-settings-deploy
Base branch: develop
Commit message prefix: Chunk 09:

# Before coding
1. Read AGENTS.md, all of /context (00→06), and /specs/chunk-09-settings-deploy.md.
2. Connect the InsForge MCP and call fetch-docs; confirm production backend config and how secrets/env are set in production. Confirm the Vercel deploy steps for a Vite app.
3. Create branch chunk/09-settings-deploy off develop. (Requires all prior chunks merged.)

# Scope (implement ONLY this)
A) /settings page:
   - Language toggle (ar/en + dir switch), persisted to app_users.locale.
   - Default reminder lead time, persisted to app_users.reminder_lead_minutes (affects FUTURE reminders' timing).
   - Profile: display name, avatar.
   - Sign-out.
B) Polish pass across the whole app:
   - Every page fully usable at 375px width (this is PRD verification #7 and the dry-run for the future React Native port).
   - Every list/section has its loading (skeleton), empty, and error states present.
   - rtl: mirroring correct (directional icons/chevrons) in Arabic.
C) Standards sweep (the code-review gate):
   - No console.log anywhere in committed code.
   - No `any` anywhere.
   - No inline magic values — all constants live in the constants modules.
   - Confirm ONE response envelope + consistent HTTP status codes across ALL edge functions.
D) Deploy:
   - Deploy the frontend to Vercel. Set production env vars there.
   - Set the Google OAuth redirect URIs to the PRODUCTION domain (a mismatch here is the classic "login works locally, breaks in prod" bug).
   - Confirm the InsForge backend production config.

# Out of scope (do NOT build)
Any v2 feature: WhatsApp delivery, React Native app, contract attachments, agency/commission split, non-Snap OCR.

# Standards (binding)
This chunk ENFORCES the standards across the codebase — treat any violation found during the sweep as a fix to make here.

# Security (binding)
Production secrets live only in Vercel / InsForge env, never in the bundle or the repo. OAuth redirect URIs locked to the prod domain. Do a final RLS spot-check across all tables as a second user.

# Acceptance criteria
- Settings changes persist: changing the reminder lead time changes future reminder timing; language persists across sessions.
- Full 375px pass; loading/empty/error states present everywhere.
- Typecheck + lint clean; zero console.log; zero `any`.
- The production deploy is reachable and the auth round-trip (email/password + Google) works on the deployed URL.

# Finish
Update /context/06-progress-tracker.md to "v1 shipped" with the deploy URL. Push and open a PR into develop. DO NOT merge it yourself. NOTE: both the merge into develop AND the final develop → main merge are HUMAN actions — you (the agent) prepare everything and open the PR; the human reviews and merges. Stop and ask if anything is unclear.