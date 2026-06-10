import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { BrandAvatar } from "@/components/BrandAvatar";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { APP_USER_DEFAULTS } from "@/constants/auth";
import { LOCALES, type Locale } from "@/constants/i18n";
import { ROUTES } from "@/constants/routes";
import { DISPLAY_NAME_MAX_LENGTH, REMINDER_LEAD_OPTIONS } from "@/constants/settings";
import { useAuth } from "@/features/auth/auth.context";
import {
  settingsSchema,
  type SettingsInput,
  type SettingsValues,
} from "@/features/settings/settings.schema";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const navigate = useNavigate();
  const { appUser, user, setLocale, updateProfile, signOut } = useAuth();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput, unknown, SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      display_name: appUser?.display_name ?? "",
      reminder_lead_minutes:
        appUser?.reminder_lead_minutes ?? APP_USER_DEFAULTS.REMINDER_LEAD_MINUTES,
    },
  });

  const name = appUser?.display_name ?? "";

  async function onSubmit(values: SettingsValues) {
    setSaved(false);
    const trimmed = values.display_name.trim();
    await updateProfile({
      display_name: trimmed === "" ? null : trimmed,
      reminder_lead_minutes: values.reminder_lead_minutes,
    });
    setSaved(true);
  }

  async function handleSignOut() {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <section className="space-y-4">
      <AppHeader eyebrow={t("settings.subtitle")} title={t("settings.title")} />

      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-semibold">{t("settings.language")}</h2>
        <SegmentedTabs
          options={LOCALES.map((value) => ({ value, label: t(`settings.locale.${value}`) }))}
          value={locale}
          onChange={(value) => void setLocale(value)}
        />
      </div>

      <form
        className="space-y-4 rounded-2xl bg-card p-4 shadow-card"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center gap-3">
          <BrandAvatar name={name || "?"} seed={user?.id} className="size-12" />
          <h2 className="font-semibold">{t("settings.profile")}</h2>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">{t("settings.displayName")}</span>
          <input
            className={INPUT_CLASS}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            autoComplete="name"
            {...register("display_name")}
          />
          {errors.display_name && (
            <span className="text-sm text-danger">{t("settings.errors.displayName")}</span>
          )}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">{t("settings.reminderLead")}</span>
          <select className={INPUT_CLASS} {...register("reminder_lead_minutes")}>
            {REMINDER_LEAD_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`settings.lead.${option}`)}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">{t("settings.reminderLeadHint")}</span>
        </label>

        <div className="flex items-center gap-3">
          <Button disabled={isSubmitting}>{t("common.save")}</Button>
          {saved && <span className="text-sm font-medium text-paid">{t("settings.saved")}</span>}
        </div>
      </form>

      <Button type="button" variant="outline" className="w-full" onClick={() => void handleSignOut()}>
        {t("auth.signOut")}
      </Button>
    </section>
  );
}
