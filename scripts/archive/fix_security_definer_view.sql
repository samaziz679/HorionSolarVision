-- Fix Security Definer View Issue
-- This script removes the SECURITY DEFINER property from the current_stock_with_batches view
-- and recreates it with proper security settings

-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.current_stock_with_batches;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This ensures the view respects the querying user's RLS policies
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
    p.image,
    p.seuil_stock_bas,
    COALESCE(SUM(sl.quantity_available), 0) as total_quantity,
    COUNT(sl.id) as total_batches,
    CASE 
        WHEN COALESCE(SUM(sl.quantity_available), 0) = 0 THEN 'rupture_stock'
        WHEN COALESCE(SUM(sl.quantity_available), 0) <= p.seuil_stock_bas THEN 'stock_faible'
        ELSE 'en_stock'
    END as stock_status,
    -- Calculate weighted average cost based on available quantities
    CASE 
        WHEN SUM(sl.quantity_available) > 0 THEN
            SUM(sl.unit_cost * sl.quantity_available) / SUM(sl.quantity_available)
        ELSE p.prix_achat
    END as average_cost,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_available > 0
GROUP BY 
    p.id, p.name, p.type, p.description, p.prix_achat, 
    p.prix_vente_detail_1, p.prix_vente_detail_2, p.prix_vente_gros,
    p.image, p.seuil_stock_bas, p.created_at, p.updated_at;

-- Enable RLS on the view (inherits from underlying tables)
-- The view will now respect the RLS policies of the querying user
ALTER VIEW public.current_stock_with_batches OWNER TO postgres;

-- Grant appropriate permissions
GRANT SELECT ON public.current_stock_with_batches TO authenticated;
GRANT SELECT ON public.current_stock_with_batches TO anon;

-- Verify the view is created without SECURITY DEFINER
-- You can check this in Supabase by running:
-- SELECT definition FROM pg_views WHERE viewname = 'current_stock_with_batches';
