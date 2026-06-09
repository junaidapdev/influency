import { useTranslation } from "react-i18next";
import { type TodayItem } from "@/features/dashboard/dashboard.types";

// Meetings + reminders sources are wired in chunk 06; this renders the panel + empty state now.
export function TodayPanel({
  meetings,
  reminders,
}: {
  meetings: TodayItem[];
  reminders: TodayItem[];
}) {
  const { t } = useTranslation();
  const items = [...meetings, ...reminders];

  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-semibold">{t("dashboard.today")}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("dashboard.todayEmpty")}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
