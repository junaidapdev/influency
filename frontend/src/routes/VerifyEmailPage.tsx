import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/auth.context";
import { verifyEmailSchema, type VerifyEmailValues } from "@/features/auth/auth.schema";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

interface VerifyEmailRouteState {
  email?: string;
}

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();
  const state = location.state as VerifyEmailRouteState | null;
  const defaultEmail = useMemo(() => state?.email ?? "", [state?.email]);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: defaultEmail },
  });

  async function handleVerify(values: VerifyEmailValues) {
    setFormError(null);

    try {
      await verifyEmail(values);
      navigate(ROUTES.dashboard, { replace: true });
    } catch {
      setFormError(t("auth.errors.verify"));
    }
  }

  return (
    <section className="flex min-h-[78dvh] flex-col justify-center gap-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">{t("verifyEmail.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("verifyEmail.subtitle")}</p>
      </div>

      <form
        className="space-y-4 rounded-2xl bg-card p-5 shadow-card"
        onSubmit={form.handleSubmit(handleVerify)}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium">{t("auth.emailLabel")}</span>
          <input className={INPUT_CLASS} type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <span className="text-sm text-muted-foreground">{t("auth.errors.email")}</span>
          )}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">{t("verifyEmail.codeLabel")}</span>
          <input
            className={INPUT_CLASS}
            inputMode="numeric"
            autoComplete="one-time-code"
            {...form.register("otp")}
          />
          {form.formState.errors.otp && (
            <span className="text-sm text-muted-foreground">{t("verifyEmail.codeError")}</span>
          )}
        </label>

        {formError && <p className="text-sm text-danger">{formError}</p>}

        <Button className="w-full" disabled={form.formState.isSubmitting}>
          {t("verifyEmail.action")}
        </Button>
      </form>
    </section>
  );
}
