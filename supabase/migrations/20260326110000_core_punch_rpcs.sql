-- Core punch/redeem RPCs.
--
-- PROVENANCE: these two functions powered the app since launch but were
-- never committed — they existed only in the live database (out-of-band
-- changes that the migration-history table never recorded). Captured here
-- verbatim from production on 2026-05-17 so a fresh `supabase db reset`
-- rebuilds a faithful schema. See review gap #2.
--
--   record_punch(p_program_id, p_token_hash)
--     Scanned/guest punch. Called by /api/punch and /scan. Customer is
--     auth.uid(); enforces token single-use + one-punch-per-day unique index.
--
--   redeem_card(p_card_id, p_notes)
--     DEPRECATED / customer self-serve — superseded by
--     redeem_card_for_merchant (see 20260517090000_merchant_redeem.sql),
--     which requires the owning merchant and sets redemptions.approved_by.
--     Kept here only so the committed schema matches what shipped; the app
--     no longer calls it (the /api/redeem route was removed).

-- ── record_punch ──────────────────────────────────────────────────────
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
  v_user_id UUID := auth.uid();
  v_card    punch_cards%ROWTYPE;
  v_program loyalty_programs%ROWTYPE;
  v_new_count INT;
  v_complete BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  -- Check token not already used
  IF EXISTS (SELECT 1 FROM punches WHERE token_hash = p_token_hash) THEN
    RETURN jsonb_build_object('error', 'QR code already used');
  END IF;

  -- Get program
  SELECT * INTO v_program FROM loyalty_programs WHERE id = p_program_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Program not found or inactive');
  END IF;

  -- Get or create punch card
  INSERT INTO punch_cards (customer_id, program_id)
  VALUES (v_user_id, p_program_id)
  ON CONFLICT (customer_id, program_id) DO NOTHING;

  SELECT * INTO v_card FROM punch_cards
  WHERE customer_id = v_user_id AND program_id = p_program_id;

  IF v_card.is_complete THEN
    RETURN jsonb_build_object('error', 'Card already complete — redeem your reward!');
  END IF;

  -- Insert punch (daily limit via unique index)
  BEGIN
    INSERT INTO punches (card_id, token_hash) VALUES (v_card.id, p_token_hash);
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object('error', 'Already punched today for this program');
  END;

  -- Update punch count
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

-- ── redeem_card (DEPRECATED — see header) ─────────────────────────────
CREATE OR REPLACE FUNCTION public.redeem_card(
  p_card_id uuid,
  p_notes text DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_card    punch_cards%ROWTYPE;
  v_redemption_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO v_card FROM punch_cards WHERE id = p_card_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Card not found');
  END IF;

  IF v_card.customer_id <> v_user_id THEN
    RETURN jsonb_build_object('error', 'Not your card');
  END IF;

  IF NOT v_card.is_complete THEN
    RETURN jsonb_build_object('error', 'Card not complete yet');
  END IF;

  INSERT INTO redemptions (card_id, notes)
  VALUES (p_card_id, p_notes)
  RETURNING id INTO v_redemption_id;

  UPDATE punch_cards SET punch_count = 0, is_complete = FALSE WHERE id = p_card_id;

  RETURN jsonb_build_object('success', TRUE, 'redemption_id', v_redemption_id);
END;
$function$;
