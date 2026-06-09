import { z } from "zod";
import { AUTH_FORM_LIMITS } from "@/constants/auth";

export const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(AUTH_FORM_LIMITS.PASSWORD_MIN_LENGTH),
});

export const signUpSchema = emailPasswordSchema.extend({
  name: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(AUTH_FORM_LIMITS.OTP_LENGTH),
});

export type EmailPasswordValues = z.infer<typeof emailPasswordSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
