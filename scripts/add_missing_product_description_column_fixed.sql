-- Add missing description column to products table
-- This column is used by the product forms but missing from the actual database

-- Add the description column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS description text;

-- Drop existing view if it exists to avoid conflicts
DROP VIEW IF EXISTS public.current_stock_with_batches CASCADE;

-- Recreate the view with the new description column
CREATE VIEW public.current_stock_with_batches AS
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
  p.created_by,
  CASE 
    WHEN p.quantity = 0 THEN true
    WHEN p.quantity <= p.seuil_stock_bas THEN true
    ELSE false
  END as is_low_stock
FROM products p;

-- Grant necessary permissions on the view
GRANT SELECT ON public.current_stock_with_batches TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Description column added to products table successfully' as status;
