-- Secure script to restructure expense categories system
-- This will change from enum-based to foreign key relationship

BEGIN;

-- Step 1: Add new category_id column to expenses table
ALTER TABLE expenses 
ADD COLUMN category_id UUID REFERENCES expense_categories(id);

-- Step 2: Create mapping function to convert enum values to category IDs
CREATE OR REPLACE FUNCTION map_enum_to_category_id(enum_val expense_category)
RETURNS UUID AS $$
DECLARE
    category_uuid UUID;
BEGIN
    -- Map enum values to French category names, then get ID
    SELECT id INTO category_uuid
    FROM expense_categories
    WHERE name_fr = CASE enum_val
        WHEN 'salaire' THEN 'Salaire vendeur'
        WHEN 'loyer' THEN 'Loyer boutique'
        WHEN 'emprunt' THEN 'Emprunt'
        WHEN 'electricite' THEN 'Électricité'
        WHEN 'eau' THEN 'Eau'
        WHEN 'internet' THEN 'Frais internet'
        WHEN 'carburant' THEN 'Carburant'
        WHEN 'maintenance' THEN 'Maintenance'
        WHEN 'autre' THEN 'Autre'
        ELSE 'Autre'
    END;
    
    -- If no match found, use 'Autre' as fallback
    IF category_uuid IS NULL THEN
        SELECT id INTO category_uuid
        FROM expense_categories
        WHERE name_fr = 'Autre'
        LIMIT 1;
    END IF;
    
    RETURN category_uuid;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Populate category_id column based on existing enum values
UPDATE expenses 
SET category_id = map_enum_to_category_id(category);

-- Step 4: Verify all expenses have category_id assigned
DO $$
DECLARE
    unassigned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unassigned_count
    FROM expenses
    WHERE category_id IS NULL;
    
    IF unassigned_count > 0 THEN
        RAISE EXCEPTION 'Found % expenses without category_id assigned', unassigned_count;
    END IF;
    
    RAISE NOTICE 'All expenses successfully mapped to category IDs';
END;
$$;

-- Step 5: Make category_id NOT NULL and drop old category column
ALTER TABLE expenses 
ALTER COLUMN category_id SET NOT NULL;

-- Step 6: Drop the old enum column (commented out for safety)
-- ALTER TABLE expenses DROP COLUMN category;

-- Step 7: Clean up the mapping function
DROP FUNCTION map_enum_to_category_id(expense_category);

-- Step 8: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_category_id 
ON expenses(category_id);

COMMIT;

-- Verification queries (run these after the script)
-- SELECT 'Expenses with categories' as check_type, COUNT(*) as count FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id;
-- SELECT 'Category distribution' as check_type, ec.name_fr, COUNT(*) as expense_count FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id GROUP BY ec.name_fr ORDER BY expense_count DESC;
