-- Manual-punch support for merchants.
-- Adds two SECURITY DEFINER helpers that let the merchant attach a punch
-- to an existing customer by phone/email (no QR scan required).
--
--   record_punch_for_customer(p_customer_id, p_program_id, p_source)
--   find_customer_by_contact(p_phone, p_email)
--
-- Both are service-role only; the API layer enforces merchant ownership.

-- --- find_customer_by_contact ------------------------------------------
CREATE OR REPLACE FUNCTION find_customer_by_contact(
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_phone_digits TEXT;
BEGIN
  IF p_phone IS NOT NULL AND length(p_phone) > 0 THEN
    v_phone_digits := regexp_replace(p_phone, '[^0-9]', '', 'g');
    -- auth.users.phone stores digits only; +1 prefix is stripped.
    SELECT id INTO v_id FROM auth.users
    WHERE phone = v_phone_digits
       OR phone = right(v_phone_digits, 10)
       OR phone = '1' || right(v_phone_digits, 10)
    LIMIT 1;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END IF;

  IF p_email IS NOT NULL AND length(p_email) > 0 THEN
    SELECT id INTO v_id FROM auth.users
    WHERE lower(email) = lower(p_email)
    LIMIT 1;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION find_customer_by_contact(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION find_customer_by_contact(TEXT, TEXT) TO service_role;

-- --- record_punch_for_customer -----------------------------------------
-- Mirrors record_punch() but takes an explicit customer_id. Used when the
-- merchant punches manually (customer doesn't scan). Still enforces the
-- one-punch-per-card-per-day unique index.
CREATE OR REPLACE FUNCTION record_punch_for_customer(
  p_customer_id UUID,
  p_program_id UUID,
  p_source TEXT DEFAULT 'manual'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card        punch_cards%ROWTYPE;
  v_program     loyalty_programs%ROWTYPE;
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
  WHERE customer_id = p_customer_id AND program_id = p_program_id;

  IF v_card.is_complete THEN
    RETURN jsonb_build_object('error', 'Card already complete — redeem your reward!');
  END IF;

  BEGIN
    INSERT INTO punches (card_id, token_hash) VALUES (v_card.id, v_token_hash);
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object('error', 'Already punched today for this program');
  END;

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

REVOKE ALL ON FUNCTION record_punch_for_customer(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_punch_for_customer(UUID, UUID, TEXT) TO service_role;
