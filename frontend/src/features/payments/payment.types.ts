import { type z } from "zod";
import { type paymentFormSchema, type paymentSchema } from "@/features/payments/payment.schema";

/** A persisted payment row. */
export type Payment = z.infer<typeof paymentSchema>;

/** Validated add-payment form values (strings; parsed at the API boundary). */
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
