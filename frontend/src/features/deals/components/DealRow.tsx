import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { DEAL_STATUS } from "@/constants/deals";
import { formatSar } from "@/lib/currency";
import { formatDualCalendarDate } from "@/lib/date";
import { DealStatusBadge } from "@/features/deals/components/DealStatusBadge";
import { isDeliverablePosted } from "@/features/deals/status";
import { type Deal } from "@/features/deals/deal.types";

interface DealRowProps {
  deal: Deal;
  brandName: string;
  onToggleDeliverable: (deal: Deal, index: number, posted: boolean) => void;
  onCancel: (deal: Deal) => void;
  isMutating: boolean;
}

export function DealRow({ deal, brandName, onToggleDeliverable, onCancel, isMutating }: DealRowProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const [open, setOpen] = useState(false);
  const deadline = deal.deadline ? formatDualCalendarDate(deal.deadline, locale) : null;
  const isClosed = deal.status === DEAL_STATUS.PAID || deal.status === DEAL_STATUS.CANCELLED;

  return (
    <li className="rounded-md border">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 p-4 text-start"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">{deal.title}</p>
          <p className="text-sm text-muted-foreground">{brandName}</p>
          {deadline && (
            <p className="text-sm text-muted-foreground">
              {t("deals.deadline")}: {deadline.primary}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <DealStatusBadge status={deal.status} />
          <span className="text-sm font-semibold tabular-nums">
            {formatSar(deal.agreed_amount_sar, locale)}
          </span>
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("deals.fields.deliverables")}</h3>
            <ul className="space-y-2">
              {deal.deliverables.map((deliverable, index) => {
                const posted = isDeliverablePosted(deliverable);
                return (
                  <li key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={posted}
                      disabled={isMutating || isClosed}
                      onChange={(event) => onToggleDeliverable(deal, index, event.target.checked)}
                    />
                    <span className="text-sm">
                      {t(`deals.deliverableType.${deliverable.type}`)} ×{deliverable.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {deal.notes && <p className="text-sm text-muted-foreground">{deal.notes}</p>}

          {/* Filled by later chunks. */}
          <p className="text-sm text-muted-foreground">{t("deals.paymentPlaceholder")}</p>
          <p className="text-sm text-muted-foreground">{t("deals.snapPlaceholder")}</p>

          {!isClosed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isMutating}
              onClick={() => onCancel(deal)}
            >
              {t("deals.cancelAction")}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
