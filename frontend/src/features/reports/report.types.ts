import { type z } from "zod";
import {
  type brandReportRowSchema,
  type monthlyReportRowSchema,
} from "@/features/reports/report.schema";

export type MonthlyReportRow = z.infer<typeof monthlyReportRowSchema>;
export type BrandReportRow = z.infer<typeof brandReportRowSchema>;
