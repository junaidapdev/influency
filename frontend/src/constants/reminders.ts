export const REMINDERS_TABLE = "reminders";

export const REMINDER_KIND = {
  MEETING: "meeting",
  PAYMENT: "payment",
  DELIVERABLE: "deliverable",
  CUSTOM: "custom",
} as const;

export const REMINDER_KINDS = [
  REMINDER_KIND.MEETING,
  REMINDER_KIND.PAYMENT,
  REMINDER_KIND.DELIVERABLE,
  REMINDER_KIND.CUSTOM,
] as const;

export type ReminderKind = (typeof REMINDER_KINDS)[number];

export const REMINDER_CHANNEL = {
  IN_APP: "in_app",
  WHATSAPP: "whatsapp",
} as const;

export const REMINDER_CHANNELS = [REMINDER_CHANNEL.IN_APP, REMINDER_CHANNEL.WHATSAPP] as const;

export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];

export const REMINDER_REF_TABLE = {
  MEETINGS: "meetings",
  PAYMENTS: "payments",
  AD_DEALS: "ad_deals",
} as const;

export const REMINDER_REF_TABLES = [
  REMINDER_REF_TABLE.MEETINGS,
  REMINDER_REF_TABLE.PAYMENTS,
  REMINDER_REF_TABLE.AD_DEALS,
] as const;

export type ReminderRefTable = (typeof REMINDER_REF_TABLES)[number];

// The dashboard "Today" panel window.
export const TODAY_WINDOW_HOURS = 24;

// Bilingual message prefixes (messages are stored in both ar + en). User text is appended as a
// label and rendered as plain text in-app; escape before any future delivery channel.
export const REMINDER_MESSAGE_PREFIX = {
  meeting: { en: "Meeting reminder", ar: "تذكير باجتماع" },
  payment: { en: "Payment reminder", ar: "تذكير بدفعة" },
} as const;
