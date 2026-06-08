# 07 — Mobile Readiness

Influency is web-first now, but a **React Native (Expo) app for iOS + Android is planned for v2**, sharing the same InsForge backend (see the out-of-scope list in `01-project-overview.md`). This file keeps every feature chunk portable so that port is cheap rather than a rewrite. It is guidance for *how we write web code now*, not a chunk to build.

## Principle: one backend, many clients
InsForge is reached over HTTP/SDK, so a mobile app points at the **same project** (same base URL + anon key) as the web app — same tables, RLS, auth users, edge functions, storage, realtime. **The entire backend is reused as-is**: a user who signs up on web logs into mobile and sees their data. (InsForge also ships Swift + Kotlin SDKs if we ever go fully native; the plan is React Native because it shares the most code with the web app.)

## Reuse vs rebuild
**Reused across web + mobile — write these UI-agnostic:**
- Types + API envelope (`backend/shared`)
- zod schemas, constants, business logic (e.g. the deal status machine), currency/date formatting
- InsForge data access + **TanStack Query hooks** (`useDeals`, `usePayments`, …) — TanStack Query runs in React Native
- i18n catalogs (`ar`/`en` JSON) — 100% reusable

**Rebuilt for mobile — web-only, do not try to share:**
- Visual components — shadcn/ui + Tailwind are web-only (RN uses `View`/`Text`; NativeWind gives Tailwind-like styling)
- Routing — React Router → Expo Router
- The `<html dir lang>` RTL mechanism → RN `I18nManager`
- Vite → Expo/Metro bundler

## Rules for every feature chunk (keep the port cheap)
1. **Logic in hooks, pixels in components.** Data fetching, validation, and domain rules live in `features/<x>/*.api.ts`, `*.schema.ts`, `*.types.ts`, and TanStack Query hooks — none importing react-dom, Tailwind, or shadcn. Components stay "dumb" (props + render).
2. **No browser APIs in logic modules.** Keep `document` / `window` / `localStorage` out of anything but clearly web-only files (e.g. the i18n `<html dir>` helper). The InsForge SDK usage must not assume a browser.
3. **Keep shared things shared.** Types/envelope/constants mobile will need go in `backend/shared` (imported via `@shared`), not buried inside a web component.

## When mobile starts (v2) — additive, not a rewrite
It's a pnpm + Turborepo monorepo, so add a `mobile/` workspace beside `frontend/`; it imports the same shared logic and talks to the same `backend/`. Optionally promote the cross-platform logic out of `backend/shared` into a neutral top-level `shared/` package then (a one-line workspace change).

```
frontend/   # web UI (React + Vite)
mobile/      # React Native + Expo (v2)   ── both import shared logic + the same backend
backend/     # same InsForge project for all clients
  shared/    # types, zod, i18n, data hooks, business logic
```

## Two gotchas for the mobile day
- **OAuth:** mobile uses deep links / custom URL schemes — add mobile redirect URIs to the InsForge auth config (web uses normal web redirects).
- **Session storage:** the JS SDK persists the token in `localStorage` on web; on RN wire it to Expo SecureStore / AsyncStorage. Confirm the exact adapter via the `insforge` skill at that point.
