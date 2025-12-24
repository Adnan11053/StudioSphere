-- Update issues table to support issuing to any person (not just employees)
-- Remove request workflow - direct issuing only
-- Add quantity tracking

-- Step 1: Add new columns for person details and quantity
ALTER TABLE public.issues 
ADD COLUMN IF NOT EXISTS person_name TEXT,
ADD COLUMN IF NOT EXISTS person_contact TEXT,
ADD COLUMN IF NOT EXISTS quantity_issued INTEGER DEFAULT 1 NOT NULL;

-- Step 2: Make issued_to nullable (we'll use person_name/contact instead)
-- First, drop the foreign key constraint
ALTER TABLE public.issues 
DROP CONSTRAINT IF EXISTS issues_issued_to_fkey;

-- Then make it nullable
ALTER TABLE public.issues 
ALTER COLUMN issued_to DROP NOT NULL;

-- Re-add foreign key constraint but allow NULL
ALTER TABLE public.issues 
ADD CONSTRAINT issues_issued_to_fkey 
FOREIGN KEY (issued_to) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Update status constraint - remove pending/approved/cancelled, keep only issued/returned
-- First, update existing records
UPDATE public.issues 
SET status = 'issued' 
WHERE status IN ('pending', 'approved');

UPDATE public.issues 
SET status = 'returned' 
WHERE status = 'cancelled';

-- Drop old constraint
ALTER TABLE public.issues 
DROP CONSTRAINT IF EXISTS issues_status_check;

-- Add new constraint with only issued/returned
ALTER TABLE public.issues 
ADD CONSTRAINT issues_status_check CHECK (status IN ('issued', 'returned'));

-- Step 4: Set default status to 'issued' (no more pending)
ALTER TABLE public.issues 
ALTER COLUMN status SET DEFAULT 'issued';

-- Step 5: Remove approval fields (no longer needed)
ALTER TABLE public.issues 
DROP COLUMN IF EXISTS approved_by,
DROP COLUMN IF EXISTS approved_at;

-- Step 5b: Update RLS policies to allow creating issues with person_name
DROP POLICY IF EXISTS "Employees can create issue requests" ON public.issues;
DROP POLICY IF EXISTS "Users can create issues" ON public.issues;
DROP POLICY IF EXISTS "Users can view issues in their studio" ON public.issues;
DROP POLICY IF EXISTS "Owners can manage all issues" ON public.issues;
DROP POLICY IF EXISTS "Owners and admins can manage all issues" ON public.issues;

-- Users can view issues in their studio
CREATE POLICY "Users can view issues in their studio" ON public.issues
  FOR SELECT USING (
    studio_id IN (SELECT studio_id FROM public.profiles WHERE id = auth.uid())
  );

-- Users with issue permission can create issues (with person_name, not just employees)
CREATE POLICY "Users can create issues" ON public.issues
  FOR INSERT WITH CHECK (
    studio_id IN (SELECT studio_id FROM public.profiles WHERE id = auth.uid())
  );

-- Owners can manage all issues
CREATE POLICY "Owners can manage all issues" ON public.issues
  FOR ALL USING (
    studio_id IN (
      SELECT id FROM public.studios WHERE owner_id = auth.uid()
    )
  );

-- Step 6: Create function to update equipment quantity when issuing
-- This function directly modifies equipment.quantity to reflect available inventory
CREATE OR REPLACE FUNCTION public.handle_equipment_issue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  -- Get current equipment quantity
  SELECT quantity INTO current_qty
  FROM public.equipment
  WHERE id = NEW.equipment_id;
  
  -- When inserting a new issue with status 'issued', reduce equipment quantity
  IF TG_OP = 'INSERT' AND NEW.status = 'issued' THEN
    UPDATE public.equipment
    SET quantity = GREATEST(0, current_qty - NEW.quantity_issued),
        status = CASE WHEN GREATEST(0, current_qty - NEW.quantity_issued) = 0 THEN 'issued' ELSE 'available' END
    WHERE id = NEW.equipment_id;
  END IF;
  
  -- When updating status from non-issued to 'issued', reduce equipment quantity
  IF TG_OP = 'UPDATE' AND NEW.status = 'issued' AND (OLD.status IS NULL OR OLD.status != 'issued') THEN
    UPDATE public.equipment
    SET quantity = GREATEST(0, current_qty - NEW.quantity_issued),
        status = CASE WHEN GREATEST(0, current_qty - NEW.quantity_issued) = 0 THEN 'issued' ELSE 'available' END
    WHERE id = NEW.equipment_id;
  END IF;
  
  -- When updating status from 'issued' to 'returned', restore equipment quantity
  IF TG_OP = 'UPDATE' AND NEW.status = 'returned' AND OLD.status = 'issued' THEN
    UPDATE public.equipment
    SET quantity = current_qty + OLD.quantity_issued,
        status = CASE WHEN current_qty + OLD.quantity_issued > 0 THEN 'available' ELSE 'issued' END
    WHERE id = NEW.equipment_id;
  END IF;
  
  -- When updating quantity_issued on an existing issued item
  IF TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'issued' AND OLD.quantity_issued != NEW.quantity_issued THEN
    UPDATE public.equipment
    SET quantity = current_qty + OLD.quantity_issued - NEW.quantity_issued,
        status = CASE WHEN current_qty + OLD.quantity_issued - NEW.quantity_issued = 0 THEN 'issued' ELSE 'available' END
    WHERE id = NEW.equipment_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_issue_status_change ON public.issues;

-- Create trigger
CREATE TRIGGER on_issue_status_change
  AFTER INSERT OR UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_equipment_issue();

-- Step 7: Add check to ensure quantity_issued doesn't exceed available quantity
-- This runs BEFORE the trigger that updates equipment.quantity
CREATE OR REPLACE FUNCTION public.check_equipment_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  -- Only check when inserting or updating to 'issued' status
  IF NEW.status = 'issued' THEN
    -- Get current equipment quantity
    SELECT quantity INTO current_qty
    FROM public.equipment
    WHERE id = NEW.equipment_id;
    
    -- If updating from issued to issued (changing quantity), add back old quantity first
    IF TG_OP = 'UPDATE' AND OLD.status = 'issued' THEN
      current_qty := current_qty + OLD.quantity_issued;
    END IF;
    
    -- Check if we have enough quantity
    IF NEW.quantity_issued > current_qty THEN
      RAISE EXCEPTION 'Insufficient quantity. Available: %, Requested: %', current_qty, NEW.quantity_issued;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_equipment_quantity_trigger ON public.issues;
CREATE TRIGGER check_equipment_quantity_trigger
  BEFORE INSERT OR UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.check_equipment_quantity();

