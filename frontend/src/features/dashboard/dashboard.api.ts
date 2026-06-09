import { insforge } from "@/lib/insforge";
import { DASHBOARD_SUMMARY_FN } from "@/constants/dashboard";
import { PAYMENT_STATUS, PAYMENTS_TABLE } from "@/constants/payments";
import { dashboardSummarySchema } from "@/features/dashboard/dashboard.schema";
import { paymentSchema } from "@/features/payments/payment.schema";
import { type DashboardSummary } from "@/features/dashboard/dashboard.types";
import { type Payment } from "@/features/payments/payment.types";

/** Current-month rollup via the aggregate RPC (one round-trip; RLS-scoped to the caller). */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data, error } = await insforge.database.rpc(DASHBOARD_SUMMARY_FN);

  if (error) {
    throw error;
  }

  return dashboardSummarySchema.parse(data);
}

/**
 * Overdue payments: not received and past their expected date. `expected_date < today` already
 * excludes NULL expected dates (a null comparison is never true), so no extra filter is needed.
 * Uses the (user_id, status, expected_date) index.
 */
export async function listOverduePayments(userId: string, today: string): Promise<Payment[]> {
  const { data, error } = await insforge.database
    .from(PAYMENTS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .neq("status", PAYMENT_STATUS.RECEIVED)
    .lt("expected_date", today)
    .order("expected_date", { ascending: true });

  if (error) {
    throw error;
  }

  return paymentSchema.array().parse(data ?? []);
}
