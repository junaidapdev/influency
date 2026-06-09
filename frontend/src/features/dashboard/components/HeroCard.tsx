import { useTranslation } from "react-i18next";
import { type Locale } from "@/constants/i18n";
import { formatPercent, formatSar } from "@/lib/currency";
import { formatMonthLabel, todayIsoDate } from "@/lib/date";

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SPARK_WIDTH = 300;
const SPARK_HEIGHT = 40;
const SPARK_PAD = 4;

/** Polyline points for a sparkline, normalized from real values to the viewBox. */
function sparklinePoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = SPARK_WIDTH / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * step;
      const y =
        SPARK_HEIGHT - SPARK_PAD - ((value - min) / range) * (SPARK_HEIGHT - SPARK_PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * The "This Month" gradient hero: invoiced total + a collection-rate ring, with an optional
 * sparkline drawn from a REAL monthly-invoiced trend (omitted when there isn't enough data).
 */
export function HeroCard({
  invoiced,
  collected,
  trend = [],
}: {
  invoiced: number;
  collected: number;
  trend?: number[];
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const ratio = invoiced > 0 ? Math.min(collected / invoiced, 1) : 0;
  const monthLabel = formatMonthLabel(todayIsoDate().slice(0, 7), locale);
  const showTrend = trend.length >= 2 && trend.some((value) => value > 0);

  return (
    <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-5 text-white shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/80">{t("dashboard.thisMonth")}</span>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{monthLabel}</span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative size-[76px] shrink-0">
          <svg viewBox="0 0 80 80" className="size-full -rotate-90">
            <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r={RADIUS}
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold leading-none">{formatPercent(ratio, locale)}</span>
            <span className="text-[9px] text-white/80">{t("dashboard.collectionRate")}</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-white/80">{t("reports.invoiced")}</p>
          <p className="truncate text-3xl font-extrabold tracking-tight">
            {formatSar(invoiced, locale)}
          </p>
        </div>
      </div>

      {showTrend && (
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
          preserveAspectRatio="none"
          className="mt-3 h-8 w-full text-white/50"
        >
          <polyline
            points={sparklinePoints(trend)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
