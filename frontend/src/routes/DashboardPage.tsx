import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { formatTime } from "@/lib/date";
import { useAuth } from "@/features/auth/auth.context";
import { useDashboard } from "@/hooks/useDashboard";
import { NeedsAttentionPanel } from "@/features/dashboard/components/NeedsAttentionPanel";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { TodayPanel } from "@/features/dashboard/components/TodayPanel";
import { type TodayItem } from "@/features/dashboard/dashboard.types";

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { signOut } = useAuth();
  const { summaryQuery, overduePaymentsQuery, pastDeadlineDeals, dealTitleById, today } =
    useDashboard();

  const todayMeetingItems: TodayItem[] = today.meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    at: formatTime(meeting.scheduled_at, locale),
  }));
  const todayReminderItems: TodayItem[] = today.reminders.map((reminder) => ({
    id: reminder.id,
    title: locale === "ar" ? reminder.message_ar : reminder.message_en,
    at: formatTime(reminder.due_at, locale),
  }));

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void signOut()}>
          {t("auth.signOut")}
        </Button>
      </div>

      {summaryQuery.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="h-24 rounded-md bg-muted" />
          ))}
        </div>
      ) : summaryQuery.isError ? (
        <p className="text-sm text-red-600">{t("dashboard.error")}</p>
      ) : summaryQuery.data ? (
        <SummaryCards summary={summaryQuery.data} />
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <NeedsAttentionPanel
          overduePayments={overduePaymentsQuery.data ?? []}
          pastDeadlineDeals={pastDeadlineDeals}
          dealTitleById={dealTitleById}
        />
        <TodayPanel meetings={todayMeetingItems} reminders={todayReminderItems} />
      </div>
    </section>
  );
}
