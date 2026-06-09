import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { DELIVERABLE_TYPE, DELIVERABLE_TYPES } from "@/constants/deals";
import { dealFormSchema } from "@/features/deals/deal.schema";
import { type DealFormValues } from "@/features/deals/deal.types";
import { type Brand } from "@/features/brands/brand.types";

const INPUT_CLASS =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function emptyValues(): DealFormValues {
  return {
    brand_id: "",
    title: "",
    deliverables: [{ type: DELIVERABLE_TYPE.STORY, count: "1" }],
    agreed_amount_sar: "",
    deadline: "",
    notes: "",
  };
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-sm text-danger">{error}</span>}
    </label>
  );
}

interface DealFormDialogProps {
  brands: Brand[];
  onClose: () => void;
  onSubmit: (values: DealFormValues) => Promise<void>;
}

export function DealFormDialog({ brands, onClose, onSubmit }: DealFormDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const [submitFailed, setSubmitFailed] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: emptyValues(),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "deliverables" });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submit(values: DealFormValues) {
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
        aria-labelledby="deal-form-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg border bg-background p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="deal-form-title" className="text-lg font-semibold">
          {t("deals.form.addTitle")}
        </h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(submit)}>
          <Field label={t("deals.fields.brand")} error={errors.brand_id && t("deals.errors.brand")}>
            <select className={INPUT_CLASS} defaultValue="" {...register("brand_id")}>
              <option value="" disabled>
                {t("deals.fields.brandPlaceholder")}
              </option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {locale === "ar" ? brand.name_ar : brand.name_en}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("deals.fields.title")} error={errors.title && t("deals.errors.title")}>
            <input className={INPUT_CLASS} {...register("title")} />
          </Field>

          <div className="space-y-2">
            <span className="text-sm font-medium">{t("deals.fields.deliverables")}</span>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <select
                  className={INPUT_CLASS}
                  {...register(`deliverables.${index}.type` as const)}
                >
                  {DELIVERABLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`deals.deliverableType.${type}`)}
                    </option>
                  ))}
                </select>
                <input
                  className="h-10 w-20 shrink-0 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  aria-label={t("deals.fields.count")}
                  {...register(`deliverables.${index}.count` as const)}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={t("deals.form.removeDeliverable")}
                    onClick={() => remove(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            {errors.deliverables && (
              <span className="block text-sm text-danger">{t("deals.errors.deliverables")}</span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ type: DELIVERABLE_TYPE.STORY, count: "1" })}
            >
              {t("deals.form.addDeliverable")}
            </Button>
          </div>

          <Field
            label={t("deals.fields.amount")}
            error={errors.agreed_amount_sar && t("deals.errors.amount")}
          >
            <input
              className={INPUT_CLASS}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              {...register("agreed_amount_sar")}
            />
          </Field>

          <Field label={t("deals.fields.deadline")}>
            <input className={INPUT_CLASS} type="date" {...register("deadline")} />
          </Field>

          <Field label={t("deals.fields.notes")}>
            <textarea
              className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              {...register("notes")}
            />
          </Field>

          {submitFailed && <p className="text-sm text-danger">{t("deals.errors.save")}</p>}

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
