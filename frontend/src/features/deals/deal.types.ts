import { type z } from "zod";
import {
  type dealFormSchema,
  type dealSchema,
  type deliverableSchema,
} from "@/features/deals/deal.schema";

/** A persisted ad deal row. */
export type Deal = z.infer<typeof dealSchema>;

/** Validated create-form values (number/date fields already coerced). */
export type DealFormValues = z.infer<typeof dealFormSchema>;

/** A single deliverable inside the jsonb array. */
export type Deliverable = z.infer<typeof deliverableSchema>;
