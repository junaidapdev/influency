CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep every read scoped to the owner and fast.
CREATE INDEX brands_user_id_idx ON brands (user_id);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_select_own"
  ON brands
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "brands_insert_own"
  ON brands
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "brands_update_own"
  ON brands
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "brands_delete_own"
  ON brands
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON brands TO authenticated;
