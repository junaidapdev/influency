CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES ad_deals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location_or_link TEXT,
  attendees JSONB,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'done', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX meetings_user_scheduled_idx ON meetings (user_id, scheduled_at);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_select_own"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Insert/update also require any linked brand/deal to be owned by the caller (no cross-tenant FK).
CREATE POLICY "meetings_insert_own"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      brand_id IS NULL
      OR EXISTS (SELECT 1 FROM brands b WHERE b.id = brand_id AND b.user_id = (SELECT auth.uid()))
    )
    AND (
      deal_id IS NULL
      OR EXISTS (SELECT 1 FROM ad_deals d WHERE d.id = deal_id AND d.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "meetings_update_own"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      brand_id IS NULL
      OR EXISTS (SELECT 1 FROM brands b WHERE b.id = brand_id AND b.user_id = (SELECT auth.uid()))
    )
    AND (
      deal_id IS NULL
      OR EXISTS (SELECT 1 FROM ad_deals d WHERE d.id = deal_id AND d.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "meetings_delete_own"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON meetings TO authenticated;
