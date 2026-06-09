import { type z } from "zod";
import {
  type attendeeSchema,
  type meetingFormSchema,
  type meetingSchema,
} from "@/features/meetings/meeting.schema";

/** A persisted meeting row. */
export type Meeting = z.infer<typeof meetingSchema>;

/** Validated add/edit form values (strings; parsed at the API boundary). */
export type MeetingFormValues = z.infer<typeof meetingFormSchema>;

/** A single attendee in the jsonb array. */
export type Attendee = z.infer<typeof attendeeSchema>;
