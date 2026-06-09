import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { type UserSchema } from "@insforge/sdk";
import i18n from "@/lib/i18n";
import { insforge } from "@/lib/insforge";
import { ERROR_CODES } from "@/constants/errors";
import { type Locale } from "@/constants/i18n";
import { ensureAppUser, updateAppUserLocale, type AppUser } from "@/features/auth/appUser.api";
import {
  type EmailPasswordValues,
  type SignUpValues,
  type VerifyEmailValues,
} from "@/features/auth/auth.schema";
import { AuthContext, type AuthContextValue, type AuthStatus } from "@/features/auth/auth.context";

async function throwOnAuthError(error: unknown): Promise<never> {
  throw error instanceof Error ? error : new Error(ERROR_CODES.AUTH_FAILED);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserSchema | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const hydrateUser = useCallback(async (nextUser: UserSchema | null) => {
    if (!nextUser) {
      setUser(null);
      setAppUser(null);
      setStatus("unauthenticated");
      return;
    }

    const profile = await ensureAppUser(nextUser);
    setUser(nextUser);
    setAppUser(profile);
    setStatus("authenticated");
    await i18n.changeLanguage(profile.locale);
  }, []);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await insforge.auth.getCurrentUser();

    if (error) {
      setErrorCode(ERROR_CODES.AUTH_FAILED);
      await hydrateUser(null);
      return;
    }

    setErrorCode(null);
    await hydrateUser(data.user);
  }, [hydrateUser]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signInWithPassword = useCallback(
    async (values: EmailPasswordValues) => {
      const { error } = await insforge.auth.signInWithPassword(values);

      if (error) {
        await throwOnAuthError(error);
      }

      await refreshSession();
    },
    [refreshSession],
  );

  const signUpWithPassword = useCallback(
    async (values: SignUpValues) => {
      const { data, error } = await insforge.auth.signUp(values);

      if (error) {
        await throwOnAuthError(error);
      }

      if (data?.requireEmailVerification) {
        return true;
      }

      await refreshSession();
      return false;
    },
    [refreshSession],
  );

  const verifyEmail = useCallback(
    async (values: VerifyEmailValues) => {
      const { error } = await insforge.auth.verifyEmail(values);

      if (error) {
        await throwOnAuthError(error);
      }

      await refreshSession();
    },
    [refreshSession],
  );

  const signInWithGoogle = useCallback(async (redirectTo: string) => {
    const { error } = await insforge.auth.signInWithOAuth("google", {
      redirectTo,
      additionalParams: { prompt: "select_account" },
    });

    if (error) {
      await throwOnAuthError(error);
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await insforge.auth.signOut();

    if (error) {
      await throwOnAuthError(error);
    }

    await hydrateUser(null);
  }, [hydrateUser]);

  const setLocale = useCallback(
    async (locale: Locale) => {
      await i18n.changeLanguage(locale);

      if (!user) {
        return;
      }

      const updated = await updateAppUserLocale(user.id, locale);
      setAppUser(updated);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      appUser,
      errorCode,
      signInWithPassword,
      signUpWithPassword,
      verifyEmail,
      signInWithGoogle,
      signOut,
      setLocale,
      refreshSession,
    }),
    [
      status,
      user,
      appUser,
      errorCode,
      signInWithPassword,
      signUpWithPassword,
      verifyEmail,
      signInWithGoogle,
      signOut,
      setLocale,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
