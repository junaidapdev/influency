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
