import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/features/auth/auth.context";
import {
  createPayment,
  listPayments,
  markPaymentReceived,
} from "@/features/payments/payment.api";
import { type PaymentFormValues } from "@/features/payments/payment.types";

/**
 * Data access for payments (R: fetching lives in the hook). One list per user, split into
 * Pending/Received tabs in the view. Marking received can flip the deal to 'paid', so that
 * mutation invalidates BOTH payments and deals.
 */
export function usePayments() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: queryKeys.payments(userId ?? ""),
    queryFn: () => listPayments(userId ?? ""),
    enabled: userId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (values: PaymentFormValues) => createPayment(userId ?? "", values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.payments(userId ?? "") }),
  });

  const markReceivedMutation = useMutation({
    mutationFn: ({ paymentId, receivedDate }: { paymentId: string; receivedDate: string }) =>
      markPaymentReceived(paymentId, receivedDate),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments(userId ?? "") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dealsByUser(userId ?? "") });
    },
  });

  return { paymentsQuery, createMutation, markReceivedMutation };
}
