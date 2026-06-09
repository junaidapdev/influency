import { useTranslation } from "react-i18next";
import { useReports } from "@/hooks/useReports";
import { BrandMonthTable } from "@/features/reports/components/BrandMonthTable";
import { MonthlyChart } from "@/features/reports/components/MonthlyChart";

export function ReportsPage() {
  const { t } = useTranslation();
  const { monthlyQuery, byBrandQuery } = useReports();
  const monthly = monthlyQuery.data ?? [];
  const byBrand = byBrandQuery.data ?? [];

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("reports.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      <section className="space-y-3 rounded-md border p-4">
        <h2 className="font-semibold">{t("reports.monthlyTitle")}</h2>
        {monthlyQuery.isPending ? (
          <div className="h-72 rounded-md bg-muted" aria-busy="true" />
        ) : monthlyQuery.isError ? (
          <p className="text-sm text-red-600">{t("reports.error")}</p>
        ) : (
          <MonthlyChart rows={monthly} />
        )}
      </section>

      <section className="space-y-3 rounded-md border p-4">
        <h2 className="font-semibold">{t("reports.byBrandTitle")}</h2>
        {byBrandQuery.isPending ? (
          <div className="h-32 rounded-md bg-muted" aria-busy="true" />
        ) : byBrandQuery.isError ? (
          <p className="text-sm text-red-600">{t("reports.error")}</p>
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
