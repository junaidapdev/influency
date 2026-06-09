import { z } from "zod";
import { EXTRACTION_STATUSES } from "@/constants/snap";

export const snapReportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  deal_id: z.string().uuid().nullable(),
  report_date: z.string().nullable(),
  source_file_url: z.string().nullable(),
  views: z.number().int().nullable(),
  reach: z.number().int().nullable(),
  story_views: z.number().int().nullable(),
  screenshot_count: z.number().int().nullable(),
  swipe_ups: z.number().int().nullable(),
  raw_ai_json: z.unknown(),
  extraction_status: z.enum(EXTRACTION_STATUSES),
  created_at: z.string(),
});

const metricField = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0),
    { message: "invalid" },
  );

// Manual override form — all-string numeric fields; empty → null at the API boundary.
export const snapManualSchema = z.object({
  views: metricField,
  reach: metricField,
  story_views: metricField,
  screenshot_count: metricField,
  swipe_ups: metricField,
});
