import { createContext, useContext } from "react";
import { type UserSchema } from "@insforge/sdk";
import { ERROR_CODES } from "@/constants/errors";
import { type Locale } from "@/constants/i18n";
import { type AppUser, type AppUserProfilePatch } from "@/features/auth/appUser.api";
import {
  type EmailPasswordValues,
  type SignUpValues,
  type VerifyEmailValues,
} from "@/features/auth/auth.schema";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  user: UserSchema | null;
  appUser: AppUser | null;
  errorCode: string | null;
  signInWithPassword: (values: EmailPasswordValues) => Promise<void>;
  signUpWithPassword: (values: SignUpValues) => Promise<boolean>;
  verifyEmail: (values: VerifyEmailValues) => Promise<void>;
  signInWithGoogle: (redirectTo: string) => Promise<void>;
  signOut: () => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
  updateProfile: (patch: AppUserProfilePatch) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(ERROR_CODES.AUTH_FAILED);
  }

  return context;
}
