-- Merchant onboarding drip (Resend cron) — when subscription first goes live.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS subscription_activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS merchant_drip_sent JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_businesses_drip_eligible
  ON businesses (subscription_activated_at)
  WHERE subscription_activated_at IS NOT NULL
    AND subscription_status IN ('active', 'trialing');
