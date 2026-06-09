import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EMPTY_DEAL_FILTERS } from "@/constants/deals";
import { PAYMENT_STATUS, PAYMENT_TAB, type PaymentTab } from "@/constants/payments";
import { useDeals } from "@/hooks/useDeals";
import { usePayments } from "@/hooks/usePayments";
import { todayIsoDate } from "@/lib/date";
import { AddPaymentDialog } from "@/features/payments/components/AddPaymentDialog";
import { PaymentRow } from "@/features/payments/components/PaymentRow";
import { PaymentsEmptyState } from "@/features/payments/components/PaymentsEmptyState";
import { type Payment, type PaymentFormValues } from "@/features/payments/payment.types";

function byExpectedAsc(a: Payment, b: Payment): number {
  const da = a.expected_date ?? "9999-12-31";
  const db = b.expected_date ?? "9999-12-31";
  return da < db ? -1 : da > db ? 1 : 0;
}

function byReceivedDesc(a: Payment, b: Payment): number {
  const da = a.received_date ?? "";
  const db = b.received_date ?? "";
  return da < db ? 1 : da > db ? -1 : 0;
}

export function PaymentsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<PaymentTab>(PAYMENT_TAB.PENDING);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { paymentsQuery, createMutation, markReceivedMutation } = usePayments();
  const { dealsQuery } = useDeals(EMPTY_DEAL_FILTERS);

  const deals = useMemo(() => dealsQuery.data ?? [], [dealsQuery.data]);
  const payments = paymentsQuery.data ?? [];
  const canAdd = deals.length > 0;

  const dealTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const deal of deals) {
      map.set(deal.id, deal.title);
    }
    return map;
  }, [deals]);

  const pending = payments.filter((p) => p.status !== PAYMENT_STATUS.RECEIVED).sort(byExpectedAsc);
  const received = payments.filter((p) => p.status === PAYMENT_STATUS.RECEIVED).sort(byReceivedDesc);
  const visible = tab === PAYMENT_TAB.PENDING ? pending : received;

  async function handleCreate(values: PaymentFormValues) {
    await createMutation.mutateAsync(values);
  }

  function handleMarkReceived(paymentId: string) {
    markReceivedMutation.mutate({ paymentId, receivedDate: todayIsoDate() });
  }

  function tabClass(value: PaymentTab): string {
    return value === tab
      ? "border-b-2 border-foreground pb-2 text-sm font-medium"
      : "pb-2 text-sm text-muted-foreground";
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("payments.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("payments.subtitle")}</p>
        </div>
        {canAdd && <Button onClick={() => setDialogOpen(true)}>{t("payments.addAction")}</Button>}
      </div>

      <div className="flex gap-6 border-b">
        <button type="button" className={tabClass(PAYMENT_TAB.PENDING)} onClick={() => setTab(PAYMENT_TAB.PENDING)}>
          {t("payments.tabs.pending")} ({pending.length})
        </button>
        <button type="button" className={tabClass(PAYMENT_TAB.RECEIVED)} onClick={() => setTab(PAYMENT_TAB.RECEIVED)}>
          {t("payments.tabs.received")} ({received.length})
        </button>
      </div>

      {paymentsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-20 rounded-md bg-muted" />
          <div className="h-20 rounded-md bg-muted" />
        </div>
      ) : paymentsQuery.isError ? (
        <p className="text-sm text-red-600">{t("payments.errors.load")}</p>
      ) : payments.length === 0 ? (
        <PaymentsEmptyState canAdd={canAdd} onAdd={() => setDialogOpen(true)} />
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {tab === PAYMENT_TAB.PENDING ? t("payments.noPending") : t("payments.noReceived")}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              dealTitle={dealTitleById.get(payment.deal_id) ?? ""}
              onMarkReceived={handleMarkReceived}
              isMarking={markReceivedMutation.isPending}
            />
          ))}
        </ul>
      )}

      {dialogOpen && (
        <AddPaymentDialog
          deals={deals}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
  );
}
