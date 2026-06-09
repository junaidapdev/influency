import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function DealsEmptyState({
  canAdd,
  onAdd,
}: {
  canAdd: boolean;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">
        {canAdd ? t("deals.empty.body") : t("deals.empty.needBrand")}
      </p>
      {canAdd && (
        <Button className="mt-4" onClick={onAdd}>
          {t("deals.empty.action")}
        </Button>
      )}
    </div>
  );
}
