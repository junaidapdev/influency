import { APP_USER_DEFAULTS } from "@/constants/auth";
import { type Locale } from "@/constants/i18n";

export function formatSar(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: APP_USER_DEFAULTS.DEFAULT_CURRENCY,
  }).format(amount);
}

/** Plain number (e.g. counts) localized — ar-SA digits in Arabic, en-US otherwise. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value);
}
