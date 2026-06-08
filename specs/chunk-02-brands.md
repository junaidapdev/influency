# Spec — Chunk 02: Brands CRUD + RLS

**Branch:** `chunk/02-brands` · **Base:** `develop` · **Depends on:** 01

## Objective
First real data slice end-to-end: a `brands` table with RLS and a working directory UI. Establishes the CRUD pattern (migration + RLS + zod schema + TanStack Query hook + page) every later feature reuses.

## In scope
- `brands` migration: `id, user_id, name_en, name_ar, contact_name, contact_email, contact_phone, notes, created_at` + RLS (`user_id = auth.uid()`).
- zod `brandSchema` (shared); `features/brands/` with types, api, hook (`useBrands`).
- `/brands` page: list/directory, add + edit (modal or route), empty state. Brand detail can show a placeholder for "deals + lifetime total" (filled in chunk 03/05).
- Filter/sort minimal (name); full rollups come later.

## Out of scope
Deals, lifetime totals, last-engagement date (depend on `ad_deals`).

## Acceptance criteria
- Create/edit/list brands; each user sees only their own (RLS second-user check).
- Validation errors are localized; empty state renders with primary action.

## Security notes
RLS policies in the same migration as the table. Contact fields are user-entered → render as text (no HTML). Email/phone validated by zod.

## Done
- [ ] Criteria pass · [ ] 375px usable · [ ] standards (no `any`, constants, zod) · [ ] PR into `develop` · [ ] tracker updated.
