import { useTranslation } from "react-i18next";
import { type Locale } from "@/constants/i18n";
import { formatNumber, formatSar } from "@/lib/currency";
import { type DashboardSummary } from "@/features/dashboard/dashboard.types";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const cards = [
    { label: t("dashboard.invoiced"), value: formatSar(summary.invoiced, locale) },
    { label: t("dashboard.collected"), value: formatSar(summary.collected, locale) },
    { label: t("dashboard.outstanding"), value: formatSar(summary.outstanding, locale) },
    { label: t("dashboard.dealsPosted"), value: formatNumber(summary.deals_posted, locale) },
    { label: t("dashboard.dealsPending"), value: formatNumber(summary.deals_pending, locale) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <section key={card.label} className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">{card.value}</p>
        </section>
      ))}
    </div>
  );
}
