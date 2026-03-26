-- LocalPunch Database Schema
-- Migration: 20260326_001_initial

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'admin')),
  display_name TEXT,
  phone       TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  address     TEXT,
  lat         NUMERIC(10, 7),
  lng         NUMERIC(10, 7),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "businesses_select_active" ON businesses FOR SELECT USING (is_active = TRUE);
CREATE POLICY "businesses_owner_all" ON businesses FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "businesses_admin_all" ON businesses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- LOYALTY PROGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  punches_required    INT NOT NULL DEFAULT 10 CHECK (punches_required BETWEEN 1 AND 100),
  reward_description  TEXT NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_programs_business ON loyalty_programs(business_id);

ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER loyalty_programs_updated_at
  BEFORE UPDATE ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "programs_select_active" ON loyalty_programs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "programs_owner_all" ON loyalty_programs FOR ALL USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
);
CREATE POLICY "programs_admin_all" ON loyalty_programs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- PUNCH CARDS (customer x program)
-- ============================================================
CREATE TABLE IF NOT EXISTS punch_cards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id   UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  punch_count  INT NOT NULL DEFAULT 0,
  is_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, program_id)
);

CREATE INDEX idx_punch_cards_customer ON punch_cards(customer_id);
CREATE INDEX idx_punch_cards_program ON punch_cards(program_id);

ALTER TABLE punch_cards ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER punch_cards_updated_at
  BEFORE UPDATE ON punch_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "punch_cards_select_own" ON punch_cards FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "punch_cards_insert_own" ON punch_cards FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "punch_cards_update_own" ON punch_cards FOR UPDATE USING (auth.uid() = customer_id);
-- Merchants can view cards for their programs
CREATE POLICY "punch_cards_merchant_select" ON punch_cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM loyalty_programs lp
    JOIN businesses b ON b.id = lp.business_id
    WHERE lp.id = program_id AND b.owner_id = auth.uid()
  )
);
CREATE POLICY "punch_cards_admin_all" ON punch_cards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- PUNCHES (individual punch events)
-- ============================================================
CREATE TABLE IF NOT EXISTS punches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     UUID NOT NULL REFERENCES punch_cards(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE, -- prevents replay attacks
  punched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_punches_card ON punches(card_id);
CREATE INDEX idx_punches_token_hash ON punches(token_hash);
-- Rate limit: one punch per customer per program per day
CREATE UNIQUE INDEX idx_punches_daily_limit
  ON punches(card_id, DATE(punched_at AT TIME ZONE 'UTC'));

ALTER TABLE punches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "punches_select_own" ON punches FOR SELECT USING (
  EXISTS (SELECT 1 FROM punch_cards pc WHERE pc.id = card_id AND pc.customer_id = auth.uid())
);
CREATE POLICY "punches_service_insert" ON punches FOR INSERT WITH CHECK (TRUE); -- only via service role in API

-- ============================================================
-- REDEMPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS redemptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     UUID NOT NULL REFERENCES punch_cards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES profiles(id),
  notes       TEXT
);

CREATE INDEX idx_redemptions_card ON redemptions(card_id);

ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redemptions_select_own" ON redemptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM punch_cards pc WHERE pc.id = card_id AND pc.customer_id = auth.uid())
);
CREATE POLICY "redemptions_merchant_select" ON redemptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM punch_cards pc
    JOIN loyalty_programs lp ON lp.id = pc.program_id
    JOIN businesses b ON b.id = lp.business_id
    WHERE pc.id = card_id AND b.owner_id = auth.uid()
  )
);
CREATE POLICY "redemptions_service_insert" ON redemptions FOR INSERT WITH CHECK (TRUE); -- via service role

-- ============================================================
-- QR TOKENS (track generated tokens to detect reuse)
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  program_id  UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_tokens_business ON qr_tokens(business_id);
CREATE INDEX idx_qr_tokens_expires ON qr_tokens(expires_at);

ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qr_tokens_owner" ON qr_tokens FOR ALL USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
);

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Merchant dashboard stats view
CREATE OR REPLACE VIEW merchant_program_stats AS
SELECT
  lp.id AS program_id,
  lp.business_id,
  lp.name AS program_name,
  lp.punches_required,
  COUNT(DISTINCT pc.customer_id) AS total_customers,
  COUNT(p.id) AS total_punches,
  COUNT(r.id) AS total_redemptions,
  COUNT(CASE WHEN pc.is_complete THEN 1 END) AS completed_cards
FROM loyalty_programs lp
LEFT JOIN punch_cards pc ON pc.program_id = lp.id
LEFT JOIN punches p ON p.card_id = pc.id
LEFT JOIN redemptions r ON r.card_id = pc.id
GROUP BY lp.id, lp.business_id, lp.name, lp.punches_required;

-- Platform stats view (admin)
CREATE OR REPLACE VIEW platform_stats AS
SELECT
  (SELECT COUNT(*) FROM businesses WHERE is_active) AS total_businesses,
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') AS total_customers,
  (SELECT COUNT(*) FROM punches) AS total_punches,
  (SELECT COUNT(*) FROM redemptions) AS total_redemptions;

-- Auto-cleanup expired QR tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM qr_tokens WHERE expires_at < NOW() - INTERVAL '1 hour';
$$;
