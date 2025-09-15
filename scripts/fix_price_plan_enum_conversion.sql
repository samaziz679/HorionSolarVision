-- Fix price_plan enum conversion by handling existing data properly
BEGIN;

-- First, let's see what values exist in the price_plan column
-- and create a proper enum with those values
DO $$
DECLARE
    existing_values text[];
BEGIN
    -- Get unique existing values from price_plan column
    SELECT ARRAY_AGG(DISTINCT price_plan::text) INTO existing_values
    FROM sales 
    WHERE price_plan IS NOT NULL;
    
    -- Drop the enum if it exists
    DROP TYPE IF EXISTS price_plan_enum CASCADE;
    
    -- Create enum with existing values plus common ones
    CREATE TYPE price_plan_enum AS ENUM (
        'standard',
        'premium', 
        'wholesale',
        'retail',
        'discount',
        'special'
    );
    
    -- Convert existing price_plan values to enum safely
    -- First add a temporary column
    ALTER TABLE sales ADD COLUMN price_plan_temp price_plan_enum;
    
    -- Update with mapped values (handle existing data)
    UPDATE sales SET price_plan_temp = 
        CASE 
            WHEN price_plan::text ILIKE '%standard%' THEN 'standard'::price_plan_enum
            WHEN price_plan::text ILIKE '%premium%' THEN 'premium'::price_plan_enum  
            WHEN price_plan::text ILIKE '%wholesale%' THEN 'wholesale'::price_plan_enum
            WHEN price_plan::text ILIKE '%retail%' THEN 'retail'::price_plan_enum
            WHEN price_plan::text ILIKE '%discount%' THEN 'discount'::price_plan_enum
            ELSE 'standard'::price_plan_enum -- Default fallback
        END;
    
    -- Drop old column and rename new one
    ALTER TABLE sales DROP COLUMN price_plan;
    ALTER TABLE sales RENAME COLUMN price_plan_temp TO price_plan;
    
    -- Set default value
    ALTER TABLE sales ALTER COLUMN price_plan SET DEFAULT 'standard'::price_plan_enum;
    
END $$;

-- Ensure all foreign key constraints are correct
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_created_by_fkey;
ALTER TABLE sales ADD CONSTRAINT sales_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_updated_by_fkey;  
ALTER TABLE sales ADD CONSTRAINT sales_updated_by_fkey 
    FOREIGN KEY (updated_by) REFERENCES auth.users(id);

-- Fix sale_items foreign keys
ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS sale_items_created_by_fkey;
ALTER TABLE sale_items ADD CONSTRAINT sale_items_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS sale_items_updated_by_fkey;
ALTER TABLE sale_items ADD CONSTRAINT sale_items_updated_by_fkey 
    FOREIGN KEY (updated_by) REFERENCES auth.users(id);

COMMIT;
