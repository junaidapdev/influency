// R9: error codes/messages are constants, not inline strings. User-facing copy runs through i18n;
// these codes are stable identifiers shared across the app and (where relevant) edge functions.
export const ERROR_CODES = {
  UNKNOWN: "UNKNOWN",
  NETWORK: "NETWORK",
  ENV_INVALID: "ENV_INVALID",
  AUTH_FAILED: "AUTH_FAILED",
  PROFILE_FAILED: "PROFILE_FAILED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
