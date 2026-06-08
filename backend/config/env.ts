/**
 * Edge-function environment reader (Deno runtime).
 *
 * R4: read each secret ONCE here; never call `Deno.env.get(...)` scattered through functions.
 * Real values are injected by InsForge (set via `npx @insforge/cli secrets`), never committed.
 * Later chunks extend this — e.g. chunk 07 adds OPENAI_API_KEY for Snap extraction.
 */

// The Deno global is provided by the edge runtime; this declaration lets the file type-check
// without pulling Deno's full lib types into the Node toolchain.
declare const Deno: { env: { get(key: string): string | undefined } };

function required(key: string): string {
  const value = Deno.env.get(key);
  if (value === undefined || value === "") {
    throw new Error(`Missing required edge environment variable: ${key}`);
  }
  return value;
}

export const edgeEnv = {
  /** Base URL of the InsForge backend, injected into the edge runtime. */
  insforgeBaseUrl: (): string => required("INSFORGE_BASE_URL"),
};
