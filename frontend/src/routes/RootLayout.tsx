import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";

/** App shell: header with brand + language toggle, and the routed page below. Mobile-first. */
export function RootLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-lg font-semibold">{t("app.name")}</span>
        <LanguageToggle />
      </header>
      <main className="mx-auto w-full max-w-2xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
