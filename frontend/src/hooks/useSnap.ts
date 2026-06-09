import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { SNAP_REALTIME } from "@/constants/snap";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/features/auth/auth.context";
import {
  createSnapReport,
  invokeExtract,
  linkSnapDeal,
  listSnapReports,
  updateSnapManual,
  uploadSnapImage,
} from "@/features/snap/snap.api";
import { isPdf, validateSnapImage } from "@/features/snap/file";
import { pdfFirstPageToPng } from "@/features/snap/pdf";
import { type SnapManualValues } from "@/features/snap/snap.types";

/**
 * Snap reports: list + upload→extract pipeline + manual override + deal link, plus a realtime
 * subscription to the user's channel so a row flips from pending → extracted/failed without polling.
 * Validation failures throw INVALID_TYPE / INVALID_SIZE for the page to localize.
 */
export function useSnap() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const snapReportsQuery = useQuery({
    queryKey: queryKeys.snapReports(userId ?? ""),
    queryFn: () => listSnapReports(userId ?? ""),
    enabled: userId !== null,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.snapReports(userId ?? "") });

  // Realtime: subscribe to snap:<userId>; the edge function's UPDATE fires a publish trigger.
  useEffect(() => {
    if (userId === null) {
      return;
    }
    const channel = `${SNAP_REALTIME.CHANNEL_PREFIX}:${userId}`;
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.snapReports(userId) });
    };
    let cancelled = false;

    void (async () => {
      await insforge.realtime.connect();
      if (cancelled) {
        return;
      }
      await insforge.realtime.subscribe(channel);
      insforge.realtime.on(SNAP_REALTIME.EVENT, handler);
    })();

    return () => {
      cancelled = true;
      insforge.realtime.off(SNAP_REALTIME.EVENT, handler);
      void insforge.realtime.unsubscribe(channel);
    };
  }, [userId, queryClient]);

  const uploadAndExtractMutation = useMutation({
    mutationFn: async ({ file, dealId }: { file: File; dealId: string | null }) => {
      const image = (await isPdf(file)) ? await pdfFirstPageToPng(file) : file;
      const validation = await validateSnapImage(image);
      if (!validation.ok) {
        throw new Error(validation.reason === "size" ? "INVALID_SIZE" : "INVALID_TYPE");
      }
      const { key, url } = await uploadSnapImage(userId ?? "", image);
      const report = await createSnapReport(userId ?? "", { dealId, sourceFileUrl: url });
      await invokeExtract(key, report.id);
      return report;
    },
    onSettled: invalidate,
  });

  const manualMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: SnapManualValues }) =>
      updateSnapManual(userId ?? "", id, values),
    onSuccess: invalidate,
  });

  const linkDealMutation = useMutation({
    mutationFn: ({ id, dealId }: { id: string; dealId: string | null }) =>
      linkSnapDeal(userId ?? "", id, dealId),
    onSuccess: invalidate,
  });

  return { snapReportsQuery, uploadAndExtractMutation, manualMutation, linkDealMutation };
}
