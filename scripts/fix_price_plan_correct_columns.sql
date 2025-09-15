-- Fix price_plan column type conversion with correct column references
DO $$
DECLARE
    existing_values text[];
BEGIN
    -- Get existing price_plan values
    SELECT ARRAY_AGG(DISTINCT price_plan::text) INTO existing_values 
    FROM sales 
    WHERE price_plan IS NOT NULL;
    
    -- Drop the existing view that depends on price_plan
    DROP VIEW IF EXISTS recent_sales_detailed CASCADE;
    
    -- Create enum with existing values plus common ones
    DO $enum$ 
    BEGIN
        -- Drop enum if exists
        DROP TYPE IF EXISTS price_plan_enum CASCADE;
        
        -- Create new enum with all possible values
        CREATE TYPE price_plan_enum AS ENUM (
            'detail_1', 'detail_2', 'gros', 'wholesale', 'retail'
        );
    EXCEPTION WHEN duplicate_object THEN
        -- Enum already exists, continue
        NULL;
    END $enum$;
    
    -- Convert price_plan column safely
    -- First add new column
    ALTER TABLE sales ADD COLUMN price_plan_new price_plan_enum;
    
    -- Convert existing data with safe mapping
    UPDATE sales SET price_plan_new = 
        CASE 
            WHEN price_plan::text ILIKE '%detail%1%' OR price_plan::text = 'detail_1' THEN 'detail_1'::price_plan_enum
            WHEN price_plan::text ILIKE '%detail%2%' OR price_plan::text = 'detail_2' THEN 'detail_2'::price_plan_enum
            WHEN price_plan::text ILIKE '%gros%' OR price_plan::text = 'gros' THEN 'gros'::price_plan_enum
            WHEN price_plan::text ILIKE '%wholesale%' THEN 'wholesale'::price_plan_enum
            WHEN price_plan::text ILIKE '%retail%' THEN 'retail'::price_plan_enum
            ELSE 'detail_1'::price_plan_enum -- default fallback
        END;
    
    -- Drop old column and rename new one
    ALTER TABLE sales DROP COLUMN price_plan;
    ALTER TABLE sales RENAME COLUMN price_plan_new TO price_plan;
    
    -- Set NOT NULL constraint
    ALTER TABLE sales ALTER COLUMN price_plan SET NOT NULL;
    
    -- Recreate the recent_sales_detailed view with correct column references
    CREATE OR REPLACE VIEW recent_sales_detailed AS
    SELECT 
        s.id,
        s.sale_date,
        s.quantity,
        s.unit_price,
        s.total,
        s.price_plan,
        s.notes,
        p.name as product_name,
        p.type as product_type,
        c.name as client_name,
        c.phone as client_phone,
        COALESCE(up.full_name, u.email) as created_by_name
    FROM sales s
    LEFT JOIN products p ON s.product_id = p.id
    LEFT JOIN clients c ON s.client_id = c.id
    LEFT JOIN auth.users u ON s.created_by = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ORDER BY s.sale_date DESC;
    
    -- Fix any remaining foreign key constraints to reference auth.users
    -- Check if constraints exist before trying to drop them
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sales_created_by_fkey' 
        AND table_name = 'sales'
    ) THEN
        ALTER TABLE sales DROP CONSTRAINT sales_created_by_fkey;
    END IF;
    
    -- Add correct foreign key constraint
    ALTER TABLE sales ADD CONSTRAINT sales_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    
    -- Fix stock_movements table if it has similar issues
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_movements_created_by_fkey' 
        AND table_name = 'stock_movements'
    ) THEN
        ALTER TABLE stock_movements DROP CONSTRAINT stock_movements_created_by_fkey;
    END IF;
    
    ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    
    RAISE NOTICE 'Price plan enum conversion completed successfully';
    
END $$;
