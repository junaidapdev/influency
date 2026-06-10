import { z } from "zod";
import { DISPLAY_NAME_MAX_LENGTH, REMINDER_LEAD_OPTIONS } from "@/constants/settings";

const leadValues = REMINDER_LEAD_OPTIONS as readonly number[];

export const settingsSchema = z.object({
  display_name: z.string().trim().max(DISPLAY_NAME_MAX_LENGTH),
  reminder_lead_minutes: z.coerce.number().int().refine((value) => leadValues.includes(value)),
});

// Input differs from output because `reminder_lead_minutes` is coerced (the <select> yields a
// string). react-hook-form is typed with the input shape and the resolved output separately.
export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsValues = z.output<typeof settingsSchema>;
