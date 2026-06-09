import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { EXTRACTION_STATUS, SNAP_METRIC_FIELDS } from "@/constants/snap";
import { formatNumber } from "@/lib/currency";
import { formatDualCalendarDate } from "@/lib/date";
import { snapManualSchema } from "@/features/snap/snap.schema";
import { SnapStatusBadge } from "@/features/snap/components/SnapStatusBadge";
import { type SnapManualValues, type SnapReport } from "@/features/snap/snap.types";
import { type Deal } from "@/features/deals/deal.types";

const NUMBER_INPUT_CLASS =
  "h-9 w-28 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function toFormValues(report: SnapReport): SnapManualValues {
  const asText = (value: number | null): string => (value === null ? "" : String(value));
  return {
    views: asText(report.views),
    reach: asText(report.reach),
    story_views: asText(report.story_views),
    screenshot_count: asText(report.screenshot_count),
    swipe_ups: asText(report.swipe_ups),
  };
}

interface SnapReportCardProps {
  report: SnapReport;
  deals: Deal[];
  onSaveManual: (id: string, values: SnapManualValues) => Promise<void>;
  onLinkDeal: (id: string, dealId: string | null) => void;
  isSaving: boolean;
}

export function SnapReportCard({
  report,
  deals,
  onSaveManual,
  onLinkDeal,
  isSaving,
}: SnapReportCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const [editing, setEditing] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SnapManualValues>({
    resolver: zodResolver(snapManualSchema),
    defaultValues: toFormValues(report),
  });

  const isPending = report.extraction_status === EXTRACTION_STATUS.PENDING;
  const isFailed = report.extraction_status === EXTRACTION_STATUS.FAILED;
  const shownDate = report.report_date ?? report.created_at;

  // Seed the form from the LATEST report each time the editor opens — so a realtime/refetch update
  // can't leave stale values that would overwrite newer extracted metrics, and a prior cancel's
  // unsaved input is discarded.
  function openEditor() {
    reset(toFormValues(report));
    setEditing(true);
  }

  async function submit(values: SnapManualValues) {
    await onSaveManual(report.id, values);
    setEditing(false);
  }

  return (
    <li className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <SnapStatusBadge status={report.extraction_status} />
        <span className="text-sm text-muted-foreground">
          {formatDualCalendarDate(shownDate, locale).primary}
        </span>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground" aria-busy="true">
          {t("snap.extracting")}
        </p>
      ) : editing ? (
        <form className="space-y-2" onSubmit={handleSubmit(submit)}>
          {SNAP_METRIC_FIELDS.map((field) => (
            <label key={field} className="flex items-center justify-between gap-3">
              <span className="text-sm">{t(`snap.fields.${field}`)}</span>
              <input
                className={NUMBER_INPUT_CLASS}
                type="number"
                min={0}
                inputMode="numeric"
                {...register(field)}
              />
            </label>
          ))}
          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-red-600">{t("snap.errors.metric")}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" disabled={isSaving}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      ) : (
        <>
          {isFailed && <p className="text-sm text-muted-foreground">{t("snap.failedHint")}</p>}
          <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {SNAP_METRIC_FIELDS.map((field) => {
              const value = report[field];
              return (
                <div key={field}>
                  <dt className="text-muted-foreground">{t(`snap.fields.${field}`)}</dt>
                  <dd className="font-semibold tabular-nums">
                    {value === null ? "—" : formatNumber(value, locale)}
                  </dd>
                </div>
              );
            })}
          </dl>
          <Button type="button" variant="outline" size="sm" onClick={openEditor}>
            {isFailed ? t("snap.enterManually") : t("snap.editValues")}
          </Button>
        </>
      )}

      <label className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("snap.linkDeal")}</span>
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={report.deal_id ?? ""}
          onChange={(event) =>
            onLinkDeal(report.id, event.target.value === "" ? null : event.target.value)
          }
        >
          <option value="">{t("snap.noDeal")}</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.title}
            </option>
          ))}
        </select>
      </label>
    </li>
  );
}
