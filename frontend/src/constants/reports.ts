export const REPORT_MONTHLY_FN = "report_monthly";
export const REPORT_BY_BRAND_FN = "report_by_brand";
export const REPORT_MONTHS_BACK = 12;

// Chart series colors (concrete colors are required by Recharts; named here, not inline).
export const REPORT_CHART_COLOR = {
  INVOICED: "#6366f1",
  COLLECTED: "#16a34a",
} as const;
