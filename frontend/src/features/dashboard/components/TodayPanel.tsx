import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { type TodayAccent, type TodayItem } from "@/features/dashboard/dashboard.types";

const ACCENT: Record<TodayAccent, { bar: string; chip: string }> = {
  progress: { bar: "bg-progress", chip: "bg-progress-soft text-progress" },
  pending: { bar: "bg-pending", chip: "bg-pending-soft text-pending" },
  posted: { bar: "bg-posted", chip: "bg-posted-soft text-posted" },
  paid: { bar: "bg-paid", chip: "bg-paid-soft text-paid" },
  danger: { bar: "bg-danger", chip: "bg-danger-soft text-danger" },
};

export function TodayPanel({ items }: { items: TodayItem[] }) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">
        {t("dashboard.todayEmpty")}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const accent = ACCENT[item.accent];
        return (
          <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <span className={cn("h-10 w-1 shrink-0 rounded-full", accent.bar)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              {item.subtitle && (
                <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
            <span className={cn("shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold", accent.chip)}>
              {item.at}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
