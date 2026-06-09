import { type z } from "zod";
import { type dashboardSummarySchema } from "@/features/dashboard/dashboard.schema";

/** Current-month top-line rollup from the dashboard_summary RPC. */
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

/** A single "Today" entry (meeting or reminder). Sources are wired in chunk 06. */
export interface TodayItem {
  id: string;
  title: string;
  at: string;
}
