-- Add missing purchase_date column to stock_lots table
-- This column is required for the bulk import functionality to work properly

-- Add the purchase_date column to stock_lots table
ALTER TABLE stock_lots 
ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Update existing stock_lots with purchase_date from their associated purchases
UPDATE stock_lots 
SET purchase_date = purchases.purchase_date::DATE
FROM purchases 
WHERE stock_lots.purchase_id = purchases.id 
AND stock_lots.purchase_date IS NULL;

-- Create index for better performance on purchase_date queries
CREATE INDEX IF NOT EXISTS idx_stock_lots_purchase_date ON stock_lots(purchase_date);

-- Update the current_stock_with_batches view to include purchase_date
DROP VIEW IF EXISTS current_stock_with_batches CASCADE;

CREATE VIEW current_stock_with_batches AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku,
    p.unit,
    p.selling_price_detail_1,
    p.selling_price_detail_2,
    p.selling_price_wholesale,
    p.description,
    p.image,
    COALESCE(SUM(sl.quantity_available), 0) as total_available,
    COALESCE(AVG(sl.unit_cost), 0) as average_cost,
    COUNT(sl.id) as lot_count,
    MAX(sl.purchase_date) as latest_purchase_date,
    MIN(sl.purchase_date) as earliest_purchase_date
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_available > 0
GROUP BY p.id, p.name, p.sku, p.unit, p.selling_price_detail_1, 
         p.selling_price_detail_2, p.selling_price_wholesale, p.description, p.image;

-- Enable RLS on stock_lots if not already enabled
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Return success status
SELECT 
    'Stock lots purchase_date column added successfully' as status,
    COUNT(*) as updated_stock_lots_count
FROM stock_lots 
WHERE purchase_date IS NOT NULL;
