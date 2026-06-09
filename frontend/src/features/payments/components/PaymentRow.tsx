import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { PAYMENT_STATUS } from "@/constants/payments";
import { formatSar } from "@/lib/currency";
import { formatDualCalendarDate } from "@/lib/date";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { type Payment } from "@/features/payments/payment.types";

interface PaymentRowProps {
  payment: Payment;
  dealTitle: string;
  onMarkReceived: (paymentId: string) => void;
  onSendReminder: (payment: Payment) => void;
  isBusy: boolean;
}

export function PaymentRow({
  payment,
  dealTitle,
  onMarkReceived,
  onSendReminder,
  isBusy,
}: PaymentRowProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const isReceived = payment.status === PAYMENT_STATUS.RECEIVED;
  const dateValue = isReceived ? payment.received_date : payment.expected_date;
  const dateText = dateValue ? formatDualCalendarDate(dateValue, locale).primary : null;

  return (
    <li className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{dealTitle}</p>
        {dateText && (
          <p className="text-sm text-muted-foreground">
            {isReceived ? t("payments.receivedOn") : t("payments.expectedOn")}: {dateText}
          </p>
        )}
        {payment.method && (
          <p className="text-sm text-muted-foreground">{t(`payments.method.${payment.method}`)}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <PaymentStatusBadge status={payment.status} />
        <span className="text-sm font-semibold tabular-nums">
          {formatSar(payment.amount_sar, locale)}
        </span>
        {!isReceived && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onMarkReceived(payment.id)}
            >
              {t("payments.markReceived")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => onSendReminder(payment)}
            >
              {t("payments.sendReminder")}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
