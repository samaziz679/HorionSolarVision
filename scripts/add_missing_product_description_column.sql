-- Add missing description column to products table
-- This column is used by the product forms but missing from the actual database

-- Add the description column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS description text;

-- Update the current_stock view to include description (if it exists)
CREATE OR REPLACE VIEW public.current_stock_with_batches AS
SELECT 
  p.id,
  p.name,
  p.type,
  p.description,
  p.prix_achat,
  p.prix_vente_detail_1,
  p.prix_vente_detail_2,
  p.prix_vente_gros,
  p.seuil_stock_bas,
  p.quantity,
  p.created_at,
  p.updated_at,
  CASE 
    WHEN p.quantity = 0 THEN true
    WHEN p.quantity <= p.seuil_stock_bas THEN true
    ELSE false
  END as is_low_stock
FROM products p;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Description column added to products table successfully' as status;
