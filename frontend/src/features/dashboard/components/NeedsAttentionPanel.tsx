import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { type Locale } from "@/constants/i18n";
import { formatSar } from "@/lib/currency";
import { formatDualCalendarDate } from "@/lib/date";
import { type Payment } from "@/features/payments/payment.types";
import { type Deal } from "@/features/deals/deal.types";

interface NeedsAttentionPanelProps {
  overduePayments: Payment[];
  pastDeadlineDeals: Deal[];
  dealTitleById: Map<string, string>;
}

export function NeedsAttentionPanel({
  overduePayments,
  pastDeadlineDeals,
  dealTitleById,
}: NeedsAttentionPanelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  if (overduePayments.length === 0 && pastDeadlineDeals.length === 0) {
    return (
      <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">
        {t("dashboard.allClear")}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {overduePayments.map((payment) => (
        <li key={payment.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <TriangleAlert className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {t("dashboard.overdue")} · {dealTitleById.get(payment.deal_id) ?? ""}
            </p>
            {payment.expected_date && (
              <p className="truncate text-xs text-muted-foreground">
                {t("payments.expectedOn")} {formatDualCalendarDate(payment.expected_date, locale).primary}
              </p>
            )}
          </div>
          <span className="shrink-0 text-sm font-bold tabular-nums text-danger">
            {formatSar(payment.amount_sar, locale)}
          </span>
        </li>
      ))}

      {pastDeadlineDeals.map((deal) => (
        <li key={deal.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <TriangleAlert className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{deal.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t("dashboard.pastDeadline")}
              {deal.deadline ? ` · ${formatDualCalendarDate(deal.deadline, locale).primary}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
