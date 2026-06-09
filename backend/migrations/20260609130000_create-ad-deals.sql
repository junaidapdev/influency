CREATE TABLE ad_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  deliverables JSONB NOT NULL,
  agreed_amount_sar NUMERIC NOT NULL,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'posted', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Powers the /deals list filters (owner + status + deadline) without a table scan.
CREATE INDEX ad_deals_user_status_deadline_idx ON ad_deals (user_id, status, deadline);

ALTER TABLE ad_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_deals_select_own"
  ON ad_deals
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "ad_deals_insert_own"
  ON ad_deals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "ad_deals_update_own"
  ON ad_deals
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "ad_deals_delete_own"
  ON ad_deals
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON ad_deals TO authenticated;
