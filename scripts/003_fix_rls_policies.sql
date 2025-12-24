-- Fix infinite recursion in RLS policies for both profiles and studios
-- This script can be run multiple times safely - it drops existing policies first

-- First, fix studios policies to prevent recursion
DROP POLICY IF EXISTS "Users can view their own studio" ON public.studios;
DROP POLICY IF EXISTS "Users can view studios they belong to" ON public.studios;

-- Studios SELECT policy - only check owner_id (no recursion)
CREATE POLICY "Users can view their own studio" ON public.studios
  FOR SELECT USING (owner_id = auth.uid());

-- NOTE: Removed "Users can view studios they belong to" policy
-- This policy checked profiles which caused infinite recursion
-- Studios can only be viewed by their owner (via owner_id)

-- Drop all existing profiles policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view profiles in their studio" ON public.profiles;
DROP POLICY IF EXISTS "Studio owners and admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Studio owners can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view all profiles in studio" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in studio" ON public.profiles;
DROP POLICY IF EXISTS "Owners can update profiles in their studio" ON public.profiles;

-- Recreate profiles SELECT policy without recursion
-- Users can see their own profile or profiles in studios where they are owner/admin
CREATE POLICY "Users can view profiles in their studio" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Recreate UPDATE policy for owners without recursion
CREATE POLICY "Studio owners can update profiles" ON public.profiles
  FOR UPDATE USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Allow admins to update profiles (separate policy to avoid recursion)
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.studio_id = profiles.studio_id 
      AND p.role = 'admin'
    )
  );
