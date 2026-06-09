import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DASHBOARD_EMPTY_VALUES } from "@/constants/dashboard";
import { type Locale } from "@/constants/i18n";
import { useAuth } from "@/features/auth/auth.context";
import { formatSar } from "@/lib/currency";
import { formatDualCalendarDate } from "@/lib/date";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { appUser, signOut } = useAuth();
  const locale = i18n.language as Locale;
  const today = formatDualCalendarDate(new Date().toISOString(), locale);
  const emptyMoney = formatSar(DASHBOARD_EMPTY_VALUES.MONEY, locale);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void signOut()}>
          {t("auth.signOut")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <section className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">{t("dashboard.today")}</p>
          <p className="mt-2 font-semibold">{today.primary}</p>
          <p className="text-sm text-muted-foreground">{today.secondary}</p>
        </section>
        <section className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">{t("dashboard.invoiced")}</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">{emptyMoney}</p>
        </section>
        <section className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">{t("dashboard.openItems")}</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">{DASHBOARD_EMPTY_VALUES.COUNT}</p>
        </section>
      </div>

      <section className="rounded-md border p-4">
        <h2 className="font-semibold">{t("dashboard.emptyTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.emptyBody")}</p>
        {appUser && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("dashboard.profileReady", { minutes: appUser.reminder_lead_minutes })}
          </p>
        )}
      </section>
    </section>
  );
}
