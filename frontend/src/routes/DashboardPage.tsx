import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { BrandAvatar } from "@/components/BrandAvatar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { type Locale } from "@/constants/i18n";
import { ROUTES } from "@/constants/routes";
import { formatTime } from "@/lib/date";
import { useAuth } from "@/features/auth/auth.context";
import { useDashboard } from "@/hooks/useDashboard";
import { useReports } from "@/hooks/useReports";
import { HeroCard } from "@/features/dashboard/components/HeroCard";
import { NeedsAttentionPanel } from "@/features/dashboard/components/NeedsAttentionPanel";
import { QuickAccess } from "@/features/dashboard/components/QuickAccess";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { TodayPanel } from "@/features/dashboard/components/TodayPanel";
import { type TodayItem } from "@/features/dashboard/dashboard.types";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { user, appUser } = useAuth();
  const { summaryQuery, overduePaymentsQuery, pastDeadlineDeals, dealTitleById, today } =
    useDashboard();
  const { monthlyQuery } = useReports();

  const name = appUser?.display_name ?? "";
  const summary = summaryQuery.data;
  const trend = (monthlyQuery.data ?? []).map((row) => row.invoiced);

  // Merge meetings + reminders into one timeline, ordered by their actual time (not type).
  const todayItems: TodayItem[] = [
    ...today.meetings.map((meeting) => ({
      item: {
        id: meeting.id,
        title: meeting.title,
        subtitle: meeting.location_or_link ?? undefined,
        at: formatTime(meeting.scheduled_at, locale),
        accent: "progress" as const,
      },
      ts: meeting.scheduled_at,
    })),
    ...today.reminders.map((reminder) => ({
      item: {
        id: reminder.id,
        title: locale === "ar" ? reminder.message_ar : reminder.message_en,
        at: formatTime(reminder.due_at, locale),
        accent: "pending" as const,
      },
      ts: reminder.due_at,
    })),
  ]
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
    .map((entry) => entry.item);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3 pt-1">
        <Link to={ROUTES.settings} className="flex min-w-0 items-center gap-3">
          <BrandAvatar name={name || "?"} seed={user?.id} />
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t("dashboard.greeting")}</p>
            <p className="truncate text-lg font-bold leading-tight">{name || t("app.name")}</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <Link
            to={ROUTES.settings}
            aria-label={t("nav.settings")}
            className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-card"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </header>

      {summaryQuery.isPending ? (
        <div className="h-44 rounded-3xl bg-muted" aria-busy="true" />
      ) : summaryQuery.isError ? (
        <p className="rounded-2xl bg-card p-4 text-sm text-danger shadow-card">
          {t("dashboard.error")}
        </p>
      ) : summary ? (
        <>
          <HeroCard invoiced={summary.invoiced} collected={summary.collected} trend={trend} />
          <SummaryCards summary={summary} />
        </>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold">{t("dashboard.today")}</h2>
          <Link to={ROUTES.meetings} className="text-sm font-semibold text-primary">
            {t("nav.calendar")}
          </Link>
        </div>
        <TodayPanel items={todayItems} />
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-base font-bold">{t("dashboard.needsAttention")}</h2>
        <NeedsAttentionPanel
          overduePayments={overduePaymentsQuery.data ?? []}
          pastDeadlineDeals={pastDeadlineDeals}
          dealTitleById={dealTitleById}
        />
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-base font-bold">{t("dashboard.quickAccess")}</h2>
        <QuickAccess />
      </section>
    </div>
  );
}
