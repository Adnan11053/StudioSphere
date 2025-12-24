-- Alternative solution: Allow studio inserts for any authenticated user
-- This is simpler than using a function, but less secure
-- Use this if 007_fix_studios_insert.sql doesn't work

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Owners can insert their studio" ON public.studios;
DROP POLICY IF EXISTS "Allow studio creation for new users" ON public.studios;

-- Option 1: Allow any authenticated user to create a studio
-- This works because the admin page creates users first, then studios
CREATE POLICY "Allow studio creation for new users" ON public.studios
  FOR INSERT 
  WITH CHECK (true);  -- Allow all inserts (RLS still enabled for SELECT/UPDATE)

-- Option 2: If Option 1 is too permissive, use this instead:
-- CREATE POLICY "Allow studio creation for new users" ON public.studios
--   FOR INSERT 
--   WITH CHECK (
--     owner_id IN (SELECT id FROM auth.users)  -- Only allow if owner_id is a valid user
--   );

-- Keep the regular policy for users creating their own studios (redundant but safe)
CREATE POLICY "Owners can insert their studio" ON public.studios
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

