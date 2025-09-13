-- Add missing image column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;

-- Update the products view to include the image column
DROP VIEW IF EXISTS current_stock_with_batches CASCADE;

CREATE OR REPLACE VIEW current_stock_with_batches AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.image,
    p.type,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.seuil_stock_bas,
    p.quantity,
    p.created_at,
    p.updated_at,
    p.created_by,
    COALESCE(SUM(sl.quantity_remaining), 0) as total_stock,
    COUNT(sl.id) as batch_count,
    MIN(sl.expiry_date) as earliest_expiry,
    MAX(sl.created_at) as latest_batch_date
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_remaining > 0
GROUP BY p.id, p.name, p.description, p.image, p.type, p.prix_achat, 
         p.prix_vente_detail_1, p.prix_vente_detail_2, p.prix_vente_gros, 
         p.seuil_stock_bas, p.quantity, p.created_at, p.updated_at, p.created_by;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Image column added to products table successfully' as status;
