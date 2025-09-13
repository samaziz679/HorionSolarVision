-- Add missing purchase_date column to stock_lots table
ALTER TABLE stock_lots ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Update existing stock_lots with purchase dates from their associated purchases
UPDATE stock_lots 
SET purchase_date = p.purchase_date::date
FROM purchases p 
WHERE stock_lots.purchase_id = p.id 
AND stock_lots.purchase_date IS NULL;

-- Drop and recreate the current_stock_with_batches view with correct column names
DROP VIEW IF EXISTS current_stock_with_batches CASCADE;

CREATE VIEW current_stock_with_batches AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.description,
    p.image,
    p.unit,
    p.quantity,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.seuil_stock_bas,
    p.created_at,
    p.updated_at,
    p.created_by,
    CASE WHEN p.quantity <= p.seuil_stock_bas THEN true ELSE false END as is_low_stock,
    COALESCE(SUM(sl.quantity_remaining), 0) as total_stock,
    COUNT(sl.id) as batch_count,
    MIN(sl.expiry_date) as earliest_expiry,
    MAX(sl.received_date) as latest_batch_date
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id
GROUP BY p.id, p.name, p.type, p.description, p.image, p.unit, p.quantity, 
         p.prix_achat, p.prix_vente_detail_1, p.prix_vente_detail_2, 
         p.prix_vente_gros, p.seuil_stock_bas, p.created_at, p.updated_at, p.created_by;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Return success status
SELECT 
    'Stock lots purchase_date column added successfully' as status,
    COUNT(*) as updated_lots_count
FROM stock_lots 
WHERE purchase_date IS NOT NULL;
