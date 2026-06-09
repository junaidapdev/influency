-- Payments hardening (chunk 04 review fixes). Additive — the table/RLS/RPC from
-- 20260609150000 are already applied.

-- 1) Insert/update must reference a deal OWNED BY THE CALLER. Previously the policies only
--    checked the row's user_id, so a direct REST write could attach the caller's user_id to a
--    payment whose deal_id points at another tenant's deal (a cross-tenant FK reference).
DROP POLICY IF EXISTS "payments_insert_own" ON payments;
CREATE POLICY "payments_insert_own"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM ad_deals d
      WHERE d.id = deal_id AND d.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "payments_update_own" ON payments;
CREATE POLICY "payments_update_own"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM ad_deals d
      WHERE d.id = deal_id AND d.user_id = (SELECT auth.uid())
    )
  );

-- 2) Make the atomic RPC the ONLY way to mutate a payment. Revoke direct client UPDATE, and make
--    the RPC SECURITY DEFINER so it can still write. The function keeps explicit
--    user_id = auth.uid() filters, so running as definer (which bypasses RLS) stays tenant-safe;
--    search_path is locked and table references are schema-qualified (SECURITY DEFINER hardening).
REVOKE UPDATE ON payments FROM authenticated;

CREATE OR REPLACE FUNCTION mark_payment_received(p_payment_id UUID, p_received_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := (SELECT auth.uid());
  v_deal_id UUID;
  v_remaining INT;
  v_deal_paid BOOLEAN := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  SELECT deal_id INTO v_deal_id
  FROM public.payments
  WHERE id = p_payment_id AND user_id = v_uid;

  IF v_deal_id IS NULL THEN
    RAISE EXCEPTION 'PAYMENT_NOT_FOUND';
  END IF;

  UPDATE public.payments
  SET status = 'received', received_date = p_received_date
  WHERE id = p_payment_id AND user_id = v_uid;

  SELECT count(*) INTO v_remaining
  FROM public.payments
  WHERE deal_id = v_deal_id AND user_id = v_uid AND status <> 'received';

  IF v_remaining = 0 THEN
    UPDATE public.ad_deals
    SET status = 'paid', updated_at = now()
    WHERE id = v_deal_id AND user_id = v_uid;
    v_deal_paid := true;
  END IF;

  RETURN jsonb_build_object('deal_id', v_deal_id, 'deal_paid', v_deal_paid);
END;
$$;

GRANT EXECUTE ON FUNCTION mark_payment_received(UUID, DATE) TO authenticated;
