-- Fix profiles SELECT policy to prevent 500 errors
-- The issue: Profiles SELECT policy might be causing recursion or errors when querying studios
-- Solution: Simplify the policy to allow users to view their own profile first, then check studios

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view profiles in their studio" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a simpler SELECT policy that:
-- 1. Always allows users to view their own profile (id = auth.uid())
-- 2. Allows viewing profiles in studios they own (via direct owner_id check, no recursion)
-- Split into two policies for clarity and to avoid potential issues
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Allow viewing profiles in studios where user is owner
-- This uses a subquery to studios, but studios policy only checks owner_id (no recursion)
CREATE POLICY "Users can view profiles in their studio" ON public.profiles
  FOR SELECT USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Note: Split into two policies to:
-- 1. Make it clearer what each policy does
-- 2. Avoid potential issues with complex OR conditions
-- 3. Ensure users can always see their own profile (even without studio_id)

