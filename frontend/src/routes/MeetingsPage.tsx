import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EMPTY_DEAL_FILTERS } from "@/constants/deals";
import { MEETING_VIEW, type MeetingView } from "@/constants/meetings";
import { useBrands } from "@/hooks/useBrands";
import { useDeals } from "@/hooks/useDeals";
import { useMeetings } from "@/hooks/useMeetings";
import { MeetingCalendar } from "@/features/meetings/components/MeetingCalendar";
import { MeetingFormDialog } from "@/features/meetings/components/MeetingFormDialog";
import { MeetingList } from "@/features/meetings/components/MeetingList";
import { MeetingsEmptyState } from "@/features/meetings/components/MeetingsEmptyState";
import { type Meeting, type MeetingFormValues } from "@/features/meetings/meeting.types";

type DialogState = { open: false } | { open: true; meeting: Meeting | null };

export function MeetingsPage() {
  const { t } = useTranslation();
  const now = new Date();
  const [view, setView] = useState<MeetingView>(MEETING_VIEW.CALENDAR);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), monthIndex: now.getMonth() });
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const { meetingsQuery, createMutation, updateMutation, cancelMutation } = useMeetings();
  const { brandsQuery } = useBrands();
  const { dealsQuery } = useDeals(EMPTY_DEAL_FILTERS);

  const meetings = meetingsQuery.data ?? [];
  const brands = brandsQuery.data ?? [];
  const deals = dealsQuery.data ?? [];
  const isMutating = updateMutation.isPending || cancelMutation.isPending;

  function prevMonth() {
    setCursor((c) =>
      c.monthIndex === 0 ? { year: c.year - 1, monthIndex: 11 } : { year: c.year, monthIndex: c.monthIndex - 1 },
    );
  }

  function nextMonth() {
    setCursor((c) =>
      c.monthIndex === 11 ? { year: c.year + 1, monthIndex: 0 } : { year: c.year, monthIndex: c.monthIndex + 1 },
    );
  }

  async function handleSubmit(values: MeetingFormValues) {
    if (dialog.open && dialog.meeting) {
      await updateMutation.mutateAsync({ id: dialog.meeting.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  function tabClass(value: MeetingView): string {
    return value === view
      ? "border-b-2 border-foreground pb-2 text-sm font-medium"
      : "pb-2 text-sm text-muted-foreground";
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("meetings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("meetings.subtitle")}</p>
        </div>
        <Button onClick={() => setDialog({ open: true, meeting: null })}>
          {t("meetings.addAction")}
        </Button>
      </div>

      <div className="flex gap-6 border-b">
        <button type="button" className={tabClass(MEETING_VIEW.CALENDAR)} onClick={() => setView(MEETING_VIEW.CALENDAR)}>
          {t("meetings.views.calendar")}
        </button>
        <button type="button" className={tabClass(MEETING_VIEW.LIST)} onClick={() => setView(MEETING_VIEW.LIST)}>
          {t("meetings.views.list")}
        </button>
      </div>

      {meetingsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-24 rounded-md bg-muted" />
          <div className="h-24 rounded-md bg-muted" />
        </div>
      ) : meetingsQuery.isError ? (
        <p className="text-sm text-red-600">{t("meetings.errors.load")}</p>
      ) : meetings.length === 0 ? (
        <MeetingsEmptyState onAdd={() => setDialog({ open: true, meeting: null })} />
      ) : view === MEETING_VIEW.CALENDAR ? (
        <MeetingCalendar
          meetings={meetings}
          year={cursor.year}
          monthIndex={cursor.monthIndex}
          onPrev={prevMonth}
          onNext={nextMonth}
          onSelect={(meeting) => setDialog({ open: true, meeting })}
        />
      ) : (
        <MeetingList
          meetings={meetings}
          onEdit={(meeting) => setDialog({ open: true, meeting })}
          onCancel={(meeting) => cancelMutation.mutate(meeting.id)}
          isMutating={isMutating}
        />
      )}

      {dialog.open && (
        <MeetingFormDialog
          key={dialog.meeting?.id ?? "new"}
          meeting={dialog.meeting}
          brands={brands}
          deals={deals}
          onClose={() => setDialog({ open: false })}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
