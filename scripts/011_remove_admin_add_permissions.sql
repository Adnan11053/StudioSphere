-- Remove admin role and add employee permissions system
-- Also add quantity field to equipment

-- Step 1: Add quantity column to equipment table
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Step 2: Create employee_permissions table for owner-controlled tab access
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  can_access_dashboard BOOLEAN DEFAULT true NOT NULL,
  can_access_equipment BOOLEAN DEFAULT true NOT NULL,
  can_access_issues BOOLEAN DEFAULT true NOT NULL,
  can_access_employees BOOLEAN DEFAULT false NOT NULL,
  can_access_reports BOOLEAN DEFAULT false NOT NULL,
  can_access_analytics BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, studio_id)
);

-- Step 3: Update profiles table to remove admin from role constraint
-- First, update any existing admin users to owner
UPDATE public.profiles 
SET role = 'owner' 
WHERE role = 'admin';

-- Drop the old constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint without admin
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check CHECK (role IN ('owner', 'employee'));

-- Step 4: Update RLS policies to remove admin references
-- Categories policies
DROP POLICY IF EXISTS "Owners and admins can manage categories" ON public.categories;
CREATE POLICY "Owners can manage categories" ON public.categories
  FOR ALL USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Equipment policies
DROP POLICY IF EXISTS "Owners and admins can manage equipment" ON public.equipment;
CREATE POLICY "Owners can manage equipment" ON public.equipment
  FOR ALL USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Issues policies
DROP POLICY IF EXISTS "Owners and admins can manage all issues" ON public.issues;
CREATE POLICY "Owners can manage all issues" ON public.issues
  FOR ALL USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Maintenance records policies
DROP POLICY IF EXISTS "Owners and admins can manage maintenance" ON public.maintenance_records;
CREATE POLICY "Owners can manage maintenance" ON public.maintenance_records
  FOR ALL USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Step 5: RLS policies for employee_permissions
-- Owners can view and manage all permissions in their studio
CREATE POLICY "Owners can view permissions" ON public.employee_permissions
  FOR SELECT USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage permissions" ON public.employee_permissions
  FOR ALL USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Employees can view their own permissions
CREATE POLICY "Employees can view own permissions" ON public.employee_permissions
  FOR SELECT USING (employee_id = auth.uid());

-- Step 6: Create trigger to auto-create default permissions for new employees
CREATE OR REPLACE FUNCTION public.handle_new_employee_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create permissions for employees (not owners)
  IF NEW.role = 'employee' AND NEW.studio_id IS NOT NULL THEN
    INSERT INTO public.employee_permissions (
      employee_id,
      studio_id,
      can_access_dashboard,
      can_access_equipment,
      can_access_issues,
      can_access_employees,
      can_access_reports,
      can_access_analytics
    )
    VALUES (
      NEW.id,
      NEW.studio_id,
      true,  -- Dashboard access by default
      true,  -- Equipment access by default
      true,  -- Issues access by default
      false, -- Employees access (owner only)
      false, -- Reports access (owner only)
      false  -- Analytics access (owner only)
    )
    ON CONFLICT (employee_id, studio_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_permissions ON public.profiles;
CREATE TRIGGER on_profile_created_permissions
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.studio_id IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_employee_permissions();

-- Step 7: Update updated_at trigger for employee_permissions
CREATE TRIGGER update_employee_permissions_updated_at 
  BEFORE UPDATE ON public.employee_permissions
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

