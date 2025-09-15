-- Fix Sales Module Constraints
-- This script addresses potential constraint issues in the sales module

-- 1. Fix any remaining quantity_available references in stock_lots
-- (This should already be fixed, but ensuring consistency)
DO $$
BEGIN
    -- Check if quantity_available column still exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stock_lots' 
        AND column_name = 'quantity_available'
    ) THEN
        ALTER TABLE stock_lots DROP COLUMN quantity_available;
    END IF;
END $$;

-- 2. Ensure price_plan enum exists and has correct values
DO $$
BEGIN
    -- Create price_plan enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_plan_enum') THEN
        CREATE TYPE price_plan_enum AS ENUM ('detail_1', 'detail_2', 'gros');
    END IF;
    
    -- Update sales table to use the enum properly
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' 
        AND column_name = 'price_plan'
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- The column already exists as USER-DEFINED, ensure it's the right enum
        ALTER TABLE sales ALTER COLUMN price_plan TYPE price_plan_enum USING price_plan::price_plan_enum;
    END IF;
END $$;

-- 3. Ensure all foreign key constraints are properly set
-- Check and fix sales table foreign keys
DO $$
BEGIN
    -- Ensure product_id foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'sales' 
        AND kcu.column_name = 'product_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT sales_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure client_id foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'sales' 
        AND kcu.column_name = 'client_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT sales_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure created_by foreign key references auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'sales' 
        AND kcu.column_name = 'created_by'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT sales_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Fix stock_movements table constraints
DO $$
BEGIN
    -- Ensure stock_movements references stock_lots properly
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'stock_movements' 
        AND kcu.column_name = 'lot_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Check if the column exists first
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'stock_movements' 
            AND column_name = 'lot_id'
        ) THEN
            ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_lot_id_fkey 
            FOREIGN KEY (lot_id) REFERENCES stock_lots(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Ensure created_by references auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'stock_movements' 
        AND kcu.column_name = 'created_by'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Add check constraints for data validation
DO $$
BEGIN
    -- Ensure quantity is positive
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'sales' 
        AND constraint_name = 'sales_quantity_positive'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT sales_quantity_positive CHECK (quantity > 0);
    END IF;
    
    -- Ensure unit_price is non-negative
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'sales' 
        AND constraint_name = 'sales_unit_price_non_negative'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT sales_unit_price_non_negative CHECK (unit_price >= 0);
    END IF;
    
    -- Ensure total is non-negative
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'sales' 
        AND constraint_name = 'sales_total_non_negative'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT sales_total_non_negative CHECK (total >= 0);
    END IF;
END $$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON sales(created_by);
CREATE INDEX IF NOT EXISTS idx_stock_movements_lot_id ON stock_movements(lot_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- 7. Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
