-- Fix RLS policy for studios INSERT
-- The issue: Admin page creates studios for newly created users, but RLS checks auth.uid()
-- Solution: Create SECURITY DEFINER function that bypasses RLS for studio creation

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Owners can insert their studio" ON public.studios;

-- Drop existing function if it exists (needed to change return type)
DROP FUNCTION IF EXISTS public.create_studio_for_user(TEXT, UUID);

-- Create a function that allows studio creation (bypasses RLS)
-- Returns the full studio object as JSON to avoid RLS issues when fetching
CREATE FUNCTION public.create_studio_for_user(
  studio_name TEXT,
  user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_studio JSON;
  new_studio_id UUID;
  new_studio_name TEXT;
  new_studio_owner_id UUID;
  new_studio_created_at TIMESTAMPTZ;
  new_studio_updated_at TIMESTAMPTZ;
BEGIN
  -- Insert studio bypassing RLS (SECURITY DEFINER runs with creator's privileges)
  INSERT INTO public.studios (name, owner_id)
  VALUES (studio_name, user_id)
  RETURNING id, name, owner_id, created_at, updated_at 
  INTO new_studio_id, new_studio_name, new_studio_owner_id, new_studio_created_at, new_studio_updated_at;
  
  -- Build JSON object directly to avoid SELECT query (which might be blocked by RLS)
  new_studio := json_build_object(
    'id', new_studio_id,
    'name', new_studio_name,
    'owner_id', new_studio_owner_id,
    'created_at', new_studio_created_at,
    'updated_at', new_studio_updated_at
  );
  
  RETURN new_studio;
END;
$$;

-- Grant execute permission to authenticated and anon users
-- This allows the admin page (which may not be authenticated) to create studios
GRANT EXECUTE ON FUNCTION public.create_studio_for_user(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_studio_for_user(TEXT, UUID) TO anon;

-- Also keep the regular INSERT policy for users creating their own studios
CREATE POLICY "Owners can insert their studio" ON public.studios
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

-- Create a function to update/create profiles (bypasses RLS)
-- This is needed for the admin page to create profiles for newly created users
DROP FUNCTION IF EXISTS public.update_or_create_profile(UUID, TEXT, TEXT, UUID, TEXT);

CREATE FUNCTION public.update_or_create_profile(
  profile_id UUID,
  profile_email TEXT,
  profile_full_name TEXT,
  profile_studio_id UUID,
  profile_role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  profile_email_val TEXT;
  profile_full_name_val TEXT;
  profile_studio_id_val UUID;
  profile_role_val TEXT;
  profile_created_at_val TIMESTAMPTZ;
  profile_updated_at_val TIMESTAMPTZ;
  rows_updated INTEGER;
BEGIN
  -- Try to update existing profile
  UPDATE public.profiles
  SET 
    email = profile_email,
    full_name = profile_full_name,
    studio_id = profile_studio_id,
    role = profile_role,
    updated_at = NOW()
  WHERE id = profile_id;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  -- If no rows were updated, insert new profile
  IF rows_updated = 0 THEN
    INSERT INTO public.profiles (id, email, full_name, studio_id, role)
    VALUES (profile_id, profile_email, profile_full_name, profile_studio_id, profile_role)
    RETURNING email, full_name, studio_id, role, created_at, updated_at
    INTO profile_email_val, profile_full_name_val, profile_studio_id_val, profile_role_val, profile_created_at_val, profile_updated_at_val;
  ELSE
    -- Get updated values directly from the table (SECURITY DEFINER bypasses RLS)
    SELECT email, full_name, studio_id, role, created_at, updated_at
    INTO profile_email_val, profile_full_name_val, profile_studio_id_val, profile_role_val, profile_created_at_val, profile_updated_at_val
    FROM public.profiles
    WHERE id = profile_id;
  END IF;
  
  -- Build JSON object directly to avoid potential RLS issues
  result := json_build_object(
    'id', profile_id,
    'email', profile_email_val,
    'full_name', profile_full_name_val,
    'studio_id', profile_studio_id_val,
    'role', profile_role_val,
    'created_at', profile_created_at_val,
    'updated_at', profile_updated_at_val
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_or_create_profile(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_or_create_profile(UUID, TEXT, TEXT, UUID, TEXT) TO anon;

