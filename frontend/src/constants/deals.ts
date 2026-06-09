// Deals domain constants (R15: no inline magic values). Statuses live ONLY here and in the
// status machine (features/deals/status.ts) — never hard-coded at a call site.
export const AD_DEALS_TABLE = "ad_deals";

export const DEAL_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  POSTED: "posted",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;

export const DEAL_STATUSES = [
  DEAL_STATUS.PENDING,
  DEAL_STATUS.IN_PROGRESS,
  DEAL_STATUS.POSTED,
  DEAL_STATUS.PAID,
  DEAL_STATUS.CANCELLED,
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

export const DELIVERABLE_TYPE = {
  STORY: "story",
  POST: "post",
  REEL: "reel",
} as const;

export const DELIVERABLE_TYPES = [
  DELIVERABLE_TYPE.STORY,
  DELIVERABLE_TYPE.POST,
  DELIVERABLE_TYPE.REEL,
] as const;

export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

export const DEAL_FIELD_LIMITS = {
  TITLE_MAX: 160,
  NOTES_MAX: 2000,
  AMOUNT_MAX: 100_000_000,
  DELIVERABLE_COUNT_MAX: 999,
  DELIVERABLES_MAX: 50,
} as const;

// Filters for the /deals list. null = "any". `month` is "YYYY-MM" matched against `deadline`.
export interface DealFilters {
  brandId: string | null;
  status: DealStatus | null;
  month: string | null;
}

export const EMPTY_DEAL_FILTERS: DealFilters = {
  brandId: null,
  status: null,
  month: null,
};
