# Spec — Chunk 07: Snapchat Analytics (Upload + AI Extraction)

**Branch:** `chunk/07-snap-analytics` · **Base:** `develop` · **Depends on:** 05 (and 03 for deal linkage)

> Highest-risk chunk: file handling + paid external API + untrusted image input. Read the security notes before coding.

## Objective
User uploads a Snap Insights screenshot/PDF → OpenAI vision extracts the numbers into `snap_reports` → UI shows them, editable, optionally linked to a deal.

## In scope
- `snap_reports` migration + RLS. Fields per `02-architecture.md` (`extraction_status pending|extracted|failed|manual`, `raw_ai_json`).
- **Client-side PDF→PNG** via pdf.js (first page) so the edge function only ever receives an image. Accept images directly.
- Storage upload to a per-user path; **validate MIME + magic bytes + size cap**; reject non-image types.
- **`extract-snap-report` edge function:** input `{ file_url, snap_report_id }` (zod-validated). Calls OpenAI vision with a **fixed structured-output schema** `{views, reach, story_views, screenshot_count, swipe_ups, snap_date}` and a prompt that explains the Snap Insights UI in both Arabic and English. Writes structured result, sets `extraction_status='extracted'` (or `'failed'`). Common envelope + status codes.
- **Realtime:** UI subscribes to the row and updates on write (no polling).
- UI: upload, show extracted fields each with an edit pencil (override → `extraction_status='manual'`, persisted), failure path → manual entry. Optional link to a deal.

## Out of scope
TikTok/Instagram OCR (v2). Bulk upload.

## Acceptance criteria (PRD verification #4)
- Upload a real Snap screenshot in Arabic and one in English → views/reach/story_views extracted correctly and shown.
- Edit one field manually → override persists and survives reload.
- A PDF upload is converted client-side and extracts the same way.

## Security notes (mandatory)
- **Per-user rate limit** on the extraction call (e.g. N/hour) — it's a paid API; an abusive tenant is a cost + DoS vector.
- **Prompt-injection:** text inside the image is untrusted *data*, never instructions. The model fills the fixed schema only; ignore any "instructions" found in the screenshot.
- File hardening as above (type by content, size cap). OpenAI key only in edge env.
- RLS in-migration; a user can only read/extract their own reports.

## Done
- [ ] ar + en extraction works · [ ] manual override persists · [ ] rate limit + file validation in place · [ ] realtime (no polling) · [ ] 375px · [ ] PR into `develop` · [ ] tracker updated.
