import { DEAL_STATUS, type DealStatus } from "@/constants/deals";
import { type Deliverable } from "@/features/deals/deal.types";

/**
 * THE deal status machine — the single source of truth for status. Never write a status string
 * ad-hoc anywhere else; compute it here and recompute on every deliverable change.
 *
 * Automatic transitions (driven purely by deliverables):
 *   pending      → in_progress   when at least one deliverable is posted
 *   in_progress  → posted        when every deliverable is posted
 * The recompute is symmetric: un-posting a deliverable moves the status back down accordingly.
 *
 * Sticky states (never overridden here): 'paid' is owned by chunk 04; 'cancelled' is a manual
 * user action. If the deal is in either, status is left untouched.
 */

export function isDeliverablePosted(deliverable: Deliverable): boolean {
  return deliverable.posted_at !== null && deliverable.posted_at !== undefined;
}

export function computeDealStatus(current: DealStatus, deliverables: Deliverable[]): DealStatus {
  if (current === DEAL_STATUS.PAID || current === DEAL_STATUS.CANCELLED) {
    return current;
  }

  const total = deliverables.length;
  const postedCount = deliverables.filter(isDeliverablePosted).length;

  if (total > 0 && postedCount === total) {
    return DEAL_STATUS.POSTED;
  }
  if (postedCount >= 1) {
    return DEAL_STATUS.IN_PROGRESS;
  }
  return DEAL_STATUS.PENDING;
}

/** Toggle one deliverable's posted state, returning a new array (callers pass the timestamp). */
export function setDeliverablePosted(
  deliverables: Deliverable[],
  index: number,
  posted: boolean,
  postedAtIso: string,
): Deliverable[] {
  return deliverables.map((deliverable, i) =>
    i === index ? { ...deliverable, posted_at: posted ? postedAtIso : null } : deliverable,
  );
}
