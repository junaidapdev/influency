import { type z } from "zod";
import { type brandFormSchema, type brandSchema } from "@/features/brands/brand.schema";

/** A persisted brand row. */
export type Brand = z.infer<typeof brandSchema>;

/** Validated form values for create/edit (all strings; optionals may be empty). */
export type BrandFormValues = z.infer<typeof brandFormSchema>;
