import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { brandFormSchema } from "@/features/brands/brand.schema";
import { type Brand, type BrandFormValues } from "@/features/brands/brand.types";

const INPUT_CLASS =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function emptyValues(): BrandFormValues {
  return {
    name_en: "",
    name_ar: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    notes: "",
  };
}

function toFormValues(brand: Brand): BrandFormValues {
  return {
    name_en: brand.name_en,
    name_ar: brand.name_ar,
    contact_name: brand.contact_name ?? "",
    contact_email: brand.contact_email ?? "",
    contact_phone: brand.contact_phone ?? "",
    notes: brand.notes ?? "",
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-sm text-danger">{error}</span>}
    </label>
  );
}

interface BrandFormDialogProps {
  brand: Brand | null;
  onClose: () => void;
  onSubmit: (values: BrandFormValues) => Promise<void>;
}

export function BrandFormDialog({ brand, onClose, onSubmit }: BrandFormDialogProps) {
  const { t } = useTranslation();
  const [submitFailed, setSubmitFailed] = useState(false);
  const isEdit = brand !== null;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: brand ? toFormValues(brand) : emptyValues(),
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

  async function submit(values: BrandFormValues) {
    setSubmitFailed(false);

    try {
      await onSubmit(values);
      onClose();
    } catch {
      setSubmitFailed(true);
    }
  }

  const title = isEdit ? t("brands.form.editTitle") : t("brands.form.addTitle");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-form-title"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-lg border bg-background p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="brand-form-title" className="text-lg font-semibold">
          {title}
        </h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(submit)}>
          <Field label={t("brands.fields.nameEn")} error={errors.name_en && t("brands.errors.nameEn")}>
            <input className={INPUT_CLASS} autoFocus {...register("name_en")} />
          </Field>

          <Field label={t("brands.fields.nameAr")} error={errors.name_ar && t("brands.errors.nameAr")}>
            <input className={INPUT_CLASS} {...register("name_ar")} />
          </Field>

          <Field label={t("brands.fields.contactName")}>
            <input className={INPUT_CLASS} autoComplete="name" {...register("contact_name")} />
          </Field>

          <Field
            label={t("brands.fields.contactEmail")}
            error={errors.contact_email && t("brands.errors.contactEmail")}
          >
            <input
              className={INPUT_CLASS}
              type="email"
              autoComplete="email"
              {...register("contact_email")}
            />
          </Field>

          <Field
            label={t("brands.fields.contactPhone")}
            error={errors.contact_phone && t("brands.errors.contactPhone")}
          >
            <input
              className={INPUT_CLASS}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              {...register("contact_phone")}
            />
          </Field>

          <Field label={t("brands.fields.notes")}>
            <textarea
              className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              {...register("notes")}
            />
          </Field>

          {submitFailed && <p className="text-sm text-danger">{t("brands.errors.save")}</p>}

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
