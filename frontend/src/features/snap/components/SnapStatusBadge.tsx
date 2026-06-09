import { useTranslation } from "react-i18next";
import { EXTRACTION_STATUS, type ExtractionStatus } from "@/constants/snap";

const STATUS_CLASS: Record<ExtractionStatus, string> = {
  [EXTRACTION_STATUS.PENDING]: "bg-pending-soft text-pending",
  [EXTRACTION_STATUS.EXTRACTED]: "bg-paid-soft text-paid",
  [EXTRACTION_STATUS.FAILED]: "bg-danger-soft text-danger",
  [EXTRACTION_STATUS.MANUAL]: "bg-progress-soft text-progress",
};

export function SnapStatusBadge({ status }: { status: ExtractionStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {t(`snap.status.${status}`)}
    </span>
  );
}
