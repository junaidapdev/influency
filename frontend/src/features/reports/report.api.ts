import { insforge } from "@/lib/insforge";
import { REPORT_BY_BRAND_FN, REPORT_MONTHLY_FN } from "@/constants/reports";
import {
  brandReportRowSchema,
  monthlyReportRowSchema,
} from "@/features/reports/report.schema";
import { type BrandReportRow, type MonthlyReportRow } from "@/features/reports/report.types";

/** Invoiced vs collected per month (last 12), via the aggregate RPC (one round-trip, RLS-scoped). */
export async function getMonthlyReport(): Promise<MonthlyReportRow[]> {
  const { data, error } = await insforge.database.rpc(REPORT_MONTHLY_FN);

  if (error) {
    throw error;
  }

  return monthlyReportRowSchema.array().parse(data ?? []);
}

/** Per brand × month: deal count, invoiced, collected (rate derived client-side). */
export async function getBrandReport(): Promise<BrandReportRow[]> {
  const { data, error } = await insforge.database.rpc(REPORT_BY_BRAND_FN);

  if (error) {
    throw error;
  }

  return brandReportRowSchema.array().parse(data ?? []);
}
