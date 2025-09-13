-- Refresh PostgREST schema cache and fix any remaining quantity_available references
-- This will resolve the PGRST204 errors when deleting purchases

-- First, let's refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Drop and recreate any views that might still reference quantity_available
DROP VIEW IF EXISTS inventory_with_batches CASCADE;
DROP VIEW IF EXISTS stock_summary CASCADE;
DROP VIEW IF EXISTS product_stock_summary CASCADE;

-- Recreate the inventory view with correct column names
CREATE OR REPLACE VIEW inventory_with_batches AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.image,
    p.unit,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    COALESCE(SUM(sl.quantity_remaining), 0) as total_quantity,
    COUNT(sl.id) as batch_count,
    CASE 
        WHEN COALESCE(SUM(sl.quantity_remaining), 0) = 0 THEN 'Critical'
        WHEN COALESCE(SUM(sl.quantity_remaining), 0) <= 10 THEN 'Low'
        ELSE 'Good'
    END as stock_status,
    CASE 
        WHEN COUNT(sl.id) > 0 THEN 
            SUM(sl.quantity_remaining * sl.unit_cost) / NULLIF(SUM(sl.quantity_remaining), 0)
        ELSE p.prix_achat
    END as average_cost
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_remaining > 0
GROUP BY p.id, p.name, p.description, p.image, p.unit, p.prix_achat, p.prix_vente_detail_1, p.prix_vente_detail_2, p.prix_vente_gros;

-- Create stock summary view
CREATE OR REPLACE VIEW stock_summary AS
SELECT 
    sl.id,
    sl.product_id,
    sl.purchase_id,
    sl.lot_number,
    sl.quantity_received,
    sl.quantity_remaining,
    sl.unit_cost,
    sl.purchase_date,
    sl.expiry_date,
    sl.created_at,
    p.name as product_name,
    s.name as supplier_name
FROM stock_lots sl
JOIN products p ON sl.product_id = p.id
LEFT JOIN purchases pur ON sl.purchase_id = pur.id
LEFT JOIN suppliers s ON pur.supplier_id = s.id
WHERE sl.quantity_remaining > 0
ORDER BY sl.purchase_date ASC, sl.created_at ASC;

-- Update any functions that might reference the old column
CREATE OR REPLACE FUNCTION get_available_stock(product_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(quantity_remaining) 
         FROM stock_lots 
         WHERE product_id = product_id_param 
         AND quantity_remaining > 0), 
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the stock allocation function
CREATE OR REPLACE FUNCTION allocate_stock_fifo(
    product_id_param UUID,
    quantity_needed INTEGER
) RETURNS TABLE(
    lot_id UUID,
    allocated_quantity INTEGER,
    unit_cost DECIMAL
) AS $$
DECLARE
    remaining_needed INTEGER := quantity_needed;
    lot_record RECORD;
BEGIN
    FOR lot_record IN 
        SELECT id, quantity_remaining, unit_cost
        FROM stock_lots 
        WHERE product_id = product_id_param 
        AND quantity_remaining > 0
        ORDER BY purchase_date ASC, created_at ASC
    LOOP
        IF remaining_needed <= 0 THEN
            EXIT;
        END IF;
        
        IF lot_record.quantity_remaining >= remaining_needed THEN
            -- This lot can fulfill the remaining need
            lot_id := lot_record.id;
            allocated_quantity := remaining_needed;
            unit_cost := lot_record.unit_cost;
            remaining_needed := 0;
            RETURN NEXT;
        ELSE
            -- Use all available from this lot
            lot_id := lot_record.id;
            allocated_quantity := lot_record.quantity_remaining;
            unit_cost := lot_record.unit_cost;
            remaining_needed := remaining_needed - lot_record.quantity_remaining;
            RETURN NEXT;
        END IF;
    END LOOP;
    
    -- If we still have remaining_needed > 0, there's insufficient stock
    IF remaining_needed > 0 THEN
        RAISE EXCEPTION 'Insufficient stock. Need % more units.', remaining_needed;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force a schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the fix by checking if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'stock_lots' 
        AND column_name = 'quantity_available'
    ) THEN
        RAISE NOTICE 'WARNING: quantity_available column still exists in stock_lots table';
    ELSE
        RAISE NOTICE 'SUCCESS: quantity_available column has been properly removed';
    END IF;
END $$;

-- Show current stock_lots table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'stock_lots'
ORDER BY ordinal_position;
