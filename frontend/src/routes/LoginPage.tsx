import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/auth.context";
import {
  emailPasswordSchema,
  signUpSchema,
  type EmailPasswordValues,
  type SignUpValues,
} from "@/features/auth/auth.schema";

type AuthMode = "signIn" | "signUp";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [formError, setFormError] = useState<string | null>(null);
  const signInForm = useForm<EmailPasswordValues>({ resolver: zodResolver(emailPasswordSchema) });
  const signUpForm = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });
  const isSignIn = mode === "signIn";

  async function handleSignIn(values: EmailPasswordValues) {
    setFormError(null);

    try {
      await signInWithPassword(values);
      navigate(ROUTES.dashboard, { replace: true });
    } catch {
      setFormError(t("auth.errors.signIn"));
    }
  }

  async function handleSignUp(values: SignUpValues) {
    setFormError(null);

    try {
      const requiresVerification = await signUpWithPassword(values);

      if (requiresVerification) {
        navigate(ROUTES.verifyEmail, { state: { email: values.email } });
        return;
      }

      navigate(ROUTES.dashboard, { replace: true });
    } catch {
      setFormError(t("auth.errors.signUp"));
    }
  }

  async function handleGoogleSignIn() {
    setFormError(null);

    try {
      await signInWithGoogle(`${window.location.origin}${ROUTES.dashboard}`);
    } catch {
      setFormError(t("auth.errors.google"));
    }
  }

  return (
    <section className="flex min-h-[78dvh] flex-col justify-center gap-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="space-y-3 text-center">
        <span className="bg-brand-gradient mx-auto flex size-14 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-fab">
          {t("app.name").charAt(0)}
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("auth.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl bg-card p-5 shadow-card">
        <div className="flex justify-center">
          <SegmentedTabs
            options={[
              { value: "signIn", label: t("auth.signInTab") },
              { value: "signUp", label: t("auth.signUpTab") },
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>

        <form
          className="space-y-4"
          onSubmit={
            isSignIn ? signInForm.handleSubmit(handleSignIn) : signUpForm.handleSubmit(handleSignUp)
          }
        >
          {!isSignIn ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">{t("auth.nameLabel")}</span>
              <input className={INPUT_CLASS} autoComplete="name" {...signUpForm.register("name")} />
              {signUpForm.formState.errors.name && (
                <span className="text-sm text-muted-foreground">{t("auth.errors.name")}</span>
              )}
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium">{t("auth.emailLabel")}</span>
            <input
              className={INPUT_CLASS}
              type="email"
              autoComplete="email"
              {...(isSignIn ? signInForm.register("email") : signUpForm.register("email"))}
            />
            {(isSignIn ? signInForm.formState.errors.email : signUpForm.formState.errors.email) && (
              <span className="text-sm text-muted-foreground">{t("auth.errors.email")}</span>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">{t("auth.passwordLabel")}</span>
            <input
              className={INPUT_CLASS}
              type="password"
              autoComplete={isSignIn ? "current-password" : "new-password"}
              {...(isSignIn ? signInForm.register("password") : signUpForm.register("password"))}
            />
            {(isSignIn
              ? signInForm.formState.errors.password
              : signUpForm.formState.errors.password) && (
              <span className="text-sm text-muted-foreground">{t("auth.errors.password")}</span>
            )}
          </label>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button
            className="w-full"
            disabled={
              isSignIn ? signInForm.formState.isSubmitting : signUpForm.formState.isSubmitting
            }
          >
            {isSignIn ? t("auth.signInAction") : t("auth.signUpAction")}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void handleGoogleSignIn()}
        >
          {t("auth.googleAction")}
        </Button>
      </div>
    </section>
  );
}
