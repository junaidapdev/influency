import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { MEETING_STATUS } from "@/constants/meetings";
import { formatDualCalendarDate, formatTime } from "@/lib/date";
import { MeetingStatusBadge } from "@/features/meetings/components/MeetingStatusBadge";
import { type Meeting } from "@/features/meetings/meeting.types";

interface MeetingListProps {
  meetings: Meeting[];
  onEdit: (meeting: Meeting) => void;
  onCancel: (meeting: Meeting) => void;
  isMutating: boolean;
}

export function MeetingList({ meetings, onEdit, onCancel, isMutating }: MeetingListProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  return (
    <ul className="space-y-3">
      {meetings.map((meeting) => {
        const isUpcoming = meeting.status === MEETING_STATUS.UPCOMING;
        return (
          <li key={meeting.id} className="flex items-start justify-between gap-3 rounded-md border p-4">
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{meeting.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatDualCalendarDate(meeting.scheduled_at, locale).primary}
                {" · "}
                {formatTime(meeting.scheduled_at, locale)}
              </p>
              {meeting.location_or_link && (
                <p className="text-sm text-muted-foreground break-all">{meeting.location_or_link}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <MeetingStatusBadge status={meeting.status} />
              {isUpcoming && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(meeting)}>
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isMutating}
                    onClick={() => onCancel(meeting)}
                  >
                    {t("meetings.cancelAction")}
                  </Button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
