import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { EMPTY_DEAL_FILTERS } from "@/constants/deals";
import { ACTIVE_DEAL_STATUSES } from "@/constants/dashboard";
import { TODAY_WINDOW_HOURS } from "@/constants/reminders";
import { useAuth } from "@/features/auth/auth.context";
import { todayIsoDate } from "@/lib/date";
import { listDeals } from "@/features/deals/deal.api";
import { getDashboardSummary, listOverduePayments } from "@/features/dashboard/dashboard.api";
import { listTodayMeetings } from "@/features/meetings/meeting.api";
import { listTodayReminders } from "@/features/reminders/reminder.api";
import { type Deal } from "@/features/deals/deal.types";
import { type Meeting } from "@/features/meetings/meeting.types";
import { type Reminder } from "@/features/reminders/reminder.types";

/**
 * Dashboard data: the month rollup via the aggregate RPC, plus the lists "Needs attention" needs,
 * plus the "Today" panel's meetings + reminders due in the next 24h. Past-deadline deals are
 * derived from the (already-fetched, cache-shared) deals list — no extra query, no N+1.
 */
export function useDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const today = todayIsoDate();
  const month = today.slice(0, 7); // YYYY-MM — the summary's "current month" cache dimension.

  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboardSummary(userId ?? "", month),
    queryFn: getDashboardSummary,
    enabled: userId !== null,
  });

  const dealsQuery = useQuery({
    queryKey: queryKeys.deals(userId ?? "", EMPTY_DEAL_FILTERS),
    queryFn: () => listDeals(userId ?? "", EMPTY_DEAL_FILTERS),
    enabled: userId !== null,
  });

  const overduePaymentsQuery = useQuery({
    queryKey: queryKeys.overduePayments(userId ?? "", today),
    queryFn: () => listOverduePayments(userId ?? "", today),
    enabled: userId !== null,
  });

  // The 24h window is computed at FETCH time (not render) so a refetch always uses the current
  // time; the key is bucketed by `today` so it refreshes across days.
  const todayMeetingsQuery = useQuery({
    queryKey: queryKeys.meetingsToday(userId ?? "", today),
    queryFn: () => {
      const now = new Date();
      const windowEnd = new Date(now.getTime() + TODAY_WINDOW_HOURS * 60 * 60 * 1000);
      return listTodayMeetings(userId ?? "", now.toISOString(), windowEnd.toISOString());
    },
    enabled: userId !== null,
  });

  const todayRemindersQuery = useQuery({
    queryKey: queryKeys.remindersToday(userId ?? "", today),
    queryFn: () => {
      const windowEnd = new Date(Date.now() + TODAY_WINDOW_HOURS * 60 * 60 * 1000);
      return listTodayReminders(userId ?? "", windowEnd.toISOString());
    },
    enabled: userId !== null,
  });

  const deals = useMemo(() => dealsQuery.data ?? [], [dealsQuery.data]);

  const pastDeadlineDeals = useMemo<Deal[]>(
    () =>
      deals.filter(
        (deal) =>
          deal.deadline !== null &&
          deal.deadline < today &&
          ACTIVE_DEAL_STATUSES.includes(deal.status),
      ),
    [deals, today],
  );

  const dealTitleById = useMemo(
    () => new Map(deals.map((deal) => [deal.id, deal.title] as [string, string])),
    [deals],
  );

  const todayData = useMemo<{ meetings: Meeting[]; reminders: Reminder[] }>(
    () => ({
      meetings: todayMeetingsQuery.data ?? [],
      reminders: todayRemindersQuery.data ?? [],
    }),
    [todayMeetingsQuery.data, todayRemindersQuery.data],
  );

  return {
    summaryQuery,
    dealsQuery,
    overduePaymentsQuery,
    pastDeadlineDeals,
    dealTitleById,
    today: todayData,
  };
}
