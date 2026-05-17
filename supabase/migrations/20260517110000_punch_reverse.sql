-- Merchant punch reversal (mistake correction).
--
-- No way previously to undo a wrong-program / accidental-double punch.
-- reverse_last_punch removes the most recent punch on a card, but only
-- punches in the *current* (not-yet-redeemed) cycle, and only for the
-- merchant who owns the program. Recomputes is_complete.
--
--   reverse_last_punch(p_card_id, p_merchant_id)
-- Service-role only; API authenticates the merchant and passes user id.

CREATE OR REPLACE FUNCTION reverse_last_punch(
  p_card_id     UUID,
  p_merchant_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card       punch_cards%ROWTYPE;
  v_program    loyalty_programs%ROWTYPE;
  v_business   businesses%ROWTYPE;
  v_punch_id   UUID;
  v_punch_at   TIMESTAMPTZ;
  v_last_redeem TIMESTAMPTZ;
  v_new_count  INT;
BEGIN
  IF p_card_id IS NULL OR p_merchant_id IS NULL THEN
    RETURN jsonb_build_object('error', 'card_id and merchant_id required');
  END IF;

  SELECT * INTO v_card FROM punch_cards WHERE id = p_card_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Card not found');
  END IF;

  SELECT * INTO v_program FROM loyalty_programs WHERE id = v_card.program_id;
  SELECT * INTO v_business FROM businesses WHERE id = v_program.business_id;
  IF v_business.owner_id <> p_merchant_id THEN
    RETURN jsonb_build_object('error', 'This card belongs to a different shop');
  END IF;

  -- Most recent punch on the card.
  SELECT id, punched_at INTO v_punch_id, v_punch_at
  FROM punches WHERE card_id = v_card.id
  ORDER BY punched_at DESC LIMIT 1;

  IF v_punch_id IS NULL THEN
    RETURN jsonb_build_object('error', 'No punches to undo');
  END IF;

  -- Don't reach back across a redemption boundary.
  SELECT MAX(redeemed_at) INTO v_last_redeem
  FROM redemptions WHERE card_id = v_card.id;
  IF v_last_redeem IS NOT NULL AND v_punch_at <= v_last_redeem THEN
    RETURN jsonb_build_object(
      'error', 'Nothing to undo — the last punch was already part of a redeemed reward'
    );
  END IF;

  DELETE FROM punches WHERE id = v_punch_id;

  v_new_count := GREATEST(0, v_card.punch_count - 1);

  UPDATE punch_cards
  SET punch_count = v_new_count,
      is_complete = (v_new_count >= v_program.punches_required)
  WHERE id = v_card.id;

  RETURN jsonb_build_object(
    'success',          TRUE,
    'punch_count',      v_new_count,
    'punches_required', v_program.punches_required,
    'is_complete',      (v_new_count >= v_program.punches_required)
  );
END;
$$;

REVOKE ALL ON FUNCTION reverse_last_punch(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reverse_last_punch(UUID, UUID) TO service_role;
