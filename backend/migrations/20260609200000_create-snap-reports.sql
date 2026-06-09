CREATE TABLE snap_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES ad_deals(id) ON DELETE SET NULL,
  report_date DATE,
  source_file_url TEXT,
  views INTEGER,
  reach INTEGER,
  story_views INTEGER,
  screenshot_count INTEGER,
  swipe_ups INTEGER,
  raw_ai_json JSONB,
  extraction_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (extraction_status IN ('pending', 'extracted', 'failed', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Powers the per-user list + the rate-limit count (this user's reports in the last hour).
CREATE INDEX snap_reports_user_created_idx ON snap_reports (user_id, created_at);

ALTER TABLE snap_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snap_reports_select_own"
  ON snap_reports
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "snap_reports_insert_own"
  ON snap_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      deal_id IS NULL
      OR EXISTS (SELECT 1 FROM ad_deals d WHERE d.id = deal_id AND d.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "snap_reports_update_own"
  ON snap_reports
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      deal_id IS NULL
      OR EXISTS (SELECT 1 FROM ad_deals d WHERE d.id = deal_id AND d.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "snap_reports_delete_own"
  ON snap_reports
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON snap_reports TO authenticated;

-- Realtime: the extract-snap-report edge function UPDATEs the row; this trigger publishes a
-- lightweight notification to the owner's channel so the UI updates without polling. The trigger
-- is transport only (no business logic). Payload carries no metrics — just id + status.
INSERT INTO realtime.channels (pattern, description, enabled)
VALUES ('snap:%', 'Snap report extraction updates (per user)', true);

CREATE OR REPLACE FUNCTION snap_reports_realtime()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.publish(
    'snap:' || NEW.user_id::text,
    'snap_updated',
    jsonb_build_object('id', NEW.id, 'status', NEW.extraction_status)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER snap_reports_realtime_trg
  AFTER UPDATE ON snap_reports
  FOR EACH ROW
  EXECUTE FUNCTION snap_reports_realtime();
