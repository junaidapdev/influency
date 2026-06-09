import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { useReports } from "@/hooks/useReports";
import { BrandMonthTable } from "@/features/reports/components/BrandMonthTable";
import { MonthlyChart } from "@/features/reports/components/MonthlyChart";

export function ReportsPage() {
  const { t } = useTranslation();
  const { monthlyQuery, byBrandQuery } = useReports();
  const monthly = monthlyQuery.data ?? [];
  const byBrand = byBrandQuery.data ?? [];

  return (
    <section className="space-y-4">
      <AppHeader eyebrow={t("reports.subtitle")} title={t("reports.title")} />

      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-semibold">{t("reports.monthlyTitle")}</h2>
        {monthlyQuery.isPending ? (
          <div className="h-72 rounded-md bg-muted" aria-busy="true" />
        ) : monthlyQuery.isError ? (
          <p className="text-sm text-danger">{t("reports.error")}</p>
        ) : (
          <MonthlyChart rows={monthly} />
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-semibold">{t("reports.byBrandTitle")}</h2>
        {byBrandQuery.isPending ? (
          <div className="h-32 rounded-md bg-muted" aria-busy="true" />
        ) : byBrandQuery.isError ? (
          <p className="text-sm text-danger">{t("reports.error")}</p>
        ) : byBrand.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("reports.empty")}
          </p>
        ) : (
          <BrandMonthTable rows={byBrand} />
        )}
      </section>
    </section>
  );
}
