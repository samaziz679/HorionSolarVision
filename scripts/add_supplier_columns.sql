-- Add missing columns to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS contact_person CHARACTER VARYING,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update any existing RLS policies if needed
-- The existing policies should automatically apply to the new columns
