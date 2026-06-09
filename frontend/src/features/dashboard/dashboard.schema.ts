import { z } from "zod";

// Shape returned by the dashboard_summary RPC (jsonb). Numbers may arrive as numeric strings → coerce.
export const dashboardSummarySchema = z.object({
  invoiced: z.coerce.number(),
  collected: z.coerce.number(),
  outstanding: z.coerce.number(),
  deals_posted: z.coerce.number().int(),
  deals_pending: z.coerce.number().int(),
});
