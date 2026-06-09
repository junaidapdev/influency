import { useTranslation } from "react-i18next";
import { PAYMENT_STATUS, type PaymentStatus } from "@/constants/payments";

const STATUS_CLASS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: "bg-amber-100 text-amber-800",
  [PAYMENT_STATUS.RECEIVED]: "bg-green-100 text-green-800",
  [PAYMENT_STATUS.OVERDUE]: "bg-red-100 text-red-800",
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
