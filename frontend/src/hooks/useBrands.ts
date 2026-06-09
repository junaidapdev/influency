import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/features/auth/auth.context";
import { createBrand, listBrands, updateBrand } from "@/features/brands/brand.api";
import { type BrandFormValues } from "@/features/brands/brand.types";

/**
 * Data access for the brands feature. The view never calls the API directly (R: data fetching
 * lives in the hook). List is scoped to the signed-in user; mutations invalidate the list.
 */
export function useBrands() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const brandsQuery = useQuery({
    queryKey: queryKeys.brands(),
    queryFn: () => listBrands(userId ?? ""),
    enabled: userId !== null,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.brands() });

  const createMutation = useMutation({
    mutationFn: (values: BrandFormValues) => createBrand(userId ?? "", values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: BrandFormValues }) =>
      updateBrand(userId ?? "", id, values),
    onSuccess: invalidate,
  });

  return { brandsQuery, createMutation, updateMutation };
}
