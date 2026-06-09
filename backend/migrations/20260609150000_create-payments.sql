CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES ad_deals(id) ON DELETE CASCADE,
  amount_sar NUMERIC NOT NULL CHECK (amount_sar >= 0),
  expected_date DATE,
  received_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue')),
  method TEXT CHECK (method IN ('bank', 'cash', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Powers the Pending/Received tabs (owner + status + expected date) without a scan.
CREATE INDEX payments_user_status_expected_idx ON payments (user_id, status, expected_date);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own"
  ON payments
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "payments_insert_own"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "payments_update_own"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "payments_delete_own"
  ON payments
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;

-- Atomic mark-received: in ONE transaction (a single plpgsql function), set the payment received
-- and, if every payment for its deal is now received, flip the deal to 'paid'. Either both
-- changes commit or neither does — the bug this pattern prevents is a payment marked received
-- while the deal is left un-paid because a second, separate write failed.
--
-- SECURITY INVOKER (default): runs as the caller, so auth.uid() is the signed-in user and RLS
-- applies; the explicit user_id = auth.uid() filters are defense in depth (no IDOR).
CREATE OR REPLACE FUNCTION mark_payment_received(p_payment_id UUID, p_received_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_uid UUID := (SELECT auth.uid());
  v_deal_id UUID;
  v_remaining INT;
  v_deal_paid BOOLEAN := false;
BEGIN
  SELECT deal_id INTO v_deal_id
  FROM payments
  WHERE id = p_payment_id AND user_id = v_uid;

  IF v_deal_id IS NULL THEN
    RAISE EXCEPTION 'PAYMENT_NOT_FOUND';
  END IF;

  UPDATE payments
  SET status = 'received', received_date = p_received_date
  WHERE id = p_payment_id AND user_id = v_uid;

  SELECT count(*) INTO v_remaining
  FROM payments
  WHERE deal_id = v_deal_id AND user_id = v_uid AND status <> 'received';

  IF v_remaining = 0 THEN
    UPDATE ad_deals
    SET status = 'paid', updated_at = NOW()
    WHERE id = v_deal_id AND user_id = v_uid;
    v_deal_paid := true;
  END IF;

  RETURN jsonb_build_object('deal_id', v_deal_id, 'deal_paid', v_deal_paid);
END;
$$;

GRANT EXECUTE ON FUNCTION mark_payment_received(UUID, DATE) TO authenticated;
