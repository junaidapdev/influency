-- Read-only rollup for the dashboard top-line. ONE round-trip of server-side aggregates
-- (no N+1, no pulling every row to the client). SECURITY INVOKER + the explicit
-- user_id = auth.uid() filters mean RLS applies and only the caller's rows are summed.
--
-- Month basis: deals by created_at (invoiced + posted/pending counts), payments collected by
-- received_date. outstanding = invoiced - collected (per the spec's definition).
CREATE OR REPLACE FUNCTION dashboard_summary()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'invoiced', d.invoiced,
    'collected', p.collected,
    'outstanding', d.invoiced - p.collected,
    'deals_posted', d.deals_posted,
    'deals_pending', d.deals_pending
  )
  FROM
    (
      SELECT
        COALESCE(SUM(agreed_amount_sar), 0) AS invoiced,
        COUNT(*) FILTER (WHERE status IN ('posted', 'paid')) AS deals_posted,
        COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')) AS deals_pending
      FROM public.ad_deals
      WHERE user_id = (SELECT auth.uid())
        AND created_at >= date_trunc('month', now())
        AND created_at < date_trunc('month', now()) + interval '1 month'
    ) d,
    (
      SELECT COALESCE(SUM(amount_sar), 0) AS collected
      FROM public.payments
      WHERE user_id = (SELECT auth.uid())
        AND status = 'received'
        AND received_date >= (date_trunc('month', now()))::date
        AND received_date < (date_trunc('month', now()) + interval '1 month')::date
    ) p;
$$;

GRANT EXECUTE ON FUNCTION dashboard_summary() TO authenticated;
