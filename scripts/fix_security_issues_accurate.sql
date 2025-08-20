-- Fix security issues identified by Supabase Security Advisor
-- Based on actual database schema and column names

-- 1. Enable RLS on company_settings table
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for company_settings
-- Allow all authenticated users to read company settings
CREATE POLICY "Allow authenticated users to read company settings" ON public.company_settings
    FOR SELECT TO authenticated
    USING (true);

-- Allow only admins to update company settings
CREATE POLICY "Allow admins to update company settings" ON public.company_settings
    FOR UPDATE TO authenticated
    USING (get_user_role(auth.uid()) = 'admin');

-- Allow only admins to insert company settings
CREATE POLICY "Allow admins to insert company settings" ON public.company_settings
    FOR INSERT TO authenticated
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- 3. Fix Security Definer Views by recreating them as Security Invoker

-- Drop existing views
DROP VIEW IF EXISTS public.current_stock CASCADE;
DROP VIEW IF EXISTS public.financial_summary CASCADE;
DROP VIEW IF EXISTS public.total_sales_per_product CASCADE;

-- Recreate current_stock view with SECURITY INVOKER
CREATE VIEW public.current_stock
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.unit,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.type
FROM products p
WHERE p.quantity IS NOT NULL;

-- Recreate financial_summary view with SECURITY INVOKER
CREATE VIEW public.financial_summary
WITH (security_invoker = true) AS
SELECT 
    DATE(created_at) as date,
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_deposits,
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_withdrawals,
    COALESCE(SUM(amount), 0) as net_flow
FROM expenses
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Recreate total_sales_per_product view with SECURITY INVOKER
CREATE VIEW public.total_sales_per_product
WITH (security_invoker = true) AS
SELECT 
    p.name as product_name,
    COALESCE(SUM(s.quantity), 0)::bigint as total_quantity_sold,
    COALESCE(SUM(s.total_amount), 0) as total_revenue
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- 4. Grant appropriate permissions on views
GRANT SELECT ON public.current_stock TO authenticated;
GRANT SELECT ON public.financial_summary TO authenticated;
GRANT SELECT ON public.total_sales_per_product TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW public.current_stock IS 'Secure view of current product stock levels';
COMMENT ON VIEW public.financial_summary IS 'Secure view of financial summary data';
COMMENT ON VIEW public.total_sales_per_product IS 'Secure view of sales performance by product';
COMMENT ON TABLE public.company_settings IS 'Company configuration settings with RLS enabled';
