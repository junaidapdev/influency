-- Defense in depth for ad_deals: the client validates these (zod + the status machine), but
-- auto-REST lets an authenticated client write its own rows directly, so the invariants are also
-- enforced at the DB. Additive migration — the table from 20260609130000 is already applied.

-- 1) Deal amount cannot be negative (the form requires > 0; the DB blocks negatives).
ALTER TABLE ad_deals
  ADD CONSTRAINT ad_deals_amount_non_negative CHECK (agreed_amount_sar >= 0);

-- 2) status must equal the deliverables-driven value, except for the sticky/manual states
--    ('paid' is owned by the chunk-04 payment flow; 'cancelled' is a manual user action).
--    This mirrors features/deals/status.ts: that module is the app-side source of truth; this
--    function + CHECK is the DB-side guard so a client can't PATCH status past the machine
--    (e.g. mark a deal 'posted' without posting every deliverable).
CREATE OR REPLACE FUNCTION deal_status_from_deliverables(deliverables JSONB)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN jsonb_array_length(deliverables) > 0
      AND (
        SELECT count(*) FILTER (WHERE element ->> 'posted_at' IS NOT NULL)
        FROM jsonb_array_elements(deliverables) AS element
      ) = jsonb_array_length(deliverables)
    THEN 'posted'
    WHEN (
      SELECT count(*) FILTER (WHERE element ->> 'posted_at' IS NOT NULL)
      FROM jsonb_array_elements(deliverables) AS element
    ) >= 1
    THEN 'in_progress'
    ELSE 'pending'
  END
$$;

ALTER TABLE ad_deals
  ADD CONSTRAINT ad_deals_status_matches_deliverables
  CHECK (status IN ('paid', 'cancelled') OR status = deal_status_from_deliverables(deliverables));
