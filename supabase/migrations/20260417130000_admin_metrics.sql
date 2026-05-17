-- Admin panel metrics
-- Replaces platform_stats with a richer view that surfaces billing state and
-- recent growth. Also adds admin_recent_signups for the activity feed.

DROP VIEW IF EXISTS platform_stats;

CREATE OR REPLACE VIEW platform_stats AS
SELECT
  -- Business counts
  (SELECT COUNT(*) FROM businesses)                                   AS total_businesses,
  (SELECT COUNT(*) FROM businesses WHERE is_active)                   AS active_businesses,
  (SELECT COUNT(*) FROM businesses
    WHERE subscription_status = 'active')                             AS paid_merchants,
  (SELECT COUNT(*) FROM businesses
    WHERE subscription_status = 'trialing')                           AS trialing_merchants,
  (SELECT COUNT(*) FROM businesses
    WHERE subscription_status = 'past_due')                           AS past_due_merchants,
  (SELECT COUNT(*) FROM businesses
    WHERE subscription_status = 'canceled')                           AS canceled_merchants,
  (SELECT COUNT(*) FROM businesses
    WHERE subscription_status IS NULL AND is_active = FALSE)          AS unactivated_merchants,

  -- Monthly recurring revenue in cents. Yearly plans are normalized to a
  -- monthly rate ($600/yr → $50/mo equivalent). Only counts live statuses.
  (SELECT COALESCE(SUM(
     CASE
       WHEN plan_interval = 'month' THEN 6000
       WHEN plan_interval = 'year'  THEN 5000
       ELSE 0
     END
   ), 0)
   FROM businesses
   WHERE subscription_status IN ('active', 'trialing')
  )                                                                   AS mrr_cents,

  -- Customer + activity counts
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer')             AS total_customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'merchant')             AS total_merchants,
  (SELECT COUNT(*) FROM punches)                                      AS total_punches,
  (SELECT COUNT(*) FROM redemptions)                                  AS total_redemptions,

  -- Last-7-days growth
  (SELECT COUNT(*) FROM profiles
    WHERE role = 'customer' AND created_at > NOW() - INTERVAL '7 days'
  )                                                                   AS new_customers_7d,
  (SELECT COUNT(*) FROM businesses
    WHERE created_at > NOW() - INTERVAL '7 days'
  )                                                                   AS new_businesses_7d,
  (SELECT COUNT(*) FROM businesses
    WHERE subscription_status IN ('active', 'trialing')
      AND created_at > NOW() - INTERVAL '7 days'
  )                                                                   AS new_paid_7d;

COMMENT ON VIEW platform_stats IS
  'Aggregated platform metrics for the admin dashboard. mrr_cents normalizes yearly plans to a monthly rate.';


-- Unified recent signups feed (merchants + customers, most recent first).
-- Used by the admin overview activity panel.
CREATE OR REPLACE VIEW admin_recent_signups AS
SELECT
  p.id,
  p.role,
  p.display_name,
  p.phone,
  p.created_at,
  p.marketing_consent,
  b.id                   AS business_id,
  b.name                 AS business_name,
  b.slug                 AS business_slug,
  b.is_active            AS business_is_active,
  b.subscription_status,
  b.plan_interval,
  b.current_period_end
FROM profiles p
LEFT JOIN businesses b ON b.owner_id = p.id
ORDER BY p.created_at DESC;

COMMENT ON VIEW admin_recent_signups IS
  'All profiles joined with their primary business (if any), ordered by signup date.';
