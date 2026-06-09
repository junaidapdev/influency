import { useTranslation } from "react-i18next";
import { type Locale } from "@/constants/i18n";
import { formatNumber, formatPercent, formatSar } from "@/lib/currency";
import { formatMonthLabel } from "@/lib/date";
import { type BrandReportRow } from "@/features/reports/report.types";

export function BrandMonthTable({ rows }: { rows: BrandReportRow[] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2 text-start font-medium">{t("reports.brand")}</th>
            <th className="py-2 text-start font-medium">{t("reports.month")}</th>
            <th className="py-2 text-end font-medium">{t("reports.deals")}</th>
            <th className="py-2 text-end font-medium">{t("reports.invoiced")}</th>
            <th className="py-2 text-end font-medium">{t("reports.collectionRate")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            // Guard divide-by-zero: no invoiced → show "—", never NaN/Infinity.
            const rate = row.invoiced > 0 ? row.collected / row.invoiced : null;
            return (
              <tr key={`${row.brand_id}-${row.month}`} className="border-b">
                <td className="py-2">{locale === "ar" ? row.name_ar : row.name_en}</td>
                <td className="py-2">{formatMonthLabel(row.month, locale)}</td>
                <td className="py-2 text-end tabular-nums">{formatNumber(row.deal_count, locale)}</td>
                <td className="py-2 text-end tabular-nums">{formatSar(row.invoiced, locale)}</td>
                <td className="py-2 text-end tabular-nums">
                  {rate === null ? "—" : formatPercent(rate, locale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
