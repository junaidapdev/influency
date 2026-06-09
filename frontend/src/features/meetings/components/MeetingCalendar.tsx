import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { type Meeting } from "@/features/meetings/meeting.types";

interface MeetingCalendarProps {
  meetings: Meeting[];
  year: number;
  monthIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (meeting: Meeting) => void;
}

const MAX_PER_CELL = 2;
// 2024-01-07 is a Sunday — used to derive localized short weekday names (Sun..Sat).
const SUNDAY_REFERENCE = [0, 1, 2, 3, 4, 5, 6];

export function MeetingCalendar({
  meetings,
  year,
  monthIndex,
  onPrev,
  onNext,
  onSelect,
}: MeetingCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language as Locale) === "ar" ? "ar-SA" : "en-US";

  // The grid is built from Gregorian Date math, so the header must be Gregorian too. ar-SA
  // defaults to the islamic-umalqura (Hijri) calendar, which would mismatch the grid — pin gregory.
  const monthLabel = new Intl.DateTimeFormat(locale, {
    calendar: "gregory",
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));

  const weekdayNames = SUNDAY_REFERENCE.map((offset) =>
    new Intl.DateTimeFormat(locale, { calendar: "gregory", weekday: "short" }).format(
      new Date(2024, 0, 7 + offset),
    ),
  );

  const meetingsByDay = useMemo(() => {
    const map = new Map<number, Meeting[]>();
    for (const meeting of meetings) {
      const date = new Date(meeting.scheduled_at);
      if (date.getFullYear() === year && date.getMonth() === monthIndex) {
        const day = date.getDate();
        const list = map.get(day) ?? [];
        list.push(meeting);
        map.set(day, list);
      }
    }
    return map;
  }, [meetings, year, monthIndex]);

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_unused, index) => index + 1),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{monthLabel}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" aria-label={t("meetings.prevMonth")} onClick={onPrev}>
            ‹
          </Button>
          <Button variant="outline" size="sm" aria-label={t("meetings.nextMonth")} onClick={onNext}>
            ›
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekdayNames.map((name) => (
          <div key={name} className="py-1">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => (
          <div
            key={index}
            className={`min-h-16 rounded-md border p-1 text-xs ${day === null ? "border-transparent" : ""}`}
          >
            {day !== null && (
              <>
                <div className="text-muted-foreground">{day}</div>
                <div className="mt-1 space-y-1">
                  {(meetingsByDay.get(day) ?? []).slice(0, MAX_PER_CELL).map((meeting) => (
                    <button
                      key={meeting.id}
                      type="button"
                      className="block w-full truncate rounded bg-blue-100 px-1 text-start text-blue-800"
                      onClick={() => onSelect(meeting)}
                    >
                      {meeting.title}
                    </button>
                  ))}
                  {(meetingsByDay.get(day) ?? []).length > MAX_PER_CELL && (
                    <span className="text-muted-foreground">
                      {t("meetings.moreCount", {
                        count: (meetingsByDay.get(day) ?? []).length - MAX_PER_CELL,
                      })}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
