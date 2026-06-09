import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/features/auth/auth.context";
import { createPaymentReminder } from "@/features/reminders/reminder.api";

/**
 * Reminder actions reused across features. The payment "Send reminder" button drops an in-app
 * reminder due now (no external delivery), then refreshes the reminder views (dashboard "Today").
 */
export function useReminders() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const sendPaymentReminderMutation = useMutation({
    mutationFn: ({ paymentId, label }: { paymentId: string; label: string }) =>
      createPaymentReminder(userId ?? "", paymentId, label, new Date().toISOString()),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders(userId ?? "") }),
  });

  return { sendPaymentReminderMutation };
}
