import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { APP_USER_DEFAULTS } from "@/constants/auth";
import { useAuth } from "@/features/auth/auth.context";
import {
  cancelMeeting,
  createMeeting,
  listMeetings,
  updateMeeting,
} from "@/features/meetings/meeting.api";
import {
  clearMeetingReminder,
  createMeetingReminder,
  syncMeetingReminder,
} from "@/features/reminders/reminder.api";
import { type MeetingFormValues } from "@/features/meetings/meeting.types";

/**
 * Meetings CRUD. Each mutation also keeps the meeting's reminder in sync (created in code, not a
 * DB trigger): create makes one due `reminder_lead_minutes` before the meeting, edit moves it,
 * cancel clears it. Mutations invalidate meetings AND reminders so the dashboard "Today" updates.
 */
export function useMeetings() {
  const { user, appUser } = useAuth();
  const userId = user?.id ?? null;
  const leadMinutes = appUser?.reminder_lead_minutes ?? APP_USER_DEFAULTS.REMINDER_LEAD_MINUTES;
  const queryClient = useQueryClient();

  const meetingsQuery = useQuery({
    queryKey: queryKeys.meetings(userId ?? ""),
    queryFn: () => listMeetings(userId ?? ""),
    enabled: userId !== null,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.meetings(userId ?? "") });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reminders(userId ?? "") });
  };

  const createMutation = useMutation({
    mutationFn: async (values: MeetingFormValues) => {
      const meeting = await createMeeting(userId ?? "", values);
      await createMeetingReminder(
        userId ?? "",
        meeting.id,
        meeting.title,
        meeting.scheduled_at,
        leadMinutes,
      );
      return meeting;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: MeetingFormValues }) => {
      const meeting = await updateMeeting(userId ?? "", id, values);
      await syncMeetingReminder(
        userId ?? "",
        meeting.id,
        meeting.title,
        meeting.scheduled_at,
        leadMinutes,
      );
      return meeting;
    },
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const meeting = await cancelMeeting(userId ?? "", id);
      await clearMeetingReminder(userId ?? "", id);
      return meeting;
    },
    onSuccess: invalidate,
  });

  return { meetingsQuery, createMutation, updateMutation, cancelMutation };
}
