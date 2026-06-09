import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, Briefcase, FileText, Image } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const TILES = [
  { to: ROUTES.deals, icon: Briefcase, labelKey: "nav.deals", tint: "bg-progress-soft text-progress" },
  { to: ROUTES.payments, icon: FileText, labelKey: "nav.payments", tint: "bg-pending-soft text-pending" },
  { to: ROUTES.snap, icon: Image, labelKey: "nav.snap", tint: "bg-danger-soft text-danger" },
  { to: ROUTES.reports, icon: BarChart3, labelKey: "nav.insights", tint: "bg-posted-soft text-posted" },
] as const;

export function QuickAccess() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-4 gap-2">
      {TILES.map((tile) => (
        <Link key={tile.to} to={tile.to} className="flex flex-col items-center gap-1.5">
          <span className={`flex size-14 items-center justify-center rounded-2xl ${tile.tint}`}>
            <tile.icon className="size-6" />
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">{t(tile.labelKey)}</span>
        </Link>
      ))}
    </div>
  );
}
