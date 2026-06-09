import { insforge } from "@/lib/insforge";
import { ERROR_CODES } from "@/constants/errors";
import {
  EXTRACT_SNAP_FN,
  EXTRACTION_STATUS,
  SNAP_REPORTS_TABLE,
  SNAPS_BUCKET,
} from "@/constants/snap";
import { snapReportSchema } from "@/features/snap/snap.schema";
import { type SnapManualValues, type SnapReport } from "@/features/snap/snap.types";

export async function listSnapReports(userId: string): Promise<SnapReport[]> {
  const { data, error } = await insforge.database
    .from(SNAP_REPORTS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return snapReportSchema.array().parse(data ?? []);
}

/** Upload the (already validated) image to the PRIVATE bucket under a per-user, unguessable key. */
export async function uploadSnapImage(
  userId: string,
  file: Blob,
): Promise<{ key: string; url: string }> {
  const key = `${userId}/${crypto.randomUUID()}`;
  const { data, error } = await insforge.storage.from(SNAPS_BUCKET).upload(key, file);

  if (error || !data) {
    throw error ?? new Error(ERROR_CODES.UNKNOWN);
  }

  return { key: data.key, url: data.url };
}

export async function createSnapReport(
  userId: string,
  input: { dealId: string | null; sourceFileUrl: string },
): Promise<SnapReport> {
  const { data, error } = await insforge.database
    .from(SNAP_REPORTS_TABLE)
    .insert([
      {
        user_id: userId,
        deal_id: input.dealId,
        source_file_url: input.sourceFileUrl,
        extraction_status: EXTRACTION_STATUS.PENDING,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return snapReportSchema.parse(data);
}

/**
 * Kick off extraction. The edge function downloads the image (as the user), runs OpenAI vision,
 * and writes the result back to the row (extracted/failed), enforcing the per-user rate limit.
 */
export async function invokeExtract(fileKey: string, snapReportId: string): Promise<void> {
  const { error } = await insforge.functions.invoke(EXTRACT_SNAP_FN, {
    body: { file_key: fileKey, snap_report_id: snapReportId },
  });

  if (error) {
    throw error instanceof Error ? error : new Error(ERROR_CODES.UNKNOWN);
  }
}

function toIntOrNull(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

/** Manual override — the user has the final word; persists with extraction_status='manual'. */
export async function updateSnapManual(
  userId: string,
  id: string,
  values: SnapManualValues,
): Promise<SnapReport> {
  const { data, error } = await insforge.database
    .from(SNAP_REPORTS_TABLE)
    .update({
      views: toIntOrNull(values.views),
      reach: toIntOrNull(values.reach),
      story_views: toIntOrNull(values.story_views),
      screenshot_count: toIntOrNull(values.screenshot_count),
      swipe_ups: toIntOrNull(values.swipe_ups),
      extraction_status: EXTRACTION_STATUS.MANUAL,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return snapReportSchema.parse(data);
}

export async function linkSnapDeal(
  userId: string,
  id: string,
  dealId: string | null,
): Promise<SnapReport> {
  const { data, error } = await insforge.database
    .from(SNAP_REPORTS_TABLE)
    .update({ deal_id: dealId })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return snapReportSchema.parse(data);
}
