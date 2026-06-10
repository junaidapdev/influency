import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { type Locale } from "@/constants/i18n";
import { MEETING_STATUS } from "@/constants/meetings";
import { formatTime } from "@/lib/date";
import { type Meeting } from "@/features/meetings/meeting.types";

interface MeetingCalendarProps {
  meetings: Meeting[];
  brandNameById: Record<string, string>;
  year: number;
  monthIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (meeting: Meeting) => void;
}

interface AccentClass {
  bar: string;
  text: string;
  dot: string;
}

// Decorative accent palette (reuses the status color tokens) so each meeting gets a stable
// color for its calendar dot, agenda time, and left bar — seeded by brand so one brand's
// meetings share a color. Cancelled meetings render muted instead.
const MEETING_ACCENTS = ["progress", "pending", "posted", "paid", "danger"] as const;
type MeetingAccent = (typeof MEETING_ACCENTS)[number];

const ACCENT_CLASS: Record<MeetingAccent, AccentClass> = {
  progress: { bar: "bg-progress", text: "text-progress", dot: "bg-progress" },
  pending: { bar: "bg-pending", text: "text-pending", dot: "bg-pending" },
  posted: { bar: "bg-posted", text: "text-posted", dot: "bg-posted" },
  paid: { bar: "bg-paid", text: "text-paid", dot: "bg-paid" },
  danger: { bar: "bg-danger", text: "text-danger", dot: "bg-danger" },
};

const MUTED_ACCENT: AccentClass = {
  bar: "bg-muted-foreground/30",
  text: "text-muted-foreground",
  dot: "bg-muted-foreground/40",
};

// 2024-01-07 is a Sunday — used to derive localized short weekday names (Sun..Sat).
const SUNDAY_REFERENCE = [0, 1, 2, 3, 4, 5, 6];

function accentForSeed(seed: string): MeetingAccent {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return MEETING_ACCENTS[hash % MEETING_ACCENTS.length] ?? MEETING_ACCENTS[0];
}

function accentFor(meeting: Meeting): AccentClass {
  if (meeting.status === MEETING_STATUS.CANCELLED) {
    return MUTED_ACCENT;
  }
  return ACCENT_CLASS[accentForSeed(meeting.brand_id ?? meeting.id)];
}

export function MeetingCalendar({
  meetings,
  brandNameById,
  year,
  monthIndex,
  onPrev,
  onNext,
  onSelect,
}: MeetingCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const intlLocale = locale === "ar" ? "ar-SA" : "en-US";

  // The grid is built from Gregorian Date math, so every label here pins the Gregorian
  // calendar (ar-SA would otherwise default to Hijri and mismatch the grid).
  const monthLabel = new Intl.DateTimeFormat(intlLocale, {
    calendar: "gregory",
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));

  const weekdayNames = SUNDAY_REFERENCE.map((offset) =>
    new Intl.DateTimeFormat(intlLocale, { calendar: "gregory", weekday: "short" }).format(
      new Date(2024, 0, 7 + offset),
    ),
  );

  const monthMeetings = useMemo(
    () =>
      meetings
        .filter((meeting) => {
          const date = new Date(meeting.scheduled_at);
          return date.getFullYear() === year && date.getMonth() === monthIndex;
        })
        .sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
        ),
    [meetings, year, monthIndex],
  );

  const meetingsByDay = useMemo(() => {
    const map = new Map<number, Meeting[]>();
    for (const meeting of monthMeetings) {
      const day = new Date(meeting.scheduled_at).getDate();
      const list = map.get(day) ?? [];
      list.push(meeting);
      map.set(day, list);
    }
    return map;
  }, [monthMeetings]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
  const todayDay = isCurrentMonth ? today.getDate() : null;
  const firstMeetingDay =
    monthMeetings.length > 0 ? new Date(monthMeetings[0]!.scheduled_at).getDate() : 1;
  // Default the agenda to today (when viewing the current month) or the month's first meeting.
  // The parent remounts this component per month (keyed on year/month), so this re-inits cleanly.
  const [selectedDay, setSelectedDay] = useState(isCurrentMonth ? today.getDate() : firstMeetingDay);

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_unused, index) => index + 1),
  ];

  // Agenda = meetings from the selected day to the end of the month, grouped by day.
  const agenda = useMemo(() => {
    const groups: { day: number; heading: string; items: Meeting[] }[] = [];
    for (const meeting of monthMeetings) {
      const date = new Date(meeting.scheduled_at);
      const day = date.getDate();
      if (day < selectedDay) {
        continue;
      }
      const last = groups[groups.length - 1];
      if (last && last.day === day) {
        last.items.push(meeting);
      } else {
        groups.push({
          day,
          heading: new Intl.DateTimeFormat(intlLocale, {
            calendar: "gregory",
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(date),
          items: [meeting],
        });
      }
    }
    return groups;
  }, [monthMeetings, selectedDay, intlLocale]);

  function subtitleFor(meeting: Meeting): string {
    const brandName = meeting.brand_id ? brandNameById[meeting.brand_id] : undefined;
    return [meeting.location_or_link, brandName].filter(Boolean).join(" · ");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{monthLabel}</h2>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label={t("meetings.prevMonth")}
              onClick={onPrev}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4 rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              aria-label={t("meetings.nextMonth")}
              onClick={onNext}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            >
              <ChevronRight className="size-4 rtl:-scale-x-100" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
          {weekdayNames.map((name) => (
            <div key={name} className="py-1.5">
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, index) => {
            if (day === null) {
              return <div key={index} className="aspect-square" />;
            }
            const dayMeetings = meetingsByDay.get(day);
            const isSelected = day === selectedDay;
            const isToday = day === todayDay;
            return (
              <button
                key={index}
                type="button"
                aria-label={String(day)}
                aria-pressed={isSelected}
                onClick={() => setSelectedDay(day)}
                className="relative flex aspect-square items-center justify-center"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full text-sm ${
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                        ? "font-semibold text-primary"
                        : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {dayMeetings && !isSelected && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 size-1.5 rounded-full ${accentFor(dayMeetings[0]!).dot}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {agenda.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">
          {t("meetings.agendaEmpty")}
        </p>
      ) : (
        <div className="space-y-4">
          {agenda.map((group) => (
            <div key={group.day} className="space-y-2">
              <h3 className="px-1 text-sm font-medium text-muted-foreground">{group.heading}</h3>
              <ul className="space-y-3">
                {group.items.map((meeting) => {
                  const accent = accentFor(meeting);
                  const isCancelled = meeting.status === MEETING_STATUS.CANCELLED;
                  const subtitle = subtitleFor(meeting);
                  return (
                    <li key={meeting.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(meeting)}
                        className="flex w-full overflow-hidden rounded-2xl bg-card text-start shadow-card transition active:opacity-90"
                      >
                        <span aria-hidden="true" className={`w-1.5 shrink-0 ${accent.bar}`} />
                        <span className="flex flex-1 items-center gap-3 p-4">
                          <span
                            className={`w-20 shrink-0 text-sm font-semibold tabular-nums ${accent.text}`}
                          >
                            {formatTime(meeting.scheduled_at, locale)}
                          </span>
                          <span className="min-w-0 flex-1 border-s ps-3">
                            <span
                              className={`block truncate font-semibold ${isCancelled ? "text-muted-foreground line-through" : ""}`}
                            >
                              {meeting.title}
                            </span>
                            {subtitle && (
                              <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                                <span className="truncate">{subtitle}</span>
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
