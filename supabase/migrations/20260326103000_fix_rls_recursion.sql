-- Fix infinite recursion in RLS policies caused by policies on `profiles`
-- querying `profiles` again to check admin role.
--
-- Solution: introduce a SECURITY DEFINER helper function that reads the
-- caller's role without going through RLS, then reference it in all policies.

CREATE OR REPLACE FUNCTION public.get_my_role()
  RETURNS text
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- profiles
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- businesses
DROP POLICY IF EXISTS businesses_admin_all ON public.businesses;
CREATE POLICY businesses_admin_all ON public.businesses
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- loyalty_programs
DROP POLICY IF EXISTS programs_admin_all ON public.loyalty_programs;
CREATE POLICY programs_admin_all ON public.loyalty_programs
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- punch_cards
DROP POLICY IF EXISTS punch_cards_admin_all ON public.punch_cards;
CREATE POLICY punch_cards_admin_all ON public.punch_cards
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
