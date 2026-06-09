import { z } from "zod";
import { REMINDER_CHANNELS, REMINDER_KINDS, REMINDER_REF_TABLES } from "@/constants/reminders";

export const reminderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  kind: z.enum(REMINDER_KINDS),
  ref_id: z.string().nullable(),
  ref_table: z.enum(REMINDER_REF_TABLES).nullable(),
  due_at: z.string(),
  message_en: z.string(),
  message_ar: z.string(),
  channel: z.enum(REMINDER_CHANNELS),
  is_done: z.boolean(),
  is_sent_at: z.string().nullable(),
  created_at: z.string(),
});
