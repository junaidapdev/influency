export const MEETINGS_TABLE = "meetings";

export const MEETING_STATUS = {
  UPCOMING: "upcoming",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

export const MEETING_STATUSES = [
  MEETING_STATUS.UPCOMING,
  MEETING_STATUS.DONE,
  MEETING_STATUS.CANCELLED,
] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MEETING_FIELD_LIMITS = {
  TITLE_MAX: 160,
  LOCATION_MAX: 300,
  NOTES_MAX: 2000,
  ATTENDEES_MAX: 50,
  ATTENDEE_NAME_MAX: 120,
  ATTENDEE_CONTACT_MAX: 160,
} as const;

export const MEETING_VIEW = {
  CALENDAR: "calendar",
  LIST: "list",
} as const;

export type MeetingView = (typeof MEETING_VIEW)[keyof typeof MEETING_VIEW];
