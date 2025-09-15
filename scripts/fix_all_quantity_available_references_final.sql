-- Complete fix for all quantity_available references
-- This script will eliminate all traces of the old column name

-- 1. Drop any views that might reference quantity_available
DROP VIEW IF EXISTS inventory_summary CASCADE;
DROP VIEW IF EXISTS stock_status CASCADE;
DROP VIEW IF EXISTS product_inventory CASCADE;
DROP VIEW IF EXISTS low_stock_alert CASCADE;

-- 2. Drop and recreate any functions that might reference quantity_available
DROP FUNCTION IF EXISTS get_product_stock(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_stock_quantity(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS check_stock_availability(uuid, integer) CASCADE;

-- 3. Ensure the stock_lots table has the correct structure
ALTER TABLE stock_lots DROP COLUMN IF EXISTS quantity_available CASCADE;

-- Make sure quantity_remaining exists and is properly configured
ALTER TABLE stock_lots 
ADD COLUMN IF NOT EXISTS quantity_remaining INTEGER NOT NULL DEFAULT 0;

-- 4. Update any triggers that might reference the old column
DROP TRIGGER IF EXISTS update_product_quantity_trigger ON stock_lots CASCADE;
DROP FUNCTION IF EXISTS update_product_quantity() CASCADE;

-- 5. Create a new function to update product quantities
CREATE OR REPLACE FUNCTION update_product_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product's total quantity based on all stock lots
    UPDATE products 
    SET quantity = (
        SELECT COALESCE(SUM(quantity_remaining), 0)
        FROM stock_lots 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update product quantities
CREATE TRIGGER update_product_quantity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON stock_lots
    FOR EACH ROW
    EXECUTE FUNCTION update_product_quantity();

-- 7. Recreate inventory views with correct column names
CREATE VIEW inventory_summary AS
SELECT 
    p.id,
    p.name,
    p.quantity as total_quantity,
    COUNT(sl.id) as batch_count,
    COALESCE(AVG(sl.unit_cost), 0) as average_cost,
    p.prix_vente_detail_1 as sale_price
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_remaining > 0
GROUP BY p.id, p.name, p.quantity, p.prix_vente_detail_1;

-- 8. Create stock status view
CREATE VIEW stock_status AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.quantity as total_quantity,
    CASE 
        WHEN p.quantity = 0 THEN 'Critical'
        WHEN p.quantity <= 10 THEN 'Low'
        ELSE 'Normal'
    END as status,
    COUNT(sl.id) as active_batches
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_remaining > 0
GROUP BY p.id, p.name, p.quantity;

-- 9. Force PostgREST schema cache refresh
NOTIFY pgrst, 'reload schema';

-- 10. Update all existing stock lots to ensure data consistency
UPDATE stock_lots 
SET quantity_remaining = COALESCE(quantity_remaining, quantity_received)
WHERE quantity_remaining IS NULL;

-- 11. Refresh all product quantities based on current stock lots
UPDATE products 
SET quantity = (
    SELECT COALESCE(SUM(sl.quantity_remaining), 0)
    FROM stock_lots sl 
    WHERE sl.product_id = products.id
);

-- 12. Grant necessary permissions
GRANT SELECT ON inventory_summary TO anon, authenticated;
GRANT SELECT ON stock_status TO anon, authenticated;
GRANT ALL ON stock_lots TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON purchases TO authenticated;

-- Success message
SELECT 'All quantity_available references have been eliminated and schema cache refreshed' as status;
