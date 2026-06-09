import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import {
  DEAL_STATUSES,
  EMPTY_DEAL_FILTERS,
  type DealFilters,
  type DealStatus,
} from "@/constants/deals";
import { useBrands } from "@/hooks/useBrands";
import { useDeals } from "@/hooks/useDeals";
import { DealFormDialog } from "@/features/deals/components/DealFormDialog";
import { DealRow } from "@/features/deals/components/DealRow";
import { DealsEmptyState } from "@/features/deals/components/DealsEmptyState";
import { type DealFormValues } from "@/features/deals/deal.types";

const SELECT_CLASS =
  "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function DealsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const [filters, setFilters] = useState<DealFilters>(EMPTY_DEAL_FILTERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { brandsQuery } = useBrands();
  const { dealsQuery, createMutation, cancelMutation, updateDeliverablesMutation, toggleDeliverable } =
    useDeals(filters);

  const brands = useMemo(() => brandsQuery.data ?? [], [brandsQuery.data]);
  const deals = dealsQuery.data ?? [];
  const canAdd = brands.length > 0;
  const hasActiveFilters = filters.brandId !== null || filters.status !== null || filters.month !== null;
  const isMutating = updateDeliverablesMutation.isPending || cancelMutation.isPending;

  const brandNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const brand of brands) {
      map.set(brand.id, locale === "ar" ? brand.name_ar : brand.name_en);
    }
    return map;
  }, [brands, locale]);

  async function handleCreate(values: DealFormValues) {
    await createMutation.mutateAsync(values);
  }

  function updateFilter<K extends keyof DealFilters>(key: K, value: DealFilters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("deals.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("deals.subtitle")}</p>
        </div>
        {canAdd && <Button onClick={() => setDialogOpen(true)}>{t("deals.addAction")}</Button>}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className={SELECT_CLASS}
          value={filters.brandId ?? ""}
          aria-label={t("deals.filters.brand")}
          onChange={(event) => updateFilter("brandId", event.target.value || null)}
        >
          <option value="">{t("deals.filters.allBrands")}</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {locale === "ar" ? brand.name_ar : brand.name_en}
            </option>
          ))}
        </select>

        <select
          className={SELECT_CLASS}
          value={filters.status ?? ""}
          aria-label={t("deals.filters.status")}
          onChange={(event) => updateFilter("status", (event.target.value || null) as DealStatus | null)}
        >
          <option value="">{t("deals.filters.allStatuses")}</option>
          {DEAL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`deals.status.${status}`)}
            </option>
          ))}
        </select>

        <input
          className={SELECT_CLASS}
          type="month"
          value={filters.month ?? ""}
          aria-label={t("deals.filters.month")}
          onChange={(event) => updateFilter("month", event.target.value || null)}
        />
      </div>

      {dealsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-20 rounded-md bg-muted" />
          <div className="h-20 rounded-md bg-muted" />
        </div>
      ) : dealsQuery.isError ? (
        <p className="text-sm text-red-600">{t("deals.errors.load")}</p>
      ) : deals.length === 0 ? (
        hasActiveFilters ? (
          <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            {t("deals.noMatches")}
          </p>
        ) : (
          <DealsEmptyState canAdd={canAdd} onAdd={() => setDialogOpen(true)} />
        )
      ) : (
        <ul className="space-y-3">
          {deals.map((deal) => (
            <DealRow
              key={deal.id}
              deal={deal}
              brandName={brandNameById.get(deal.brand_id) ?? ""}
              onToggleDeliverable={toggleDeliverable}
              onCancel={(target) => cancelMutation.mutate(target.id)}
              isMutating={isMutating}
            />
          ))}
        </ul>
      )}

      {dialogOpen && (
        <DealFormDialog
          brands={brands}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
  );
}
