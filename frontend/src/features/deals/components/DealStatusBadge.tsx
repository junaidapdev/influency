import { useTranslation } from "react-i18next";
import { DEAL_STATUS, type DealStatus } from "@/constants/deals";

// Semantic status colors, consistent everywhere (UI context): pending=amber, in-progress=blue,
// posted=violet, paid=green, cancelled=red. One mapping, one meaning.
const STATUS_CLASS: Record<DealStatus, string> = {
  [DEAL_STATUS.PENDING]: "bg-amber-100 text-amber-800",
  [DEAL_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [DEAL_STATUS.POSTED]: "bg-violet-100 text-violet-800",
  [DEAL_STATUS.PAID]: "bg-green-100 text-green-800",
  [DEAL_STATUS.CANCELLED]: "bg-red-100 text-red-800",
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
