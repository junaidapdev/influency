import { z } from "zod";

export const monthlyReportRowSchema = z.object({
  month: z.string(),
  invoiced: z.coerce.number(),
  collected: z.coerce.number(),
});

export const brandReportRowSchema = z.object({
  brand_id: z.string().uuid(),
  name_en: z.string(),
  name_ar: z.string(),
  month: z.string(),
  deal_count: z.coerce.number().int(),
  invoiced: z.coerce.number(),
  collected: z.coerce.number(),
});
