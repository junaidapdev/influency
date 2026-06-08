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
  baseUrl: env.insforgeBaseUrl,
  anonKey: env.insforgeAnonKey,
});
