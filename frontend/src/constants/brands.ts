// Brands domain constants (R15: no inline magic values). This is the reusable CRUD reference
// that chunks 03–08 copy, so keep names/limits centralized here.
export const BRANDS_TABLE = "brands";

export const BRAND_FIELD_LIMITS = {
  NAME_MAX: 120,
  EMAIL_MAX: 254,
  PHONE_MAX: 32,
  NOTES_MAX: 2000,
} as const;

// Lenient international phone: optional leading +, then 7–20 of digits/space/dash/parentheses.
export const BRAND_PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;
