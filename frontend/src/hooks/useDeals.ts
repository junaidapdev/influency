import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { DEAL_STATUS, type DealFilters, type DealStatus } from "@/constants/deals";
import { useAuth } from "@/features/auth/auth.context";
import {
  createDeal,
  listDeals,
  setDealStatus,
  updateDealDeliverables,
} from "@/features/deals/deal.api";
import { computeDealStatus, setDeliverablePosted } from "@/features/deals/status";
import { type Deal, type Deliverable, type DealFormValues } from "@/features/deals/deal.types";

/**
 * Data access for the deals feature (R: fetching lives in the hook, not the view). The list is
 * scoped to the signed-in user and the active filters; mutations invalidate every deals query
 * for the user so all filtered views refresh.
 */
export function useDeals(filters: DealFilters) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const dealsQuery = useQuery({
    queryKey: queryKeys.deals(userId ?? "", filters),
    queryFn: () => listDeals(userId ?? "", filters),
    enabled: userId !== null,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.dealsByUser(userId ?? "") });

  const createMutation = useMutation({
    mutationFn: (values: DealFormValues) => createDeal(userId ?? "", values),
    onSuccess: invalidate,
  });

  const updateDeliverablesMutation = useMutation({
    mutationFn: ({
      id,
      deliverables,
      status,
    }: {
      id: string;
      deliverables: Deliverable[];
      status: DealStatus;
    }) => updateDealDeliverables(userId ?? "", id, deliverables, status),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => setDealStatus(userId ?? "", id, DEAL_STATUS.CANCELLED),
    onSuccess: invalidate,
  });

  // Mark/unmark a deliverable posted, recompute the status via the machine, and persist both.
  const toggleDeliverable = (deal: Deal, index: number, posted: boolean) => {
    const deliverables = setDeliverablePosted(
      deal.deliverables,
      index,
      posted,
      new Date().toISOString(),
    );
    const status = computeDealStatus(deal.status, deliverables);
    updateDeliverablesMutation.mutate({ id: deal.id, deliverables, status });
  };

  return {
    dealsQuery,
    createMutation,
    updateDeliverablesMutation,
    cancelMutation,
    toggleDeliverable,
  };
}
