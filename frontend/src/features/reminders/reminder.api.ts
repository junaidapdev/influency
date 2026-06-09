import { insforge } from "@/lib/insforge";
import {
  REMINDER_KIND,
  REMINDER_MESSAGE_PREFIX,
  REMINDER_REF_TABLE,
  REMINDERS_TABLE,
} from "@/constants/reminders";
import { reminderSchema } from "@/features/reminders/reminder.schema";
import { type NewReminder, type Reminder } from "@/features/reminders/reminder.types";

/** THE single place a reminder row is created — meeting/payment/deliverable reminders all go here. */
export async function createReminder(userId: string, reminder: NewReminder): Promise<Reminder> {
  const { data, error } = await insforge.database
    .from(REMINDERS_TABLE)
    .insert([{ user_id: userId, ...reminder }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return reminderSchema.parse(data);
}

function minutesBefore(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() - minutes * 60_000).toISOString();
}

function meetingMessages(title: string): { en: string; ar: string } {
  return {
    en: `${REMINDER_MESSAGE_PREFIX.meeting.en}: ${title}`,
    ar: `${REMINDER_MESSAGE_PREFIX.meeting.ar}: ${title}`,
  };
}

/** Meeting reminder, due `leadMinutes` before the meeting. */
export async function createMeetingReminder(
  userId: string,
  meetingId: string,
  title: string,
  scheduledAt: string,
  leadMinutes: number,
): Promise<void> {
  const messages = meetingMessages(title);
  await createReminder(userId, {
    kind: REMINDER_KIND.MEETING,
    ref_id: meetingId,
    ref_table: REMINDER_REF_TABLE.MEETINGS,
    due_at: minutesBefore(scheduledAt, leadMinutes),
    message_en: messages.en,
    message_ar: messages.ar,
  });
}

/** On meeting edit: move + re-activate the meeting's reminder; create it if none exists yet. */
export async function syncMeetingReminder(
  userId: string,
  meetingId: string,
  title: string,
  scheduledAt: string,
  leadMinutes: number,
): Promise<void> {
  const messages = meetingMessages(title);
  const { data, error } = await insforge.database
    .from(REMINDERS_TABLE)
    .update({
      due_at: minutesBefore(scheduledAt, leadMinutes),
      is_done: false,
      message_en: messages.en,
      message_ar: messages.ar,
    })
    .eq("user_id", userId)
    .eq("ref_table", REMINDER_REF_TABLE.MEETINGS)
    .eq("ref_id", meetingId)
    .select();

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    await createMeetingReminder(userId, meetingId, title, scheduledAt, leadMinutes);
  }
}

/** On meeting cancel: clear the meeting's reminder (mark done so it drops off "Today"). */
export async function clearMeetingReminder(userId: string, meetingId: string): Promise<void> {
  const { error } = await insforge.database
    .from(REMINDERS_TABLE)
    .update({ is_done: true })
    .eq("user_id", userId)
    .eq("ref_table", REMINDER_REF_TABLE.MEETINGS)
    .eq("ref_id", meetingId);

  if (error) {
    throw error;
  }
}

/** Payment "Send reminder": an in-app reminder due now (no external delivery). */
export async function createPaymentReminder(
  userId: string,
  paymentId: string,
  label: string,
  dueAt: string,
): Promise<void> {
  await createReminder(userId, {
    kind: REMINDER_KIND.PAYMENT,
    ref_id: paymentId,
    ref_table: REMINDER_REF_TABLE.PAYMENTS,
    due_at: dueAt,
    message_en: `${REMINDER_MESSAGE_PREFIX.payment.en}: ${label}`,
    message_ar: `${REMINDER_MESSAGE_PREFIX.payment.ar}: ${label}`,
  });
}

/** Not-done reminders due by `windowEndIso` (includes overdue ones) — the "Today" panel source. */
export async function listTodayReminders(userId: string, windowEndIso: string): Promise<Reminder[]> {
  const { data, error } = await insforge.database
    .from(REMINDERS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("is_done", false)
    .lte("due_at", windowEndIso)
    .order("due_at", { ascending: true });

  if (error) {
    throw error;
  }

  return reminderSchema.array().parse(data ?? []);
}
