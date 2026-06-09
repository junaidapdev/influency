import { insforge } from "@/lib/insforge";
import { MEETING_STATUS, MEETINGS_TABLE } from "@/constants/meetings";
import { meetingSchema } from "@/features/meetings/meeting.schema";
import { type Meeting, type MeetingFormValues } from "@/features/meetings/meeting.types";

// Editable fields → row shape. brand/deal "" → null, datetime-local → ISO, empty attendee rows
// dropped. user_id/status are set by the create path (not editable here).
function toRow(values: MeetingFormValues) {
  const attendees = values.attendees
    .map((attendee) => ({
      name: attendee.name.trim(),
      contact: attendee.contact.trim() === "" ? null : attendee.contact.trim(),
    }))
    .filter((attendee) => attendee.name !== "");

  return {
    brand_id: values.brand_id === "" ? null : values.brand_id,
    deal_id: values.deal_id === "" ? null : values.deal_id,
    title: values.title.trim(),
    scheduled_at: new Date(values.scheduled_at).toISOString(),
    location_or_link:
      values.location_or_link.trim() === "" ? null : values.location_or_link.trim(),
    attendees: attendees.length > 0 ? attendees : null,
    notes: values.notes.trim() === "" ? null : values.notes.trim(),
  };
}

export async function listMeetings(userId: string): Promise<Meeting[]> {
  const { data, error } = await insforge.database
    .from(MEETINGS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw error;
  }

  return meetingSchema.array().parse(data ?? []);
}

export async function createMeeting(userId: string, values: MeetingFormValues): Promise<Meeting> {
  const { data, error } = await insforge.database
    .from(MEETINGS_TABLE)
    .insert([{ user_id: userId, ...toRow(values), status: MEETING_STATUS.UPCOMING }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return meetingSchema.parse(data);
}

export async function updateMeeting(
  userId: string,
  id: string,
  values: MeetingFormValues,
): Promise<Meeting> {
  const { data, error } = await insforge.database
    .from(MEETINGS_TABLE)
    .update(toRow(values))
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return meetingSchema.parse(data);
}

export async function cancelMeeting(userId: string, id: string): Promise<Meeting> {
  const { data, error } = await insforge.database
    .from(MEETINGS_TABLE)
    .update({ status: MEETING_STATUS.CANCELLED })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return meetingSchema.parse(data);
}

/** Upcoming meetings in [fromIso, toIso] — the "Today" panel source. */
export async function listTodayMeetings(
  userId: string,
  fromIso: string,
  toIso: string,
): Promise<Meeting[]> {
  const { data, error } = await insforge.database
    .from(MEETINGS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("status", MEETING_STATUS.UPCOMING)
    .gte("scheduled_at", fromIso)
    .lte("scheduled_at", toIso)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw error;
  }

  return meetingSchema.array().parse(data ?? []);
}
