import { insforge } from "@/lib/insforge";
import { AD_DEALS_TABLE, DEAL_STATUS, type DealFilters, type DealStatus } from "@/constants/deals";
import { dealSchema } from "@/features/deals/deal.schema";
import { computeDealStatus } from "@/features/deals/status";
import { type Deal, type Deliverable, type DealFormValues } from "@/features/deals/deal.types";

// "YYYY-MM" → [first day of month, first day of next month) for a half-open deadline range.
function monthRange(month: string): { start: string; end: string } {
  const parts = month.split("-");
  const year = Number(parts[0]);
  const monthNumber = Number(parts[1]);
  const start = `${month}-01`;
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}

export async function listDeals(userId: string, filters: DealFilters): Promise<Deal[]> {
  let query = insforge.database.from(AD_DEALS_TABLE).select("*").eq("user_id", userId);

  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.month) {
    const { start, end } = monthRange(filters.month);
    query = query.gte("deadline", start).lt("deadline", end);
  }

  const { data, error } = await query.order("deadline", { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  return dealSchema.array().parse(data ?? []);
}

export async function createDeal(userId: string, values: DealFormValues): Promise<Deal> {
  const deliverables: Deliverable[] = values.deliverables.map((deliverable) => ({
    type: deliverable.type,
    count: Number(deliverable.count),
    posted_at: null,
  }));

  const row = {
    user_id: userId,
    brand_id: values.brand_id,
    title: values.title.trim(),
    deliverables,
    agreed_amount_sar: Number(values.agreed_amount_sar),
    deadline: values.deadline.trim() === "" ? null : values.deadline,
    status: computeDealStatus(DEAL_STATUS.PENDING, deliverables),
    notes: values.notes.trim() === "" ? null : values.notes.trim(),
  };

  const { data, error } = await insforge.database
    .from(AD_DEALS_TABLE)
    .insert([row])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dealSchema.parse(data);
}

// Deliverables + status are written together so the persisted status always matches the
// deliverables. RLS gates ownership; the user_id filter is defense in depth (no IDOR).
export async function updateDealDeliverables(
  userId: string,
  id: string,
  deliverables: Deliverable[],
  status: DealStatus,
): Promise<Deal> {
  const { data, error } = await insforge.database
    .from(AD_DEALS_TABLE)
    .update({ deliverables, status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dealSchema.parse(data);
}

/** Manual status change (chunk 03 only uses this for 'cancelled'). */
export async function setDealStatus(
  userId: string,
  id: string,
  status: DealStatus,
): Promise<Deal> {
  const { data, error } = await insforge.database
    .from(AD_DEALS_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dealSchema.parse(data);
}
