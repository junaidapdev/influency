import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { EMPTY_DEAL_FILTERS } from "@/constants/deals";
import { type Locale } from "@/constants/i18n";
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const now = new Date();
  const [view, setView] = useState<MeetingView>(MEETING_VIEW.CALENDAR);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), monthIndex: now.getMonth() });
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const { meetingsQuery, createMutation, updateMutation, cancelMutation } = useMeetings();
  const { brandsQuery } = useBrands();
  const { dealsQuery } = useDeals(EMPTY_DEAL_FILTERS);

  const meetings = meetingsQuery.data ?? [];
  const brands = useMemo(() => brandsQuery.data ?? [], [brandsQuery.data]);
  const deals = dealsQuery.data ?? [];
  const isMutating = updateMutation.isPending || cancelMutation.isPending;

  const brandNameById = useMemo(() => {
    const record: Record<string, string> = {};
    for (const brand of brands) {
      record[brand.id] = locale === "ar" ? brand.name_ar : brand.name_en;
    }
    return record;
  }, [brands, locale]);

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

  return (
    <section className="space-y-4">
      <AppHeader
        eyebrow={t("meetings.subtitle")}
        title={t("meetings.title")}
        action={
          <Button size="sm" onClick={() => setDialog({ open: true, meeting: null })}>
            {t("meetings.addAction")}
          </Button>
        }
      />

      <SegmentedTabs
        options={[
          { value: MEETING_VIEW.LIST, label: t("meetings.views.list") },
          { value: MEETING_VIEW.CALENDAR, label: t("meetings.views.calendar") },
        ]}
        value={view}
        onChange={setView}
      />

      {meetingsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-24 rounded-md bg-muted" />
          <div className="h-24 rounded-md bg-muted" />
        </div>
      ) : meetingsQuery.isError ? (
        <p className="text-sm text-danger">{t("meetings.errors.load")}</p>
      ) : meetings.length === 0 ? (
        <MeetingsEmptyState onAdd={() => setDialog({ open: true, meeting: null })} />
      ) : view === MEETING_VIEW.CALENDAR ? (
        <MeetingCalendar
          key={`${cursor.year}-${cursor.monthIndex}`}
          meetings={meetings}
          brandNameById={brandNameById}
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
