import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/auth.context";
import { verifyEmailSchema, type VerifyEmailValues } from "@/features/auth/auth.schema";

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
    <section className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("verifyEmail.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("verifyEmail.subtitle")}</p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(handleVerify)}>
        <label className="block space-y-2">
          <span className="text-sm font-medium">{t("auth.emailLabel")}</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <span className="text-sm text-muted-foreground">{t("auth.errors.email")}</span>
          )}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">{t("verifyEmail.codeLabel")}</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            inputMode="numeric"
            autoComplete="one-time-code"
            {...form.register("otp")}
          />
          {form.formState.errors.otp && (
            <span className="text-sm text-muted-foreground">{t("verifyEmail.codeError")}</span>
          )}
        </label>

        {formError && <p className="text-sm text-muted-foreground">{formError}</p>}

        <Button className="w-full" disabled={form.formState.isSubmitting}>
          {t("verifyEmail.action")}
        </Button>
      </form>
    </section>
  );
}
