import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { type Locale } from "@/constants/i18n";
import { REPORT_CHART_COLOR } from "@/constants/reports";
import { formatSar } from "@/lib/currency";
import { formatMonthLabel } from "@/lib/date";
import { type MonthlyReportRow } from "@/features/reports/report.types";

export function MonthlyChart({ rows }: { rows: MonthlyReportRow[] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const isArabic = locale === "ar";

  const data = rows.map((row) => ({
    label: formatMonthLabel(row.month, locale),
    invoiced: row.invoiced,
    collected: row.collected,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          {/* RTL: months read right-to-left and the value axis moves to the right. */}
          <XAxis dataKey="label" reversed={isArabic} tick={{ fontSize: 11 }} />
          <YAxis orientation={isArabic ? "right" : "left"} width={56} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => formatSar(Number(value), locale)} />
          <Legend />
          <Bar dataKey="invoiced" name={t("reports.invoiced")} fill={REPORT_CHART_COLOR.INVOICED} />
          <Bar dataKey="collected" name={t("reports.collected")} fill={REPORT_CHART_COLOR.COLLECTED} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
