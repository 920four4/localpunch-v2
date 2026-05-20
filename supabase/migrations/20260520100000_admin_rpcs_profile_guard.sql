-- Admin RPCs (missing from earlier migrations) + prevent self role escalation

-- Only allow customer -> merchant self-service; admins change roles via RPC
CREATE OR REPLACE FUNCTION profiles_role_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();

  IF caller_role = 'admin' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = NEW.id AND OLD.role = 'customer' AND NEW.role = 'merchant' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'role_change_not_allowed' USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_role_guard ON profiles;
CREATE TRIGGER trg_profiles_role_guard
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION profiles_role_guard();

-- admin_change_role: returns json for API compatibility
CREATE OR REPLACE FUNCTION admin_change_role(p_user_id UUID, p_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF get_my_role() <> 'admin' THEN
    RETURN jsonb_build_object('error', 'not_admin');
  END IF;

  IF p_role NOT IN ('customer', 'merchant', 'admin') THEN
    RETURN jsonb_build_object('error', 'invalid_role');
  END IF;

  UPDATE profiles SET role = p_role WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'user_not_found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION admin_change_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_change_role(UUID, TEXT) TO authenticated;

-- admin_toggle_business
CREATE OR REPLACE FUNCTION admin_toggle_business(p_business_id UUID, p_is_active BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF get_my_role() <> 'admin' THEN
    RETURN jsonb_build_object('error', 'not_admin');
  END IF;

  UPDATE businesses
  SET is_active = p_is_active
  WHERE id = p_business_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'business_not_found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION admin_toggle_business(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_toggle_business(UUID, BOOLEAN) TO authenticated;
