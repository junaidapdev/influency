import { useTranslation } from "react-i18next";
import { DEAL_STATUS, type DealStatus } from "@/constants/deals";

// Semantic status colors, consistent everywhere (UI context): pending=amber, in-progress=blue,
// posted=violet, paid=green, cancelled=red. One mapping, one meaning.
const STATUS_CLASS: Record<DealStatus, string> = {
  [DEAL_STATUS.PENDING]: "bg-pending-soft text-pending",
  [DEAL_STATUS.IN_PROGRESS]: "bg-progress-soft text-progress",
  [DEAL_STATUS.POSTED]: "bg-posted-soft text-posted",
  [DEAL_STATUS.PAID]: "bg-paid-soft text-paid",
  [DEAL_STATUS.CANCELLED]: "bg-danger-soft text-danger",
};

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {t(`deals.status.${status}`)}
    </span>
  );
}
