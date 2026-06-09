import { type z } from "zod";
import { type snapManualSchema, type snapReportSchema } from "@/features/snap/snap.schema";

/** A persisted snap report row. */
export type SnapReport = z.infer<typeof snapReportSchema>;

/** Manual-override form values (all strings; empty → null). */
export type SnapManualValues = z.infer<typeof snapManualSchema>;
