import { z } from "zod";
import { MEETING_FIELD_LIMITS, MEETING_STATUSES } from "@/constants/meetings";

const isUuidOrEmpty = (value: string): boolean =>
  value === "" || z.string().uuid().safeParse(value).success;

const isDateTime = (value: string): boolean => value !== "" && !Number.isNaN(Date.parse(value));

/** A persisted attendee inside the jsonb array. */
export const attendeeSchema = z.object({
  name: z.string(),
  contact: z.string().nullable().optional(),
});

// Form-facing validation (react-hook-form). All-string fields; brand/deal "" → null, the
// datetime-local string → ISO, and empty attendee rows are dropped at the API boundary.
export const meetingFormSchema = z.object({
  title: z.string().trim().min(1).max(MEETING_FIELD_LIMITS.TITLE_MAX),
  scheduled_at: z.string().refine(isDateTime),
  brand_id: z.string().refine(isUuidOrEmpty),
  deal_id: z.string().refine(isUuidOrEmpty),
  location_or_link: z.string().trim().max(MEETING_FIELD_LIMITS.LOCATION_MAX),
  notes: z.string().trim().max(MEETING_FIELD_LIMITS.NOTES_MAX),
  attendees: z
    .array(
      z.object({
        name: z.string().trim().max(MEETING_FIELD_LIMITS.ATTENDEE_NAME_MAX),
        contact: z.string().trim().max(MEETING_FIELD_LIMITS.ATTENDEE_CONTACT_MAX),
      }),
    )
    .max(MEETING_FIELD_LIMITS.ATTENDEES_MAX),
});

export const meetingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  brand_id: z.string().uuid().nullable(),
  deal_id: z.string().uuid().nullable(),
  title: z.string(),
  scheduled_at: z.string(),
  location_or_link: z.string().nullable(),
  attendees: z.array(attendeeSchema).nullable(),
  notes: z.string().nullable(),
  status: z.enum(MEETING_STATUSES),
  created_at: z.string(),
});
