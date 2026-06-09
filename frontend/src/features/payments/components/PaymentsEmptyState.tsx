import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function PaymentsEmptyState({
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
        {canAdd ? t("payments.empty.body") : t("payments.empty.needDeal")}
      </p>
      {canAdd && (
        <Button className="mt-4" onClick={onAdd}>
          {t("payments.empty.action")}
        </Button>
      )}
    </div>
  );
}
