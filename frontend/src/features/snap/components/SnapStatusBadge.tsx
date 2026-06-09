import { useTranslation } from "react-i18next";
import { EXTRACTION_STATUS, type ExtractionStatus } from "@/constants/snap";

const STATUS_CLASS: Record<ExtractionStatus, string> = {
  [EXTRACTION_STATUS.PENDING]: "bg-amber-100 text-amber-800",
  [EXTRACTION_STATUS.EXTRACTED]: "bg-green-100 text-green-800",
  [EXTRACTION_STATUS.FAILED]: "bg-red-100 text-red-800",
  [EXTRACTION_STATUS.MANUAL]: "bg-blue-100 text-blue-800",
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
