-- Replace the once-per-UTC-day punch rule with a per-program cooldown.
--
-- The old anti-abuse guard was a unique index on
-- (card_id, DATE(punched_at AT TIME ZONE 'UTC')). It rolled over at UTC
-- midnight (≈4–5pm US Pacific) so an evening regular's two legitimate
-- visits could collide, and a twice-a-day regular or a "double punch"
-- promo was impossible.
--
-- New model: each program has punch_cooldown_hours (default 12). A card
-- can't be punched again until that many hours after its last punch.
-- 0 = no cooldown. Merchant Quick Punch can override (they're present and
-- decide). QR-token single-use replay protection is unchanged.

ALTER TABLE loyalty_programs
  ADD COLUMN IF NOT EXISTS punch_cooldown_hours INT NOT NULL DEFAULT 12
  CHECK (punch_cooldown_hours BETWEEN 0 AND 168);

DROP INDEX IF EXISTS idx_punches_daily_limit;

-- ── record_punch (scanned/guest) ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_punch(
  p_program_id uuid,
  p_token_hash text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id   UUID := auth.uid();
  v_card      punch_cards%ROWTYPE;
  v_program   loyalty_programs%ROWTYPE;
  v_last_at   TIMESTAMPTZ;
  v_new_count INT;
  v_complete  BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM punches WHERE token_hash = p_token_hash) THEN
    RETURN jsonb_build_object('error', 'QR code already used');
  END IF;

  SELECT * INTO v_program FROM loyalty_programs
  WHERE id = p_program_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Program not found or inactive');
  END IF;

  INSERT INTO punch_cards (customer_id, program_id)
  VALUES (v_user_id, p_program_id)
  ON CONFLICT (customer_id, program_id) DO NOTHING;

  SELECT * INTO v_card FROM punch_cards
  WHERE customer_id = v_user_id AND program_id = p_program_id
  FOR UPDATE;

  IF v_card.is_complete THEN
    RETURN jsonb_build_object('error', 'Card already complete — redeem your reward!');
  END IF;

  -- Cooldown: block if the last punch is too recent.
  IF v_program.punch_cooldown_hours > 0 THEN
    SELECT MAX(punched_at) INTO v_last_at FROM punches WHERE card_id = v_card.id;
    IF v_last_at IS NOT NULL
       AND v_last_at > NOW() - make_interval(hours => v_program.punch_cooldown_hours)
    THEN
      RETURN jsonb_build_object(
        'error', 'cooldown',
        'message', 'You already collected a punch here recently — come back later!'
      );
    END IF;
  END IF;

  INSERT INTO punches (card_id, token_hash) VALUES (v_card.id, p_token_hash);

  v_new_count := v_card.punch_count + 1;
  v_complete  := v_new_count >= v_program.punches_required;

  UPDATE punch_cards
  SET punch_count = v_new_count, is_complete = v_complete
  WHERE id = v_card.id;

  RETURN jsonb_build_object(
    'success',          TRUE,
    'punch_count',      v_new_count,
    'punches_required', v_program.punches_required,
    'is_complete',      v_complete
  );
END;
$function$;

-- ── record_punch_for_customer (merchant manual; p_override skips cooldown)
-- Drop the old 3-arg version so the new signature replaces it cleanly
-- (different arity would otherwise create an ambiguous overload).
DROP FUNCTION IF EXISTS record_punch_for_customer(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION record_punch_for_customer(
  p_customer_id UUID,
  p_program_id UUID,
  p_source TEXT DEFAULT 'manual',
  p_override BOOLEAN DEFAULT FALSE
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card        punch_cards%ROWTYPE;
  v_program     loyalty_programs%ROWTYPE;
  v_last_at     TIMESTAMPTZ;
  v_new_count   INT;
  v_complete    BOOLEAN;
  v_token_hash  TEXT := encode(
    sha256((p_source || ':' || gen_random_uuid()::text)::bytea),
    'hex'
  );
BEGIN
  IF p_customer_id IS NULL THEN
    RETURN jsonb_build_object('error', 'customer_id required');
  END IF;

  SELECT * INTO v_program FROM loyalty_programs
  WHERE id = p_program_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Program not found or inactive');
  END IF;

  INSERT INTO punch_cards (customer_id, program_id)
  VALUES (p_customer_id, p_program_id)
  ON CONFLICT (customer_id, program_id) DO NOTHING;

  SELECT * INTO v_card FROM punch_cards
  WHERE customer_id = p_customer_id AND program_id = p_program_id
  FOR UPDATE;

  IF v_card.is_complete THEN
    RETURN jsonb_build_object('error', 'Card already complete — redeem your reward!');
  END IF;

  IF NOT p_override AND v_program.punch_cooldown_hours > 0 THEN
    SELECT MAX(punched_at) INTO v_last_at FROM punches WHERE card_id = v_card.id;
    IF v_last_at IS NOT NULL
       AND v_last_at > NOW() - make_interval(hours => v_program.punch_cooldown_hours)
    THEN
      RETURN jsonb_build_object(
        'error', 'cooldown',
        'message', 'This customer was punched here recently.'
      );
    END IF;
  END IF;

  INSERT INTO punches (card_id, token_hash) VALUES (v_card.id, v_token_hash);

  v_new_count := v_card.punch_count + 1;
  v_complete  := v_new_count >= v_program.punches_required;

  UPDATE punch_cards
  SET punch_count = v_new_count, is_complete = v_complete
  WHERE id = v_card.id;

  RETURN jsonb_build_object(
    'success',          TRUE,
    'punch_count',      v_new_count,
    'punches_required', v_program.punches_required,
    'is_complete',      v_complete,
    'card_id',          v_card.id
  );
END;
$$;

REVOKE ALL ON FUNCTION record_punch_for_customer(UUID, UUID, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_punch_for_customer(UUID, UUID, TEXT, BOOLEAN) TO service_role;
