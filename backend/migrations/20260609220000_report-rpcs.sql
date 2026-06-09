-- Reporting rollups (read-only, STABLE, SECURITY INVOKER + explicit user_id filter so RLS applies
-- and only the caller's rows are aggregated). Same no-N+1 discipline as the chunk-05 dashboard RPC.
-- Month basis matches chunk 05: deals invoiced by created_at, payments collected by received_date.

-- A) Invoiced vs collected per month for the last 12 months (zero-filled).
CREATE OR REPLACE FUNCTION report_monthly()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH months AS (
    SELECT to_char(date_trunc('month', now()) - (offset_n || ' months')::interval, 'YYYY-MM') AS month
    FROM generate_series(0, 11) AS offset_n
  ),
  inv AS (
    SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, sum(agreed_amount_sar) AS invoiced
    FROM public.ad_deals
    WHERE user_id = (SELECT auth.uid())
      AND created_at >= date_trunc('month', now()) - interval '11 months'
    GROUP BY 1
  ),
  col AS (
    SELECT to_char(date_trunc('month', received_date), 'YYYY-MM') AS month, sum(amount_sar) AS collected
    FROM public.payments
    WHERE user_id = (SELECT auth.uid()) AND status = 'received' AND received_date IS NOT NULL
      AND received_date >= (date_trunc('month', now()) - interval '11 months')::date
    GROUP BY 1
  )
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'month', months.month,
        'invoiced', coalesce(inv.invoiced, 0),
        'collected', coalesce(col.collected, 0)
      )
      ORDER BY months.month
    ),
    '[]'::jsonb
  )
  FROM months
  LEFT JOIN inv ON inv.month = months.month
  LEFT JOIN col ON col.month = months.month;
$$;

GRANT EXECUTE ON FUNCTION report_monthly() TO authenticated;

-- B) Per brand × month: deal count, invoiced total, collected total (collection rate is derived
-- client-side with a divide-by-zero guard). Last 12 months.
CREATE OR REPLACE FUNCTION report_by_brand()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH deal_agg AS (
    SELECT d.brand_id,
           to_char(date_trunc('month', d.created_at), 'YYYY-MM') AS month,
           count(*) AS deal_count,
           sum(d.agreed_amount_sar) AS invoiced
    FROM public.ad_deals d
    WHERE d.user_id = (SELECT auth.uid())
      AND d.created_at >= date_trunc('month', now()) - interval '11 months'
    GROUP BY d.brand_id, 2
  ),
  col_agg AS (
    SELECT d.brand_id,
           to_char(date_trunc('month', p.received_date), 'YYYY-MM') AS month,
           sum(p.amount_sar) AS collected
    FROM public.payments p
    JOIN public.ad_deals d ON d.id = p.deal_id
    WHERE p.user_id = (SELECT auth.uid()) AND p.status = 'received' AND p.received_date IS NOT NULL
      AND p.received_date >= (date_trunc('month', now()) - interval '11 months')::date
    GROUP BY d.brand_id, 2
  )
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'brand_id', da.brand_id,
        'name_en', b.name_en,
        'name_ar', b.name_ar,
        'month', da.month,
        'deal_count', da.deal_count,
        'invoiced', da.invoiced,
        'collected', coalesce(ca.collected, 0)
      )
      ORDER BY b.name_en, da.month
    ),
    '[]'::jsonb
  )
  FROM deal_agg da
  JOIN public.brands b ON b.id = da.brand_id
  LEFT JOIN col_agg ca ON ca.brand_id = da.brand_id AND ca.month = da.month;
$$;

GRANT EXECUTE ON FUNCTION report_by_brand() TO authenticated;
