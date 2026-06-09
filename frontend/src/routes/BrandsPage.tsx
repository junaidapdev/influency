import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useBrands } from "@/hooks/useBrands";
import { BrandFormDialog } from "@/features/brands/components/BrandFormDialog";
import { BrandListItem } from "@/features/brands/components/BrandListItem";
import { BrandsEmptyState } from "@/features/brands/components/BrandsEmptyState";
import { type Brand, type BrandFormValues } from "@/features/brands/brand.types";

type DialogState = { open: false } | { open: true; brand: Brand | null };

export function BrandsPage() {
  const { t } = useTranslation();
  const { brandsQuery, createMutation, updateMutation } = useBrands();
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const brands = brandsQuery.data ?? [];

  function openAdd() {
    setDialog({ open: true, brand: null });
  }

  function openEdit(brand: Brand) {
    setDialog({ open: true, brand });
  }

  function closeDialog() {
    setDialog({ open: false });
  }

  async function handleSubmit(values: BrandFormValues) {
    if (dialog.open && dialog.brand) {
      await updateMutation.mutateAsync({ id: dialog.brand.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("brands.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("brands.subtitle")}</p>
        </div>
        {brands.length > 0 && <Button onClick={openAdd}>{t("brands.addAction")}</Button>}
      </div>

      {brandsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-20 rounded-md bg-muted" />
          <div className="h-20 rounded-md bg-muted" />
        </div>
      ) : brandsQuery.isError ? (
        <p className="text-sm text-red-600">{t("brands.errors.load")}</p>
      ) : brands.length === 0 ? (
        <BrandsEmptyState onAdd={openAdd} />
      ) : (
        <ul className="space-y-3">
          {brands.map((brand) => (
            <BrandListItem key={brand.id} brand={brand} onEdit={openEdit} />
          ))}
        </ul>
      )}

      {dialog.open && (
        <BrandFormDialog
          key={dialog.brand?.id ?? "new"}
          brand={dialog.brand}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
