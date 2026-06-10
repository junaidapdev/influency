import { createClient } from "@insforge/sdk";
import { env } from "@/config/env";

/**
 * The single InsForge SDK client for the app. Reads config from the typed `env` module (R4),
 * never from import.meta.env directly. Version is pinned in package.json.
 *
 * Auth, database, storage, realtime, and edge-function calls all go through this client in later
 * chunks. Created here at module load but not exercised until chunk 01 (auth).
 */
export const insforge = createClient({
  baseUrl: env.insforgeUrl,
  anonKey: env.insforgeAnonKey,
  // PostgREST sends ETags, so the browser revalidates repeat GETs and the server replies
  // 304 Not Modified. SDK 1.3.1 treats any non-2xx (304 included) as an error, which surfaced
  // as "could not load" on the list pages (deals/brands/meetings) after the first fetch. Force
  // no-store so the browser never issues a conditional request and we always get a fresh 200;
  // TanStack Query already provides the app-level caching.
  fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
});
