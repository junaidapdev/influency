import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { EMPTY_DEAL_FILTERS } from "@/constants/deals";
import { useDeals } from "@/hooks/useDeals";
import { useSnap } from "@/hooks/useSnap";
import { SnapReportCard } from "@/features/snap/components/SnapReportCard";
import { SnapUpload } from "@/features/snap/components/SnapUpload";
import { type SnapManualValues } from "@/features/snap/snap.types";

function uploadErrorCode(error: unknown): string | null {
  if (!error) {
    return null;
  }
  if (error instanceof Error && (error.message === "INVALID_TYPE" || error.message === "INVALID_SIZE")) {
    return error.message === "INVALID_TYPE" ? "type" : "size";
  }
  return "upload";
}

export function SnapPage() {
  const { t } = useTranslation();
  const { snapReportsQuery, uploadAndExtractMutation, manualMutation, linkDealMutation } = useSnap();
  const { dealsQuery } = useDeals(EMPTY_DEAL_FILTERS);

  const deals = useMemo(() => dealsQuery.data ?? [], [dealsQuery.data]);
  const reports = snapReportsQuery.data ?? [];

  async function handleSaveManual(id: string, values: SnapManualValues) {
    await manualMutation.mutateAsync({ id, values });
  }

  return (
    <section className="space-y-4">
      <AppHeader eyebrow={t("snap.subtitle")} title={t("snap.title")} />

      <SnapUpload
        deals={deals}
        isUploading={uploadAndExtractMutation.isPending}
        errorCode={uploadErrorCode(uploadAndExtractMutation.error)}
        onUpload={(file, dealId) => uploadAndExtractMutation.mutate({ file, dealId })}
      />

      {snapReportsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-28 rounded-md bg-muted" />
          <div className="h-28 rounded-md bg-muted" />
        </div>
      ) : snapReportsQuery.isError ? (
        <p className="text-sm text-danger">{t("snap.errors.load")}</p>
      ) : reports.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t("snap.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <SnapReportCard
              key={report.id}
              report={report}
              deals={deals}
              onSaveManual={handleSaveManual}
              onLinkDeal={(id, dealId) => linkDealMutation.mutate({ id, dealId })}
              isSaving={manualMutation.isPending}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
