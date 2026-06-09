import { type z } from "zod";
import { type dashboardSummarySchema } from "@/features/dashboard/dashboard.schema";

/** Current-month top-line rollup from the dashboard_summary RPC. */
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

export type TodayAccent = "progress" | "pending" | "posted" | "paid" | "danger";

/** A single "Today" entry (meeting or reminder), shaped for display. */
export interface TodayItem {
  id: string;
  title: string;
  subtitle?: string;
  at: string;
  accent: TodayAccent;
}
