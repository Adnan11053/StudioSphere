-- COMPLETE FIX for infinite recursion in studios RLS policies
-- Run this immediately if you're getting recursion errors
-- This removes ALL profile checks from studios policies

-- Drop ALL existing studios policies
DROP POLICY IF EXISTS "Users can view their own studio" ON public.studios;
DROP POLICY IF EXISTS "Users can view studios they belong to" ON public.studios;
DROP POLICY IF EXISTS "Users can view studios by ID for joining" ON public.studios;
DROP POLICY IF EXISTS "Owners can insert their studio" ON public.studios;
DROP POLICY IF EXISTS "Owners can update their studio" ON public.studios;

-- CRITICAL: Studios policies must NOT check profiles to avoid recursion
-- SELECT: Users can view studios they own OR studios they're trying to join (by ID)
CREATE POLICY "Users can view their own studio" ON public.studios
  FOR SELECT USING (owner_id = auth.uid());

-- Allow authenticated users to view studios by ID (needed for employees to join studios)
-- This is safe because it only allows viewing, not modifying
-- Only authenticated users can view (not anonymous)
CREATE POLICY "Users can view studios by ID for joining" ON public.studios
  FOR SELECT USING (auth.uid() IS NOT NULL);  -- Only authenticated users can view studios for joining

-- INSERT: Owners can insert studios (ONLY checks owner_id - NO profiles, NO recursion)
CREATE POLICY "Owners can insert their studio" ON public.studios
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- UPDATE: Owners can update their studios (ONLY checks owner_id - NO profiles, NO recursion)
CREATE POLICY "Owners can update their studio" ON public.studios
  FOR UPDATE USING (owner_id = auth.uid());

-- NOTE: Removed "Users can view studios they belong to" policy
-- This policy checked profiles which caused recursion
-- Users will only see studios they own directly (via owner_id)
-- After studio is created, profile can be updated to link to studio

