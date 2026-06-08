import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";

/** Flips the active locale (ar <-> en). The languageChanged handler in lib/i18n updates
    <html dir lang>, so RTL/LTR switches automatically. */
export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.language as Locale;
  const next: Locale = current === "ar" ? "en" : "ar";

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={t("language.label")}
      onClick={() => void i18n.changeLanguage(next)}
    >
      {t("language.switchTo")}
    </Button>
  );
}
