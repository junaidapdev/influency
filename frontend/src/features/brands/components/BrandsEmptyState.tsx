import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function BrandsEmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">{t("brands.empty.body")}</p>
      <Button className="mt-4" onClick={onAdd}>
        {t("brands.empty.action")}
      </Button>
    </div>
  );
}
