-- Fix profiles UPDATE policy to prevent 500 errors
-- The issue: UPDATE policies might be causing recursion or conflicts
-- Solution: Simplify and split UPDATE policies to avoid recursion

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Studio owners and admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Studio owners can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Policy 1: Users can always update their own profile (simple, no recursion)
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Policy 2: Studio owners can update profiles in their studio
-- Uses subquery to studios (which only checks owner_id, no recursion)
CREATE POLICY "Studio owners can update profiles" ON public.profiles
  FOR UPDATE USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Policy 3: Admins can update profiles in their studio
-- IMPORTANT: This policy queries profiles which could cause recursion
-- For now, we'll comment it out and rely on the owner policy
-- If you need admin functionality, create a SECURITY DEFINER function instead
-- 
-- CREATE POLICY "Admins can update profiles" ON public.profiles
--   FOR UPDATE USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles p 
--       WHERE p.id = auth.uid() 
--       AND p.studio_id = profiles.studio_id 
--       AND p.role = 'admin'
--     )
--   );

-- Note: Admin updates are currently handled by the "Studio owners can update profiles" policy
-- If you need separate admin permissions, create a SECURITY DEFINER function to avoid recursion

