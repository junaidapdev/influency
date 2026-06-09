import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";
import { useDashboard } from "@/hooks/useDashboard";
import { NeedsAttentionPanel } from "@/features/dashboard/components/NeedsAttentionPanel";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { TodayPanel } from "@/features/dashboard/components/TodayPanel";

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];

export function DashboardPage() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { summaryQuery, overduePaymentsQuery, pastDeadlineDeals, dealTitleById, today } =
    useDashboard();

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
        <TodayPanel meetings={today.meetings} reminders={today.reminders} />
      </div>
    </section>
  );
}
