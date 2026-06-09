import { z } from "zod";
import { DEAL_FIELD_LIMITS, DEAL_STATUSES, DELIVERABLE_TYPES } from "@/constants/deals";

// Strict deliverable shape — the jsonb column is validated on every read and write, never
// stored as an arbitrary object. posted_at is the single "is this delivered" signal.
export const deliverableSchema = z.object({
  type: z.enum(DELIVERABLE_TYPES),
  count: z.number().int().min(1).max(DEAL_FIELD_LIMITS.DELIVERABLE_COUNT_MAX),
  posted_at: z.string().datetime().nullable().default(null),
});

export const deliverablesSchema = z
  .array(deliverableSchema)
  .min(1)
  .max(DEAL_FIELD_LIMITS.DELIVERABLES_MAX);

const isPositiveAmount = (value: string): boolean => {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) && parsed > 0;
};

const isValidCount = (value: string): boolean => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= DEAL_FIELD_LIMITS.DELIVERABLE_COUNT_MAX;
};

// Form-facing validation (react-hook-form). All fields are strings so inputs stay controlled;
// number/date values are parsed to their stored types at the API boundary (deal.api.ts).
// posted_at is not edited in the create form (deliverables start unposted).
export const dealFormSchema = z.object({
  brand_id: z.string().uuid(),
  title: z.string().trim().min(1).max(DEAL_FIELD_LIMITS.TITLE_MAX),
  deliverables: z
    .array(
      z.object({
        type: z.enum(DELIVERABLE_TYPES),
        count: z.string().trim().refine(isValidCount),
      }),
    )
    .min(1)
    .max(DEAL_FIELD_LIMITS.DELIVERABLES_MAX),
  agreed_amount_sar: z
    .string()
    .trim()
    .refine(isPositiveAmount)
    .refine((value) => Number(value) <= DEAL_FIELD_LIMITS.AMOUNT_MAX),
  deadline: z.string(),
  notes: z.string().trim().max(DEAL_FIELD_LIMITS.NOTES_MAX),
});

// Full persisted row from InsForge auto-REST. numeric comes back as number|string → coerce.
export const dealSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  brand_id: z.string().uuid(),
  title: z.string(),
  deliverables: deliverablesSchema,
  agreed_amount_sar: z.coerce.number(),
  deadline: z.string().nullable(),
  status: z.enum(DEAL_STATUSES),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
