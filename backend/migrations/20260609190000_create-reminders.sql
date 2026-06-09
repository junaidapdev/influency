-- Reminders are created in application code (never a Postgres trigger), so this migration adds
-- NO trigger. ref_id/ref_table are a polymorphic pointer (meetings | payments | ad_deals) — text,
-- not a FK — so there is no cross-table FK to enforce here; RLS still isolates rows by user_id.
-- channel + is_sent_at exist now so the v2 WhatsApp delivery cron is purely additive.
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('meeting', 'payment', 'deliverable', 'custom')),
  ref_id TEXT,
  ref_table TEXT CHECK (ref_table IN ('meetings', 'payments', 'ad_deals')),
  due_at TIMESTAMPTZ NOT NULL,
  message_en TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'whatsapp')),
  is_done BOOLEAN NOT NULL DEFAULT false,
  is_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reminders_user_due_done_idx ON reminders (user_id, due_at, is_done);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_select_own"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "reminders_insert_own"
  ON reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "reminders_update_own"
  ON reminders
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "reminders_delete_own"
  ON reminders
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON reminders TO authenticated;
