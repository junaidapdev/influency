import { DEAL_STATUS, type DealStatus } from "@/constants/deals";

export const DASHBOARD_EMPTY_VALUES = {
  MONEY: 0,
  COUNT: 0,
} as const;

export const DASHBOARD_SUMMARY_FN = "dashboard_summary";

// A deal is "past deadline, needs attention" when its deadline has passed and it is still active
// (not posted/paid/cancelled).
export const ACTIVE_DEAL_STATUSES: readonly DealStatus[] = [
  DEAL_STATUS.PENDING,
  DEAL_STATUS.IN_PROGRESS,
];
