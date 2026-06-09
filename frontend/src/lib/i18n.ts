import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, isRtl, type Locale } from "@/constants/i18n";
import en from "@/locales/en/common.json";
import ar from "@/locales/ar/common.json";

const NAMESPACE = "common";

void i18n.use(initReactI18next).init({
  resources: {
    en: { [NAMESPACE]: en },
    ar: { [NAMESPACE]: ar },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: "en",
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
});

/** Sync <html lang> and <html dir> with the active locale. Call once at startup, then on change. */
export function applyHtmlLangDir(locale: Locale): void {
  const root = document.documentElement;
  root.lang = locale;
  root.dir = isRtl(locale) ? "rtl" : "ltr";
}

i18n.on("languageChanged", (lng) => {
  applyHtmlLangDir(lng as Locale);
});

export default i18n;
