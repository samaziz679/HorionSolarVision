-- Add missing columns to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers" ON suppliers;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view suppliers" ON suppliers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert suppliers" ON suppliers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update suppliers" ON suppliers
    FOR UPDATE USING (true);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
AND table_schema = 'public'
ORDER BY ordinal_position;
