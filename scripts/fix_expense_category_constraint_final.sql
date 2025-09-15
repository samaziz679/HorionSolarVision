-- Fix expense category constraint to use UUID foreign key instead of enum

-- First, check what type category_id currently is
DO $$
BEGIN
    -- Drop the constraint if it exists as an enum
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' 
        AND column_name = 'category_id' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Change the column to UUID and add proper foreign key constraint
        ALTER TABLE expenses 
        ALTER COLUMN category_id TYPE uuid USING category_id::text::uuid;
        
        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'expenses_category_id_fkey'
        ) THEN
            ALTER TABLE expenses 
            ADD CONSTRAINT expenses_category_id_fkey 
            FOREIGN KEY (category_id) REFERENCES expense_categories(id);
        END IF;
    END IF;
END $$;

-- Ensure expense_categories table has proper structure
CREATE TABLE IF NOT EXISTS expense_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name_fr character varying NOT NULL,
    name_en character varying NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Insert default categories if they don't exist
INSERT INTO expense_categories (name_fr, name_en, is_default, created_by)
SELECT 'Maintenance', 'Maintenance', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Maintenance')
AND auth.uid() IS NOT NULL;

INSERT INTO expense_categories (name_fr, name_en, is_default, created_by)
SELECT 'Marketing', 'Marketing', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Marketing')
AND auth.uid() IS NOT NULL;

INSERT INTO expense_categories (name_fr, name_en, is_default, created_by)
SELECT 'Fournitures', 'Supplies', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Fournitures')
AND auth.uid() IS NOT NULL;

INSERT INTO expense_categories (name_fr, name_en, is_default, created_by)
SELECT 'Transport', 'Transport', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Transport')
AND auth.uid() IS NOT NULL;

-- Ensure expenses table has proper structure
ALTER TABLE expenses 
ALTER COLUMN created_by TYPE uuid,
ADD CONSTRAINT expenses_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id)
ON DELETE SET NULL;

-- Add notes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'notes'
    ) THEN
        ALTER TABLE expenses ADD COLUMN notes text;
    END IF;
END $$;

COMMIT;
