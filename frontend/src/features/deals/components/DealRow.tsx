import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BrandAvatar } from "@/components/BrandAvatar";
import { type Locale } from "@/constants/i18n";
import { DEAL_STATUS } from "@/constants/deals";
import { formatNumber, formatSar } from "@/lib/currency";
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
  const isClosed = deal.status === DEAL_STATUS.PAID || deal.status === DEAL_STATUS.CANCELLED;

  const total = deal.deliverables.length;
  const postedCount = deal.deliverables.filter(isDeliverablePosted).length;
  const progress = total > 0 ? Math.round((postedCount / total) * 100) : 0;
  const summary = deal.deliverables
    .map((d) => `${formatNumber(d.count, locale)} ${t(`deals.deliverableType.${d.type}`)}`)
    .join(" · ");

  return (
    <li className="rounded-2xl bg-card shadow-card">
      <button
        type="button"
        className="w-full p-4 text-start"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex items-start gap-3">
          <BrandAvatar name={brandName || deal.title} seed={deal.brand_id} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{deal.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[brandName, summary].filter(Boolean).join(" · ")}
            </p>
          </div>
          <DealStatusBadge status={deal.status} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatNumber(postedCount, locale)}/{formatNumber(total, locale)}
          </span>
          <span className="shrink-0 text-sm font-bold tabular-nums">
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
