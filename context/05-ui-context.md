# 05 — UI Context

## Visual style
Clean, dense-but-calm operational dashboard. Information-first, not decorative. shadcn/ui primitives, Tailwind utilities. The user is checking money, deadlines, and performance quickly — clarity beats flourish.

## Colors
Use Tailwind + shadcn theme tokens (CSS variables), not hard-coded hex in components.
- Neutral base for surfaces and text (shadcn `background`, `foreground`, `muted`, `border`).
- One brand accent for primary actions and active nav.
- Semantic status colors, used consistently and defined as tokens: pending (amber), in-progress (blue), posted (indigo/violet), paid/received (green), overdue/cancelled (red). The same color = the same meaning everywhere (deal status chips, payment rows, dashboard).

## Typography
- A font stack with good Arabic + Latin coverage (e.g. an Arabic-capable family for `ar`, system/Inter-style for `en`). Set per `<html lang>`.
- Clear hierarchy: page title → section → row. Numbers (SAR amounts, metrics) are tabular-aligned so columns scan vertically.

## Layout rules
- **Mobile-first. Every page must be fully usable at 375px.** This is the dry-run for the React Native port — if it doesn't work on a phone, it isn't done.
- **RTL/LTR.** App root sets `<html dir="rtl|ltr" lang="ar|en">` on locale change. Use logical spacing (`ps-`/`pe-`, `ms-`/`me-`) and Tailwind `rtl:` variants only where mirroring matters (directional icons, chevrons). Don't hard-code left/right.
- Sidebar/nav on desktop collapses to a bottom or hamburger nav on mobile.

## Component behavior
- Forms: react-hook-form + zod; inline field errors from the i18n catalog; submit disabled while pending.
- Lists: filterable (brand, status, month) where the spec calls for it; each row's primary action is reachable in one tap.
- Status changes are optimistic where safe (TanStack Query), with rollback on error.

## Loading states
- Use skeletons for list/dashboard loads, not a full-page spinner. Keep layout stable so content doesn't jump.
- Buttons triggering mutations show an inline pending state and are disabled during the request.

## Empty states
- Every list/section has a designed empty state: one line of plain copy + the primary action (e.g. Brands empty → "No brands yet" + "Add your first brand"). Never show a blank panel.

## Error states
- Surface failures as a non-blocking toast/inline message from the error-message constants (i18n), never a raw stack or `[object Object]`.
- Snap extraction failure (`extraction_status = 'failed'`) shows a clear "couldn't read this — enter the numbers manually" path. The user always has the final word on extracted values (an edit pencil on every field); Snap UI variants will sometimes confuse the model.

## Numbers, currency, dates
- Numbers stored as Western digits (so math/charts work); displayed via `Intl.NumberFormat('ar-SA')` when locale is Arabic, `en-US` otherwise.
- Currency: `Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR' })`.
- **Dates: store ISO/Gregorian (UTC); display both calendars.** Use `Intl.DateTimeFormat` with the `islamic-umalqura` calendar for Hijri. When locale is Arabic, show Hijri primary with Gregorian secondary; when English, show Gregorian. Put this in one `lib/date.ts` helper — never format dates ad-hoc in components.
