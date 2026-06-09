export const SNAP_REPORTS_TABLE = "snap_reports";
export const SNAPS_BUCKET = "snaps";
export const EXTRACT_SNAP_FN = "extract-snap-report";

export const EXTRACTION_STATUS = {
  PENDING: "pending",
  EXTRACTED: "extracted",
  FAILED: "failed",
  MANUAL: "manual",
} as const;

export const EXTRACTION_STATUSES = [
  EXTRACTION_STATUS.PENDING,
  EXTRACTION_STATUS.EXTRACTED,
  EXTRACTION_STATUS.FAILED,
  EXTRACTION_STATUS.MANUAL,
] as const;

export type ExtractionStatus = (typeof EXTRACTION_STATUSES)[number];

// Per-user extraction cap; the edge function is the real enforcer (this mirrors it for UI hints).
export const SNAP_RATE_LIMIT_PER_HOUR = 20;

export const SNAP_FILE = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  PDF_MIME: "application/pdf",
} as const;

// Allowed image content types (validated by MIME AND magic bytes, not extension).
export const SNAP_ALLOWED_IMAGE_MIME = ["image/png", "image/jpeg", "image/webp"] as const;
export type SnapImageMime = (typeof SNAP_ALLOWED_IMAGE_MIME)[number];

// The numeric metric fields the model extracts and the user can override.
export const SNAP_METRIC_FIELDS = [
  "views",
  "reach",
  "story_views",
  "screenshot_count",
  "swipe_ups",
] as const;

export type SnapMetricField = (typeof SNAP_METRIC_FIELDS)[number];
