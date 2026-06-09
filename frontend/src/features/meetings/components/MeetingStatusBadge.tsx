import { useTranslation } from "react-i18next";
import { MEETING_STATUS, type MeetingStatus } from "@/constants/meetings";

const STATUS_CLASS: Record<MeetingStatus, string> = {
  [MEETING_STATUS.UPCOMING]: "bg-blue-100 text-blue-800",
  [MEETING_STATUS.DONE]: "bg-green-100 text-green-800",
  [MEETING_STATUS.CANCELLED]: "bg-red-100 text-red-800",
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
