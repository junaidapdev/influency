import { useTranslation } from "react-i18next";
import { MEETING_STATUS, type MeetingStatus } from "@/constants/meetings";

const STATUS_CLASS: Record<MeetingStatus, string> = {
  [MEETING_STATUS.UPCOMING]: "bg-posted-soft text-posted",
  [MEETING_STATUS.DONE]: "bg-paid-soft text-paid",
  [MEETING_STATUS.CANCELLED]: "bg-danger-soft text-danger",
};

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {t(`meetings.status.${status}`)}
    </span>
  );
}
