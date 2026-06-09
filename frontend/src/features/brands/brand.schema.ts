import { z } from "zod";
import { BRAND_FIELD_LIMITS, BRAND_PHONE_REGEX } from "@/constants/brands";

const isEmail = (value: string): boolean => z.string().email().safeParse(value).success;

/**
 * Form-facing validation (react-hook-form resolver). All fields are strings so the inputs stay
 * controlled; optional fields may be empty, and email/phone are validated only when present.
 * Empty optionals are mapped to NULL at the API boundary (brand.api.ts), never stored as "".
 */
export const brandFormSchema = z.object({
  name_en: z.string().trim().min(1).max(BRAND_FIELD_LIMITS.NAME_MAX),
  name_ar: z.string().trim().min(1).max(BRAND_FIELD_LIMITS.NAME_MAX),
  contact_name: z.string().trim().max(BRAND_FIELD_LIMITS.NAME_MAX),
  contact_email: z
    .string()
    .trim()
    .max(BRAND_FIELD_LIMITS.EMAIL_MAX)
    .refine((value) => value === "" || isEmail(value)),
  contact_phone: z
    .string()
    .trim()
    .max(BRAND_FIELD_LIMITS.PHONE_MAX)
    .refine((value) => value === "" || BRAND_PHONE_REGEX.test(value)),
  notes: z.string().trim().max(BRAND_FIELD_LIMITS.NOTES_MAX),
});

/** Full persisted row as returned by InsForge auto-REST. Used to parse every response. */
export const brandSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name_en: z.string(),
  name_ar: z.string(),
  contact_name: z.string().nullable(),
  contact_email: z.string().nullable(),
  contact_phone: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
});
