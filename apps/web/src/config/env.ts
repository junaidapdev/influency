import { z } from "zod";

/**
 * R4: the ONE place that reads `import.meta.env`. Everywhere else imports the typed `env`.
 * Validates at module load so a misconfigured runtime fails fast instead of erroring deep
 * in a feature later. (Lint enforces the no-import.meta.env-elsewhere rule; see eslint.config.js.)
 */
const envSchema = z.object({
  VITE_INSFORGE_BASE_URL: z.url(),
  VITE_INSFORGE_ANON_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid frontend environment configuration: ${missing}`);
}

export const env = {
  insforgeBaseUrl: parsed.data.VITE_INSFORGE_BASE_URL,
  insforgeAnonKey: parsed.data.VITE_INSFORGE_ANON_KEY,
} as const;
