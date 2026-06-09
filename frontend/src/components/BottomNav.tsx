import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, Briefcase, Calendar, House, Plus } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const TABS = [
  { to: ROUTES.dashboard, icon: House, labelKey: "nav.home" },
  { to: ROUTES.deals, icon: Briefcase, labelKey: "nav.deals" },
  { to: ROUTES.meetings, icon: Calendar, labelKey: "nav.calendar" },
  { to: ROUTES.reports, icon: BarChart3, labelKey: "nav.insights" },
] as const;

const CREATE_LINKS = [
  { to: ROUTES.deals, labelKey: "deals.addAction" },
  { to: ROUTES.payments, labelKey: "payments.addAction" },
  { to: ROUTES.meetings, labelKey: "meetings.addAction" },
  { to: ROUTES.snap, labelKey: "snap.uploadAction" },
] as const;

function tabClass({ isActive }: { isActive: boolean }): string {
  return cn(
    "flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium",
    isActive ? "text-primary" : "text-muted-foreground",
  );
}

export function BottomNav() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-3">
      {menuOpen && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 cursor-default"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {menuOpen && (
        <div className="relative mb-3 rounded-2xl bg-card p-2 shadow-card">
          {CREATE_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>
      )}

      <nav className="relative flex items-center rounded-2xl bg-card px-2 py-2 shadow-card">
        {TABS.slice(0, 2).map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={tabClass}>
            <tab.icon className="size-5" />
            <span>{t(tab.labelKey)}</span>
          </NavLink>
        ))}

        <div className="w-16 shrink-0" aria-hidden="true" />

        {TABS.slice(2).map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={tabClass}>
            <tab.icon className="size-5" />
            <span>{t(tab.labelKey)}</span>
          </NavLink>
        ))}

        <div className="absolute inset-x-0 -top-5 flex justify-center">
          <button
            type="button"
            aria-label={t("nav.create")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform active:scale-95"
          >
            <Plus className={cn("size-6 transition-transform", menuOpen && "rotate-45")} />
          </button>
        </div>
      </nav>
    </div>
  );
}
