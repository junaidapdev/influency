import { APP_USER_DEFAULTS } from "@/constants/auth";
import { type Locale } from "@/constants/i18n";

export function formatSar(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: APP_USER_DEFAULTS.DEFAULT_CURRENCY,
  }).format(amount);
}
