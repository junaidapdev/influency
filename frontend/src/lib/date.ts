import { DATE_CALENDARS, DATE_TIME_ZONE } from "@/constants/date";
import { type Locale } from "@/constants/i18n";

interface DualCalendarDate {
  primary: string;
  secondary: string;
}

function formatCalendarDate(date: Date, locale: Locale, calendar: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    calendar,
    dateStyle: "medium",
    timeZone: DATE_TIME_ZONE,
  }).format(date);
}

export function formatDualCalendarDate(isoDate: string, locale: Locale): DualCalendarDate {
  const date = new Date(isoDate);
  const hijri = formatCalendarDate(date, locale, DATE_CALENDARS.HIJRI_UMM_AL_QURA);
  const gregorian = formatCalendarDate(date, locale, DATE_CALENDARS.GREGORIAN);

  return locale === "ar"
    ? { primary: hijri, secondary: gregorian }
    : { primary: gregorian, secondary: hijri };
}

/** Local time-of-day (e.g. "2:30 PM" / "٢:٣٠ م") for a stored ISO timestamp. */
export function formatTime(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

/**
 * Today's date as a LOCAL-time `YYYY-MM-DD` string. Uses local calendar fields, not
 * `toISOString()` (which is UTC and would record the wrong day near midnight for non-UTC users).
 */
export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
