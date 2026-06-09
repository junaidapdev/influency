import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
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
 * Snap reports: list + upload→extract pipeline + manual override + deal link.
 *
 * The extract edge function is synchronous (invoke resolves AFTER it writes the result), so the
 * UI updates from the awaited mutation, not a realtime subscription — that avoids a cross-tenant
 * subscription surface we can't RLS-gate (realtime.channels is owned by `postgres`). We invalidate
 * once mid-pipeline (so the pending row appears) and again on settle (so it flips to the result).
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

  const uploadAndExtractMutation = useMutation({
    mutationFn: async ({ file, dealId }: { file: File; dealId: string | null }) => {
      const image = (await isPdf(file)) ? await pdfFirstPageToPng(file) : file;
      const validation = await validateSnapImage(image);
      if (!validation.ok) {
        throw new Error(validation.reason === "size" ? "INVALID_SIZE" : "INVALID_TYPE");
      }
      const { key, url } = await uploadSnapImage(userId ?? "", image);
      const report = await createSnapReport(userId ?? "", { dealId, sourceFileUrl: url });
      void invalidate(); // show the pending row while extraction runs
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
