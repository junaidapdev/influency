import { useTranslation } from "react-i18next";
import { type Locale } from "@/constants/i18n";
import { cn } from "@/lib/utils";
import { formatNumber, formatSar } from "@/lib/currency";
import { type DashboardSummary } from "@/features/dashboard/dashboard.types";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const cards = [
    { label: t("dashboard.collected"), value: formatSar(summary.collected, locale), accent: "bg-paid" },
    { label: t("dashboard.outstanding"), value: formatSar(summary.outstanding, locale), accent: "bg-pending" },
    { label: t("dashboard.dealsPosted"), value: formatNumber(summary.deals_posted, locale), accent: "bg-posted" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl bg-card p-3 shadow-card">
          <span className={cn("block h-1 w-6 rounded-full", card.accent)} />
          <p className="mt-2 text-[13px] font-bold tabular-nums">{card.value}</p>
          <p className="text-[11px] text-muted-foreground">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
