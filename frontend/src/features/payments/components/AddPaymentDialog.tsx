import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS } from "@/constants/payments";
import { paymentFormSchema } from "@/features/payments/payment.schema";
import { type PaymentFormValues } from "@/features/payments/payment.types";
import { type Deal } from "@/features/deals/deal.types";

const INPUT_CLASS =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function emptyValues(): PaymentFormValues {
  return { deal_id: "", amount_sar: "", expected_date: "", method: "", notes: "" };
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600">{error}</span>}
    </label>
  );
}

interface AddPaymentDialogProps {
  deals: Deal[];
  onClose: () => void;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
}

export function AddPaymentDialog({ deals, onClose, onSubmit }: AddPaymentDialogProps) {
  const { t } = useTranslation();
  const [submitFailed, setSubmitFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submit(values: PaymentFormValues) {
    setSubmitFailed(false);
    try {
      await onSubmit(values);
      onClose();
    } catch {
      setSubmitFailed(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-form-title"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-lg border bg-background p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="payment-form-title" className="text-lg font-semibold">
          {t("payments.form.addTitle")}
        </h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(submit)}>
          <Field label={t("payments.fields.deal")} error={errors.deal_id && t("payments.errors.deal")}>
            <select className={INPUT_CLASS} defaultValue="" {...register("deal_id")}>
              <option value="" disabled>
                {t("payments.fields.dealPlaceholder")}
              </option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.title}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t("payments.fields.amount")}
            error={errors.amount_sar && t("payments.errors.amount")}
          >
            <input
              className={INPUT_CLASS}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              {...register("amount_sar")}
            />
          </Field>

          <Field label={t("payments.fields.expectedDate")}>
            <input className={INPUT_CLASS} type="date" {...register("expected_date")} />
          </Field>

          <Field label={t("payments.fields.method")}>
            <select className={INPUT_CLASS} defaultValue="" {...register("method")}>
              <option value="">{t("payments.fields.methodNone")}</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {t(`payments.method.${method}`)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("payments.fields.notes")}>
            <textarea
              className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              {...register("notes")}
            />
          </Field>

          {submitFailed && <p className="text-sm text-red-600">{t("payments.errors.save")}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button disabled={isSubmitting}>{t("common.save")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
