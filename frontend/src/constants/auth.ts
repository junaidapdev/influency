import { DEFAULT_LOCALE } from "@/constants/i18n";

export const AUTH_PROVIDERS = {
  GOOGLE: "google",
} as const;

export const AUTH_FORM_LIMITS = {
  PASSWORD_MIN_LENGTH: 6,
  OTP_LENGTH: 6,
} as const;

export const AUTH_TABLES = {
  APP_USERS: "app_users",
} as const;

export const APP_USER_DEFAULTS = {
  LOCALE: DEFAULT_LOCALE,
  DEFAULT_CURRENCY: "SAR",
  REMINDER_LEAD_MINUTES: 60,
} as const;

export const AUTH_ERRORS = {
  SESSION_UNAVAILABLE: "SESSION_UNAVAILABLE",
  PROFILE_UNAVAILABLE: "PROFILE_UNAVAILABLE",
  EMAIL_VERIFICATION_REQUIRED: "EMAIL_VERIFICATION_REQUIRED",
} as const;
