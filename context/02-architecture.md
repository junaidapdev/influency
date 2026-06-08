# 02 — Architecture

## System design
Single repository (**monorepo**) managed with **pnpm workspaces + Turborepo**:

```
apps/
  web/          # Vite + React 18 + TS app (deploys to Vercel)
packages/
  shared/       # @influency/shared — TS types + zod schemas + API response envelope (consumed by web AND edge functions)
backend/        # InsForge artifacts: edge functions (Deno/TS), SQL migrations, RPC, insforge.toml
context/        # steering files (this folder)
specs/          # per-chunk implementation specs
docs/           # any longer-form docs (NOT scratch *.md in repo root)
# root: package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .gitignore, .env.example
```

> **Shared types across two runtimes.** `packages/shared` is the single source for the API envelope and domain types. The frontend (Node/pnpm) imports it as the workspace package `@influency/shared`; Deno edge functions import the same `.ts` files by relative path (Deno reads TypeScript directly). One definition, two consumers, no drift.

### Deliberate deviation from the review notes
The code review asked for **separate repositories** for backend and frontend (point 5). We are using **separate folders in one repo** instead. This is an intentional, recorded decision, not an oversight:
- On InsForge the "backend" is not a server we run — it's edge functions + SQL migrations + RPC + config. There is very little to put in its own repo.
- A monorepo lets the frontend and edge functions share TypeScript types from one place (the `packages/shared` workspace, `@influency/shared`), which kills a whole class of drift bugs.
- If the backend ever grows into a standalone API service, splitting then is cheap; splitting prematurely is not.

### InsForge model and its constraints (read before backend work)
InsForge is an agent-native BaaS. Confirm every API via the InsForge MCP `fetch-docs` tool before use — it is ~6 months old and your training data may be wrong.
- **Database:** managed Postgres. Tables become auto-generated REST endpoints. Tenant isolation is enforced by **Postgres RLS**, not by us.
- **Auth:** JWT-based, with Google OAuth + email/password. `auth.uid()` is the current user id used in RLS policies.
- **Storage:** S3-compatible buckets with CDN.
- **Edge functions:** run on the **Deno** runtime. *Implication:* no arbitrary native binaries. We do **not** rasterize PDFs server-side; the client converts PDF→PNG (pdf.js) and uploads an image, so the edge function always receives an image.
- **Realtime:** WebSocket pub/sub. Used for the Snap extraction result (subscribe, don't poll).
- **Model gateway:** InsForge can proxy AI models. v1 calls OpenAI Vision directly from the edge function for explicit control of the structured-output schema; the gateway is a documented future option, not v1.

## Data model (Postgres on InsForge)
Every user-owned row carries `user_id` (the InsForge auth user id) and is gated by RLS so user A can never read user B's data.

- **`auth users`** — managed by InsForge auth. We do not own this table.
- **`app_users`** — our profile extension, keyed by the auth user id. Fields: `user_id` (PK/FK to auth user), `display_name`, `locale` (`ar`|`en`), `default_currency` (`SAR`), `avatar_url`, `reminder_lead_minutes` (default 60), `created_at`. Created on first login.
- **`brands`** — `id, user_id, name_en, name_ar, contact_name, contact_email, contact_phone, notes, created_at`. Reused across deals to roll up totals.
- **`ad_deals`** — `id, user_id, brand_id, title, deliverables (jsonb: [{type:'story'|'post'|'reel', count, posted_at?}]), agreed_amount_sar, deadline, status ('pending'|'in_progress'|'posted'|'paid'|'cancelled'), notes, created_at, updated_at`.
- **`payments`** — `id, user_id, deal_id, amount_sar, expected_date, received_date?, status ('pending'|'received'|'overdue'), method ('bank'|'cash'|'other'), notes, created_at`. A deal can have multiple installments (advance + balance).
- **`meetings`** — `id, user_id, brand_id?, deal_id?, title, scheduled_at, location_or_link, attendees (jsonb), notes, status ('upcoming'|'done'|'cancelled'), created_at`.
- **`reminders`** — `id, user_id, kind ('meeting'|'payment'|'deliverable'|'custom'), ref_id, ref_table, due_at, message_en, message_ar, channel ('in_app'|'whatsapp' default 'in_app'), is_done, is_sent_at?, created_at`. Drives the "Today / this week" panel. **Rows are created in application/edge-function code, not Postgres triggers** (testable, no hidden behavior). The `channel` + `is_sent_at` columns exist now so the v2 WhatsApp cron is purely additive — no migration of existing rows.
- **`snap_reports`** — `id, user_id, deal_id?, report_date, source_file_url, views, reach, story_views, screenshot_count, swipe_ups, raw_ai_json (jsonb), extraction_status ('pending'|'extracted'|'failed'|'manual'), created_at`. The edge function writes structured results here.
- **`activity_log`** (optional) — `id, user_id, kind, summary, created_at`. Audit trail / recent-activity feed.

## API model
Two surfaces:
1. **Auto-REST over tables** (InsForge-generated). This is InsForge's contract and shape — we consume it via the SDK + TanStack Query. We do not redefine its envelope.
2. **Our edge functions** (the only "API we own"). Every edge function MUST use the common response envelope and HTTP status conventions in `03-code-standards.md`. Multi-step writes that must be atomic (e.g. *mark-payment-received* → update payment + deal + rollup) run inside an edge function calling a **Postgres function (RPC)** so the steps commit or roll back together — this is how we satisfy "use DB transactions" on a BaaS.

## Auth rules
- InsForge handles signup/login (Google OAuth + email/password with email verification).
- On first login, create the `app_users` row with locale + currency defaults; later logins read it.
- JWT is held in memory and refreshed via the SDK. Protected routes redirect to `/login` when there is no session.

## Storage rules
- Snap uploads go to a per-user storage path. Validate **MIME type + magic bytes** (not just file extension), cap file size, and reject anything that isn't an allowed image type. PDFs are converted to PNG client-side before upload — the bucket only ever stores images.
- Storage URLs used by the edge function are short-lived/signed where InsForge supports it.

## Security boundaries (treat as requirements, not suggestions)
- **Tenant isolation = RLS.** Every app table has policies `user_id = auth.uid()` for select/insert/update/delete. This is the one line of defense that keeps tenants apart. Client-side filtering is convenience only and is never the sole check.
- **Secrets** (OpenAI key, any service keys) live only in edge-function environment config, surfaced through a constants module (see `03-code-standards.md` point on `.env`). They never reach the browser bundle.
- **OpenAI abuse / cost control.** The Snap edge function is a paid call. Enforce a **per-user rate limit** (e.g. N extractions per hour) and the file-size cap above. Without this, one abusive tenant is both a cost attack and a DoS.
- **Prompt injection via uploaded images.** Treat text extracted from a screenshot as untrusted data, never as instructions. The vision call uses a fixed structured-output JSON schema; the model's job is to fill fields, not follow text found in the image.
- **XSS.** All user-entered text (notes, names, attendees) is untrusted. Render as text, never as HTML. No `dangerouslySetInnerHTML`.
- **No IDOR.** Never trust an `id` from the client to imply ownership — RLS plus a `user_id = auth.uid()` filter must gate every read/write.
- **Verification gate (RLS test):** sign in as a second user and confirm they cannot read the first user's rows. This test must pass before any data-bearing chunk is "done."

## Performance rules
Create these indexes — they power the dashboard and reports without table scans:
- `ad_deals (user_id, status, deadline)`
- `payments (user_id, status, expected_date)`
- `meetings (user_id, scheduled_at)`
- `reminders (user_id, due_at, is_done)`

Dashboard rollups should be a small number of aggregate queries (or a Postgres view/RPC), not N+1 fetches in the client.
