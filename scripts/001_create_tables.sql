-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create studios table (multi-tenant)
CREATE TABLE IF NOT EXISTS public.studios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create equipment categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  serial_number TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'needs_repair')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'issued', 'maintenance', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create issues table (when equipment is issued to employee)
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  issued_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issued_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expected_return_date DATE,
  actual_return_date TIMESTAMPTZ,
  return_condition TEXT CHECK (return_condition IN ('excellent', 'good', 'fair', 'poor', 'needs_repair', 'damaged')),
  issue_notes TEXT,
  return_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'issued', 'returned', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create maintenance records table
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('repair', 'routine', 'inspection', 'upgrade')),
  description TEXT NOT NULL,
  cost DECIMAL(10, 2),
  performed_by TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for studios (drop existing first to avoid conflicts)
-- Note: Removed profiles check to prevent infinite recursion
DROP POLICY IF EXISTS "Users can view their own studio" ON public.studios;
DROP POLICY IF EXISTS "Users can view studios by ID for joining" ON public.studios;
DROP POLICY IF EXISTS "Owners can insert their studio" ON public.studios;
DROP POLICY IF EXISTS "Owners can update their studio" ON public.studios;
DROP POLICY IF EXISTS "Users can view studios they belong to" ON public.studios;

-- Users can view studios they own (no recursion - only checks owner_id)
CREATE POLICY "Users can view their own studio" ON public.studios
  FOR SELECT USING (owner_id = auth.uid());

-- Allow authenticated users to view studios by ID (needed for employees to join studios)
-- This allows the join studio functionality to work
-- Only authenticated users can view (not anonymous)
CREATE POLICY "Users can view studios by ID for joining" ON public.studios
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow owners to insert their studio (needed for admin page to create first studio)
CREATE POLICY "Owners can insert their studio" ON public.studios
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Allow owners to update their studio
CREATE POLICY "Owners can update their studio" ON public.studios
  FOR UPDATE USING (owner_id = auth.uid());

-- NOTE: Removed "Users can view studios they belong to" policy to prevent recursion
-- Studios can only be viewed by their owner (via owner_id check)
-- This prevents infinite recursion when inserting studios

-- RLS Policies for profiles (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view profiles in their studio" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Studio owners and admins can update profiles" ON public.profiles;

CREATE POLICY "Users can view profiles in their studio" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Studio owners and admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for categories (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view categories in their studio" ON public.categories;
DROP POLICY IF EXISTS "Owners and admins can manage categories" ON public.categories;

CREATE POLICY "Users can view categories in their studio" ON public.categories
  FOR SELECT USING (
    studio_id IN (SELECT studio_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Owners and admins can manage categories" ON public.categories
  FOR ALL USING (
    studio_id IN (
      SELECT studio_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for equipment (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view equipment in their studio" ON public.equipment;
DROP POLICY IF EXISTS "Owners and admins can manage equipment" ON public.equipment;

CREATE POLICY "Users can view equipment in their studio" ON public.equipment
  FOR SELECT USING (
    studio_id IN (SELECT studio_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Owners and admins can manage equipment" ON public.equipment
  FOR ALL USING (
    studio_id IN (
      SELECT studio_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for issues (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view issues in their studio" ON public.issues;
DROP POLICY IF EXISTS "Employees can create issue requests" ON public.issues;
DROP POLICY IF EXISTS "Owners and admins can manage all issues" ON public.issues;

CREATE POLICY "Users can view issues in their studio" ON public.issues
  FOR SELECT USING (
    studio_id IN (SELECT studio_id FROM public.profiles WHERE id = auth.uid()) OR
    issued_to = auth.uid()
  );

CREATE POLICY "Employees can create issue requests" ON public.issues
  FOR INSERT WITH CHECK (
    studio_id IN (SELECT studio_id FROM public.profiles WHERE id = auth.uid()) AND
    issued_to = auth.uid()
  );

CREATE POLICY "Owners and admins can manage all issues" ON public.issues
  FOR ALL USING (
    studio_id IN (
      SELECT studio_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for maintenance records (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view maintenance in their studio" ON public.maintenance_records;
DROP POLICY IF EXISTS "Owners and admins can manage maintenance" ON public.maintenance_records;

CREATE POLICY "Users can view maintenance in their studio" ON public.maintenance_records
  FOR SELECT USING (
    studio_id IN (SELECT studio_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Owners and admins can manage maintenance" ON public.maintenance_records
  FOR ALL USING (
    studio_id IN (
      SELECT studio_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for audit logs (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Owners can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Owners can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    studio_id IN (
      SELECT studio_id FROM public.profiles WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());
