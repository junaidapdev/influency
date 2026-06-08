import { useTranslation } from "react-i18next";

/** Placeholder dashboard for chunk 00 — a blank routed shell. Real dashboard ships in chunk 05. */
export function HomePage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold">{t("home.title")}</h1>
      <p className="text-muted-foreground">{t("home.empty")}</p>
    </section>
  );
}
