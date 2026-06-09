import { type z } from "zod";
import { type ReminderKind, type ReminderRefTable } from "@/constants/reminders";
import { type reminderSchema } from "@/features/reminders/reminder.schema";

/** A persisted reminder row. */
export type Reminder = z.infer<typeof reminderSchema>;

/** Fields for a new reminder (user_id is added by the API). */
export interface NewReminder {
  kind: ReminderKind;
  ref_id: string | null;
  ref_table: ReminderRefTable | null;
  due_at: string;
  message_en: string;
  message_ar: string;
}
