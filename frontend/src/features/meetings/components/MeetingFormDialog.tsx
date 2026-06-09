import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { meetingFormSchema } from "@/features/meetings/meeting.schema";
import { type Meeting, type MeetingFormValues } from "@/features/meetings/meeting.types";
import { type Brand } from "@/features/brands/brand.types";
import { type Deal } from "@/features/deals/deal.types";

const INPUT_CLASS =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Stored ISO → the value a <input type="datetime-local"> expects (local "YYYY-MM-DDTHH:mm").
function isoToLocalInput(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function emptyValues(): MeetingFormValues {
  return {
    title: "",
    scheduled_at: "",
    brand_id: "",
    deal_id: "",
    location_or_link: "",
    notes: "",
    attendees: [],
  };
}

function toFormValues(meeting: Meeting): MeetingFormValues {
  return {
    title: meeting.title,
    scheduled_at: isoToLocalInput(meeting.scheduled_at),
    brand_id: meeting.brand_id ?? "",
    deal_id: meeting.deal_id ?? "",
    location_or_link: meeting.location_or_link ?? "",
    notes: meeting.notes ?? "",
    attendees: (meeting.attendees ?? []).map((attendee) => ({
      name: attendee.name,
      contact: attendee.contact ?? "",
    })),
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

interface MeetingFormDialogProps {
  meeting: Meeting | null;
  brands: Brand[];
  deals: Deal[];
  onClose: () => void;
  onSubmit: (values: MeetingFormValues) => Promise<void>;
}

export function MeetingFormDialog({
  meeting,
  brands,
  deals,
  onClose,
  onSubmit,
}: MeetingFormDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const [submitFailed, setSubmitFailed] = useState(false);
  const isEdit = meeting !== null;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: meeting ? toFormValues(meeting) : emptyValues(),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "attendees" });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submit(values: MeetingFormValues) {
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
        aria-labelledby="meeting-form-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg border bg-background p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="meeting-form-title" className="text-lg font-semibold">
          {isEdit ? t("meetings.form.editTitle") : t("meetings.form.addTitle")}
        </h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(submit)}>
          <Field label={t("meetings.fields.title")} error={errors.title && t("meetings.errors.title")}>
            <input className={INPUT_CLASS} autoFocus {...register("title")} />
          </Field>

          <Field
            label={t("meetings.fields.scheduledAt")}
            error={errors.scheduled_at && t("meetings.errors.scheduledAt")}
          >
            <input className={INPUT_CLASS} type="datetime-local" {...register("scheduled_at")} />
          </Field>

          <Field label={t("meetings.fields.brand")}>
            <select className={INPUT_CLASS} defaultValue="" {...register("brand_id")}>
              <option value="">{t("meetings.fields.noLink")}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {locale === "ar" ? brand.name_ar : brand.name_en}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("meetings.fields.deal")}>
            <select className={INPUT_CLASS} defaultValue="" {...register("deal_id")}>
              <option value="">{t("meetings.fields.noLink")}</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("meetings.fields.location")}>
            <input className={INPUT_CLASS} {...register("location_or_link")} />
          </Field>

          <div className="space-y-2">
            <span className="text-sm font-medium">{t("meetings.fields.attendees")}</span>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  className={INPUT_CLASS}
                  placeholder={t("meetings.fields.attendeeName")}
                  {...register(`attendees.${index}.name` as const)}
                />
                <input
                  className={INPUT_CLASS}
                  placeholder={t("meetings.fields.attendeeContact")}
                  {...register(`attendees.${index}.contact` as const)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={t("meetings.form.removeAttendee")}
                  onClick={() => remove(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", contact: "" })}
            >
              {t("meetings.form.addAttendee")}
            </Button>
          </div>

          <Field label={t("meetings.fields.notes")}>
            <textarea
              className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              {...register("notes")}
            />
          </Field>

          {submitFailed && <p className="text-sm text-danger">{t("meetings.errors.save")}</p>}

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
