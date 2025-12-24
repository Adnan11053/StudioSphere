-- Manual Owner Setup Script
-- This script provides manual setup instructions and alternative policies
-- Note: This is mainly for reference. Use 003_fix_rls_policies.sql for the actual fix.

-- Drop any conflicting policies that might exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view all profiles in studio" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in studio" ON public.profiles;
DROP POLICY IF EXISTS "Owners can update profiles in their studio" ON public.profiles;

-- Manual Owner and Studio Setup Instructions:
-- After creating a user through Supabase Auth, use these queries:

-- STEP 1: First, sign up a user through the app's signup page or Supabase Auth dashboard
-- This will create a user in auth.users table with a UUID

-- STEP 2: Create a studio (replace YOUR_USER_UUID with the actual UUID from auth.users)
-- INSERT INTO public.studios (name, owner_id)
-- VALUES ('Your Studio Name', 'YOUR_USER_UUID');

-- STEP 3: Create a profile for the owner (replace YOUR_USER_UUID and YOUR_STUDIO_UUID)
-- INSERT INTO public.profiles (id, email, full_name, studio_id, role)
-- VALUES (
--   'YOUR_USER_UUID',
--   'owner@example.com',
--   'Owner Full Name',
--   'YOUR_STUDIO_UUID',
--   'owner'
-- );

-- STEP 4 (Optional): Add some default categories
-- INSERT INTO public.categories (studio_id, name) VALUES
-- ('YOUR_STUDIO_UUID', 'Cameras'),
-- ('YOUR_STUDIO_UUID', 'Lenses'),
-- ('YOUR_STUDIO_UUID', 'Lighting'),
-- ('YOUR_STUDIO_UUID', 'Audio'),
-- ('YOUR_STUDIO_UUID', 'Accessories');

-- EXAMPLE: Complete setup for a test user
-- Assuming you have a user with email 'test@example.com' and UUID 'abc-123-def'
-- 
-- First, get the user UUID from Supabase Auth dashboard or query:
-- SELECT id, email FROM auth.users WHERE email = 'test@example.com';
-- 
-- Then run these queries (replace UUIDs with your actual values):
-- 
-- INSERT INTO public.studios (id, name, owner_id)
-- VALUES (
--   'studio-uuid-here',
--   'Test Studio',
--   'abc-123-def'
-- );
-- 
-- INSERT INTO public.profiles (id, email, full_name, studio_id, role)
-- VALUES (
--   'abc-123-def',
--   'test@example.com',
--   'Test Owner',
--   'studio-uuid-here',
--   'owner'
-- );
