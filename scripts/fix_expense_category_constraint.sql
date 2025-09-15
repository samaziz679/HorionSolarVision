-- Check current expense table structure and fix category constraint
DO $$
BEGIN
    -- First, let's see what the current constraint is
    RAISE NOTICE 'Checking current expenses table structure...';
    
    -- Drop the problematic constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'expenses_category_id_check' 
        AND table_name = 'expenses'
    ) THEN
        ALTER TABLE expenses DROP CONSTRAINT expenses_category_id_check;
        RAISE NOTICE 'Dropped old category constraint';
    END IF;
    
    -- Check if category_id column is the right type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' 
        AND column_name = 'category_id' 
        AND data_type != 'uuid'
    ) THEN
        -- Change column type to UUID if it's not already
        ALTER TABLE expenses ALTER COLUMN category_id TYPE uuid USING category_id::uuid;
        RAISE NOTICE 'Changed category_id column to UUID type';
    END IF;
    
    -- Add proper foreign key constraint to expense_categories table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'expenses_category_id_fkey' 
        AND table_name = 'expenses'
    ) THEN
        ALTER TABLE expenses 
        ADD CONSTRAINT expenses_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES expense_categories(id);
        RAISE NOTICE 'Added foreign key constraint to expense_categories';
    END IF;
    
    -- Ensure expense_categories table exists with proper structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_categories') THEN
        CREATE TABLE expense_categories (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name_fr varchar(255) NOT NULL,
            name_en varchar(255) NOT NULL,
            is_default boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            created_by uuid REFERENCES auth.users(id)
        );
        RAISE NOTICE 'Created expense_categories table';
        
        -- Insert default categories
        INSERT INTO expense_categories (name_fr, name_en, is_default) VALUES
        ('Maintenance', 'Maintenance', true),
        ('Marketing', 'Marketing', true),
        ('Transport', 'Transport', true),
        ('Fournitures', 'Supplies', true),
        ('Utilities', 'Utilities', true),
        ('Autres', 'Other', true);
        RAISE NOTICE 'Inserted default expense categories';
    END IF;
    
END $$;

-- Verify the fix
SELECT 
    c.column_name,
    c.data_type,
    c.is_nullable,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.columns c
LEFT JOIN information_schema.constraint_column_usage ccu ON c.column_name = ccu.column_name AND c.table_name = ccu.table_name
LEFT JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
WHERE c.table_name = 'expenses' AND c.column_name = 'category_id';
