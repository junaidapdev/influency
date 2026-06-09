import { type ApiResponse } from "@shared/api";
import { insforge } from "@/lib/insforge";
import { ERROR_CODES } from "@/constants/errors";
import { MARK_PAYMENT_RECEIVED_FN, PAYMENT_STATUS, PAYMENTS_TABLE } from "@/constants/payments";
import { paymentSchema } from "@/features/payments/payment.schema";
import { type Payment, type PaymentFormValues } from "@/features/payments/payment.types";

interface MarkReceivedResult {
  deal_id: string;
  deal_paid: boolean;
}

function toRow(userId: string, values: PaymentFormValues) {
  return {
    user_id: userId,
    deal_id: values.deal_id,
    amount_sar: Number(values.amount_sar),
    expected_date: values.expected_date.trim() === "" ? null : values.expected_date,
    method: values.method === "" ? null : values.method,
    notes: values.notes.trim() === "" ? null : values.notes.trim(),
    status: PAYMENT_STATUS.PENDING,
  };
}

export async function listPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await insforge.database
    .from(PAYMENTS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return paymentSchema.array().parse(data ?? []);
}

export async function createPayment(userId: string, values: PaymentFormValues): Promise<Payment> {
  const { data, error } = await insforge.database
    .from(PAYMENTS_TABLE)
    .insert([toRow(userId, values)])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return paymentSchema.parse(data);
}

// Atomic: delegates to the mark-payment-received edge function, which validates and calls the
// single-transaction RPC. Returns whether the deal flipped to 'paid'.
export async function markPaymentReceived(
  paymentId: string,
  receivedDate: string,
): Promise<MarkReceivedResult> {
  const { data, error } = await insforge.functions.invoke(MARK_PAYMENT_RECEIVED_FN, {
    body: { paymentId, receivedDate },
  });

  if (error) {
    throw error instanceof Error ? error : new Error(ERROR_CODES.UNKNOWN);
  }

  const envelope = data as ApiResponse<MarkReceivedResult>;
  if (!envelope.ok) {
    throw new Error(envelope.error.code);
  }

  return envelope.data;
}
