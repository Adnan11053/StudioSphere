-- Add code and vendor fields to equipment table
-- This script is idempotent and can be run multiple times safely

-- Add code column (unique per studio)
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS code TEXT;

-- Add vendor fields
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS vendor_contact TEXT,
ADD COLUMN IF NOT EXISTS vendor_email TEXT;

-- Create unique index for code per studio (to ensure uniqueness)
-- Note: This allows NULL codes, but enforces uniqueness when code is set
CREATE UNIQUE INDEX IF NOT EXISTS equipment_code_studio_unique 
ON public.equipment (studio_id, code) 
WHERE code IS NOT NULL;

