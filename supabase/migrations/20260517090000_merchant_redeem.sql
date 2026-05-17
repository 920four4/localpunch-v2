-- Merchant-verified redemption.
--
-- Replaces the old customer self-serve redeem path (a customer could mark
-- their own reward redeemed from their phone with no staff involved). A
-- reward can now only be redeemed by the merchant who owns the program,
-- via the merchant Redeem scanner.
--
--   redeem_card_for_merchant(p_card_id, p_merchant_id, p_notes)
--
-- Service-role only; the API layer authenticates the merchant's cookie
-- session and passes their user id. Ownership + active subscription +
-- card completeness are all enforced here. Records who approved it
-- (redemptions.approved_by) and resets the card so the loyalty loop
-- continues (buy 10, get 1 free, then start over).

CREATE OR REPLACE FUNCTION redeem_card_for_merchant(
  p_card_id     UUID,
  p_merchant_id UUID,
  p_notes       TEXT DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card       punch_cards%ROWTYPE;
  v_program    loyalty_programs%ROWTYPE;
  v_business   businesses%ROWTYPE;
  v_profile    profiles%ROWTYPE;
  v_redemption UUID;
BEGIN
  IF p_card_id IS NULL OR p_merchant_id IS NULL THEN
    RETURN jsonb_build_object('error', 'card_id and merchant_id required');
  END IF;

  -- Lock the card row so two concurrent scans can't both redeem it.
  SELECT * INTO v_card FROM punch_cards WHERE id = p_card_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Card not found');
  END IF;

  SELECT * INTO v_program FROM loyalty_programs WHERE id = v_card.program_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Program not found');
  END IF;

  SELECT * INTO v_business FROM businesses WHERE id = v_program.business_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Business not found');
  END IF;

  IF v_business.owner_id <> p_merchant_id THEN
    RETURN jsonb_build_object('error', 'This card belongs to a different shop');
  END IF;

  IF NOT v_business.is_active THEN
    RETURN jsonb_build_object('error', 'Your shop isn''t active');
  END IF;

  IF NOT v_card.is_complete THEN
    RETURN jsonb_build_object(
      'error', 'Card isn''t complete yet — nothing to redeem'
    );
  END IF;

  INSERT INTO redemptions (card_id, approved_by, notes)
  VALUES (v_card.id, p_merchant_id, p_notes)
  RETURNING id INTO v_redemption;

  -- Reset so the customer can start earning the next reward.
  UPDATE punch_cards
  SET punch_count = 0, is_complete = FALSE
  WHERE id = v_card.id;

  SELECT * INTO v_profile FROM profiles WHERE id = v_card.customer_id;

  RETURN jsonb_build_object(
    'success',       TRUE,
    'redemption_id', v_redemption,
    'customer_name', COALESCE(v_profile.display_name, 'Customer'),
    'program_name',  v_program.name,
    'reward',        v_program.reward_description,
    'business_name', v_business.name
  );
END;
$$;

REVOKE ALL ON FUNCTION redeem_card_for_merchant(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION redeem_card_for_merchant(UUID, UUID, TEXT)
  TO service_role;
