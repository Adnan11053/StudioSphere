-- Seed script for testing (run after 004_manual_owner_setup.sql)
-- This script helps you set up a complete test environment

-- Get the current authenticated user's ID (for testing in SQL Editor)
-- You can get this from: SELECT auth.uid();

-- Option 1: Quick setup for current authenticated user
-- Run this if you're logged in to Supabase and want to set yourself up as owner

DO $$
DECLARE
  current_user_id UUID := auth.uid();
  new_studio_id UUID;
  existing_studio_id UUID;
BEGIN
  -- Only run if user is authenticated
  IF current_user_id IS NOT NULL THEN
    -- Check if studio already exists for this user
    SELECT id INTO existing_studio_id
    FROM public.studios
    WHERE owner_id = current_user_id
    LIMIT 1;
    
    IF existing_studio_id IS NULL THEN
    -- Create studio for current user
    INSERT INTO public.studios (name, owner_id)
    VALUES ('My Studio', current_user_id)
    RETURNING id INTO new_studio_id;
    ELSE
      new_studio_id := existing_studio_id;
      RAISE NOTICE 'Studio already exists with ID: %', new_studio_id;
    END IF;
    
    -- Create or update profile for owner (idempotent)
    INSERT INTO public.profiles (id, email, full_name, studio_id, role)
    SELECT 
      current_user_id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', 'Owner'),
      new_studio_id,
      'owner'
    FROM auth.users au
    WHERE au.id = current_user_id
    ON CONFLICT (id) DO UPDATE
    SET 
      studio_id = EXCLUDED.studio_id,
      role = EXCLUDED.role,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    
    -- Create default categories (only if they don't exist - idempotent)
    INSERT INTO public.categories (studio_id, name) 
    SELECT new_studio_id, name
    FROM (VALUES 
      ('Cameras'),
      ('Lenses'),
      ('Lighting'),
      ('Audio'),
      ('Tripods & Supports'),
      ('Accessories')
    ) AS v(name)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories 
      WHERE studio_id = new_studio_id AND categories.name = v.name
    );
    
    RAISE NOTICE 'Setup completed successfully. Studio ID: %', new_studio_id;
  ELSE
    RAISE EXCEPTION 'No authenticated user found. Please log in first.';
  END IF;
END $$;
