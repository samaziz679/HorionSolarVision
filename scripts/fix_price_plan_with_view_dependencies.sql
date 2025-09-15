-- Fix price_plan enum conversion while handling view dependencies safely
BEGIN;

-- Step 1: Create the enum type if it doesn't exist
DO $$ 
BEGIN
    -- Check existing price_plan values to create appropriate enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_plan_enum') THEN
        -- Get unique values from existing data
        CREATE TYPE price_plan_enum AS ENUM ('standard', 'premium', 'wholesale', 'retail');
    END IF;
END $$;

-- Step 2: Drop the dependent view temporarily
DROP VIEW IF EXISTS recent_sales_detailed CASCADE;

-- Step 3: Add new column with enum type
ALTER TABLE sales ADD COLUMN price_plan_new price_plan_enum;

-- Step 4: Convert existing data safely
UPDATE sales 
SET price_plan_new = CASE 
    WHEN LOWER(price_plan::text) LIKE '%premium%' THEN 'premium'::price_plan_enum
    WHEN LOWER(price_plan::text) LIKE '%wholesale%' THEN 'wholesale'::price_plan_enum
    WHEN LOWER(price_plan::text) LIKE '%retail%' THEN 'retail'::price_plan_enum
    ELSE 'standard'::price_plan_enum
END
WHERE price_plan IS NOT NULL;

-- Step 5: Drop old column and rename new one
ALTER TABLE sales DROP COLUMN price_plan;
ALTER TABLE sales RENAME COLUMN price_plan_new TO price_plan;

-- Step 6: Recreate the view with proper structure
CREATE VIEW recent_sales_detailed AS
SELECT 
    s.id,
    s.sale_number,
    s.customer_name,
    s.total_amount,
    s.price_plan,
    s.sale_date,
    s.created_at,
    s.created_by,
    COALESCE(u.email, 'Unknown') as created_by_email
FROM sales s
LEFT JOIN auth.users u ON s.created_by = u.id
ORDER BY s.created_at DESC
LIMIT 50;

-- Step 7: Fix any other foreign key constraints
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_created_by_fkey;
ALTER TABLE sales ADD CONSTRAINT sales_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS sale_items_created_by_fkey;
ALTER TABLE sale_items ADD CONSTRAINT sale_items_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Step 8: Update stock_movements references if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'stock_movements' 
               AND column_name = 'quantity_available') THEN
        -- Update any remaining references
        ALTER TABLE stock_movements RENAME COLUMN quantity_available TO quantity_remaining;
    END IF;
EXCEPTION
    WHEN undefined_column THEN
        -- Column doesn't exist, skip
        NULL;
END $$;

COMMIT;
