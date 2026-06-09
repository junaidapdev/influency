import { z } from "zod";
import { PAYMENT_FIELD_LIMITS, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/constants/payments";

const isPositiveAmount = (value: string): boolean => {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) && parsed > 0;
};

const isMethodOrEmpty = (value: string): boolean =>
  value === "" || (PAYMENT_METHODS as readonly string[]).includes(value);

// Form-facing validation (react-hook-form). All-string fields; method "" → null and
// number/date parsed at the API boundary.
export const paymentFormSchema = z.object({
  deal_id: z.string().uuid(),
  amount_sar: z
    .string()
    .trim()
    .refine(isPositiveAmount)
    .refine((value) => Number(value) <= PAYMENT_FIELD_LIMITS.AMOUNT_MAX),
  expected_date: z.string(),
  method: z.string().refine(isMethodOrEmpty),
  notes: z.string().trim().max(PAYMENT_FIELD_LIMITS.NOTES_MAX),
});

// Full persisted row from InsForge auto-REST.
export const paymentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  deal_id: z.string().uuid(),
  amount_sar: z.coerce.number(),
  expected_date: z.string().nullable(),
  received_date: z.string().nullable(),
  status: z.enum(PAYMENT_STATUSES),
  method: z.enum(PAYMENT_METHODS).nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
});
