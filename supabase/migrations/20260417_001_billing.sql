-- Billing: add Stripe subscription fields to businesses
-- New shops default to is_active = FALSE. They become active when a
-- successful Stripe subscription webhook fires. Existing rows keep their
-- current is_active value (grandfathered — your test data stays active).

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT
    CHECK (subscription_status IN (
      'incomplete', 'incomplete_expired', 'trialing', 'active',
      'past_due', 'canceled', 'unpaid', 'paused'
    )),
  ADD COLUMN IF NOT EXISTS plan_interval          TEXT
    CHECK (plan_interval IN ('month', 'year')),
  ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE;

-- New businesses must activate via payment.
ALTER TABLE businesses ALTER COLUMN is_active SET DEFAULT FALSE;

-- Fast lookup by Stripe IDs (webhook needs this)
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_stripe_customer
  ON businesses(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_stripe_subscription
  ON businesses(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
