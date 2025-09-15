-- Convert expense category from enum to UUID foreign key
DO $$
BEGIN
    -- First, check if there's an expense_category enum type
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category') THEN
        -- Drop the enum constraint and convert to UUID
        ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_id_check;
        
        -- Change the column type to UUID
        ALTER TABLE expenses ALTER COLUMN category_id TYPE uuid USING NULL;
        
        -- Drop the enum type
        DROP TYPE IF EXISTS expense_category CASCADE;
        
        RAISE NOTICE 'Dropped expense_category enum type';
    END IF;
    
    -- Ensure the column is UUID type
    ALTER TABLE expenses ALTER COLUMN category_id TYPE uuid;
    
    -- Add foreign key constraint to expense_categories table
    ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
    ALTER TABLE expenses ADD CONSTRAINT expenses_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES expense_categories(id);
    
    -- Ensure expense_categories table exists with default categories
    INSERT INTO expense_categories (id, name_fr, name_en, is_default, created_by, created_at)
    SELECT 
        gen_random_uuid(),
        'Maintenance',
        'Maintenance', 
        true,
        (SELECT id FROM auth.users LIMIT 1),
        NOW()
    WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Maintenance');
    
    INSERT INTO expense_categories (id, name_fr, name_en, is_default, created_by, created_at)
    SELECT 
        gen_random_uuid(),
        'Marketing',
        'Marketing', 
        true,
        (SELECT id FROM auth.users LIMIT 1),
        NOW()
    WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Marketing');
    
    INSERT INTO expense_categories (id, name_fr, name_en, is_default, created_by, created_at)
    SELECT 
        gen_random_uuid(),
        'Fournitures',
        'Supplies', 
        true,
        (SELECT id FROM auth.users LIMIT 1),
        NOW()
    WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Fournitures');
    
    INSERT INTO expense_categories (id, name_fr, name_en, is_default, created_by, created_at)
    SELECT 
        gen_random_uuid(),
        'Transport',
        'Transport', 
        true,
        (SELECT id FROM auth.users LIMIT 1),
        NOW()
    WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name_fr = 'Transport');
    
    RAISE NOTICE 'Successfully converted expense category_id to UUID foreign key';
    
END $$;
