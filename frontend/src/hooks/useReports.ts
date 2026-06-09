import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/features/auth/auth.context";
import { todayIsoDate } from "@/lib/date";
import { getBrandReport, getMonthlyReport } from "@/features/reports/report.api";

/**
 * Reporting data via the aggregate RPCs (no N+1). Keyed by the current month so the rolling
 * 12-month window refreshes across month boundaries.
 */
export function useReports() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const month = todayIsoDate().slice(0, 7);

  const monthlyQuery = useQuery({
    queryKey: queryKeys.reportMonthly(userId ?? "", month),
    queryFn: getMonthlyReport,
    enabled: userId !== null,
  });

  const byBrandQuery = useQuery({
    queryKey: queryKeys.reportByBrand(userId ?? "", month),
    queryFn: getBrandReport,
    enabled: userId !== null,
  });

  return { monthlyQuery, byBrandQuery };
}
