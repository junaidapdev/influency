import { useTranslation } from "react-i18next";
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
  const isEmpty = overduePayments.length === 0 && pastDeadlineDeals.length === 0;

  return (
    <section className="space-y-4 rounded-md border p-4">
      <h2 className="font-semibold">{t("dashboard.needsAttention")}</h2>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">{t("dashboard.allClear")}</p>
      ) : (
        <div className="space-y-4">
          {overduePayments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("dashboard.overduePayments")}</h3>
              <ul className="space-y-2">
                {overduePayments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      {dealTitleById.get(payment.deal_id) ?? ""}
                      {payment.expected_date && (
                        <span className="text-muted-foreground">
                          {" · "}
                          {formatDualCalendarDate(payment.expected_date, locale).primary}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-red-600">
                      {formatSar(payment.amount_sar, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pastDeadlineDeals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("dashboard.pastDeadline")}</h3>
              <ul className="space-y-2">
                {pastDeadlineDeals.map((deal) => (
                  <li key={deal.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">{deal.title}</span>
                    {deal.deadline && (
                      <span className="shrink-0 text-muted-foreground">
                        {formatDualCalendarDate(deal.deadline, locale).primary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
