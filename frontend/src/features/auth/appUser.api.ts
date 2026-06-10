import { z } from "zod";
import { insforge } from "@/lib/insforge";
import { APP_USER_DEFAULTS, AUTH_TABLES } from "@/constants/auth";
import { LOCALES, type Locale } from "@/constants/i18n";

export const appUserSchema = z.object({
  user_id: z.string().uuid(),
  display_name: z.string().nullable(),
  locale: z.enum(LOCALES),
  default_currency: z.literal(APP_USER_DEFAULTS.DEFAULT_CURRENCY),
  avatar_url: z.string().nullable(),
  reminder_lead_minutes: z.number().int().positive(),
  created_at: z.string(),
});

export type AppUser = z.infer<typeof appUserSchema>;

interface AuthProfile {
  name?: string;
  avatar_url?: string;
}

interface AuthUserForProfile {
  id: string;
  profile: AuthProfile | null;
}

function profileValue(value: string | undefined): string | null {
  return value && value.trim().length > 0 ? value : null;
}

function parseAppUser(payload: unknown): AppUser {
  return appUserSchema.parse(payload);
}

export async function getAppUser(userId: string): Promise<AppUser | null> {
  const { data, error } = await insforge.database
    .from(AUTH_TABLES.APP_USERS)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? parseAppUser(data) : null;
}

export async function ensureAppUser(user: AuthUserForProfile): Promise<AppUser> {
  const existing = await getAppUser(user.id);

  if (existing) {
    return existing;
  }

  const { data, error } = await insforge.database
    .from(AUTH_TABLES.APP_USERS)
    .insert([
      {
        user_id: user.id,
        display_name: profileValue(user.profile?.name),
        locale: APP_USER_DEFAULTS.LOCALE,
        default_currency: APP_USER_DEFAULTS.DEFAULT_CURRENCY,
        avatar_url: profileValue(user.profile?.avatar_url),
        reminder_lead_minutes: APP_USER_DEFAULTS.REMINDER_LEAD_MINUTES,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return parseAppUser(data);
}

export async function updateAppUserLocale(userId: string, locale: Locale): Promise<AppUser> {
  const { data, error } = await insforge.database
    .from(AUTH_TABLES.APP_USERS)
    .update({ locale })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return parseAppUser(data);
}

export interface AppUserProfilePatch {
  display_name?: string | null;
  reminder_lead_minutes?: number;
  avatar_url?: string | null;
}

/** Update editable profile/preference fields (RLS scopes the row to the caller). */
export async function updateAppUserProfile(
  userId: string,
  patch: AppUserProfilePatch,
): Promise<AppUser> {
  const { data, error } = await insforge.database
    .from(AUTH_TABLES.APP_USERS)
    .update(patch)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return parseAppUser(data);
}
