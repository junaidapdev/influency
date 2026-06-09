import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/auth.context";

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "text-sm font-medium text-foreground"
    : "text-sm text-muted-foreground hover:text-foreground";
}

/** App shell: header with brand + nav + language toggle, and the routed page below. Mobile-first. */
export function RootLayout() {
  const { t } = useTranslation();
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">{t("app.name")}</span>
          {isAuthenticated && (
            <nav className="flex items-center gap-4">
              <NavLink to={ROUTES.dashboard} className={navLinkClass}>
                {t("nav.dashboard")}
              </NavLink>
              <NavLink to={ROUTES.brands} className={navLinkClass}>
                {t("nav.brands")}
              </NavLink>
              <NavLink to={ROUTES.deals} className={navLinkClass}>
                {t("nav.deals")}
              </NavLink>
              <NavLink to={ROUTES.payments} className={navLinkClass}>
                {t("nav.payments")}
              </NavLink>
            </nav>
          )}
        </div>
        <LanguageToggle />
      </header>
      <main className="mx-auto w-full max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
