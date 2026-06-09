// Payments domain constants (R15). Statuses/methods live here only.
export const PAYMENTS_TABLE = "payments";

export const MARK_PAYMENT_RECEIVED_FN = "mark-payment-received";

export const PAYMENT_STATUS = {
  PENDING: "pending",
  RECEIVED: "received",
  OVERDUE: "overdue",
} as const;

export const PAYMENT_STATUSES = [
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.RECEIVED,
  PAYMENT_STATUS.OVERDUE,
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHOD = {
  BANK: "bank",
  CASH: "cash",
  OTHER: "other",
} as const;

export const PAYMENT_METHODS = [
  PAYMENT_METHOD.BANK,
  PAYMENT_METHOD.CASH,
  PAYMENT_METHOD.OTHER,
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_FIELD_LIMITS = {
  AMOUNT_MAX: 100_000_000,
  NOTES_MAX: 2000,
} as const;

export const PAYMENT_TAB = {
  PENDING: "pending",
  RECEIVED: "received",
} as const;

export type PaymentTab = (typeof PAYMENT_TAB)[keyof typeof PAYMENT_TAB];
