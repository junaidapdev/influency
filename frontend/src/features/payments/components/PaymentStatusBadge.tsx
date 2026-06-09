import { useTranslation } from "react-i18next";
import { PAYMENT_STATUS, type PaymentStatus } from "@/constants/payments";

const STATUS_CLASS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: "bg-pending-soft text-pending",
  [PAYMENT_STATUS.RECEIVED]: "bg-paid-soft text-paid",
  [PAYMENT_STATUS.OVERDUE]: "bg-danger-soft text-danger",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {t(`payments.status.${status}`)}
    </span>
  );
}
