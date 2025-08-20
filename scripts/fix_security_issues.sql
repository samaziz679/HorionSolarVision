-- Fix security issues identified by Supabase Security Advisor

-- 1. Fix SECURITY DEFINER views by recreating them as SECURITY INVOKER
-- This ensures views use the permissions of the querying user, not the creator

-- Drop and recreate current_stock view
DROP VIEW IF EXISTS public.current_stock;
CREATE VIEW public.current_stock 
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.price_detail_1,
    p.price_detail_2,
    p.price_gros,
    CASE 
        WHEN p.quantity <= 5 THEN 'low'
        WHEN p.quantity <= 20 THEN 'medium'
        ELSE 'high'
    END as stock_level
FROM products p;

-- Drop and recreate financial_summary view
DROP VIEW IF EXISTS public.financial_summary;
CREATE VIEW public.financial_summary 
WITH (security_invoker = true) AS
SELECT 
    EXTRACT(MONTH FROM s.sale_date) as month,
    EXTRACT(YEAR FROM s.sale_date) as year,
    SUM(s.total_amount) as total_revenue,
    COUNT(s.id) as total_sales,
    AVG(s.total_amount) as avg_sale_amount
FROM sales s
WHERE s.sale_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY EXTRACT(YEAR FROM s.sale_date), EXTRACT(MONTH FROM s.sale_date)
ORDER BY year DESC, month DESC;

-- Drop and recreate total_sales_per_product view
DROP VIEW IF EXISTS public.total_sales_per_product;
CREATE VIEW public.total_sales_per_product 
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.name as product_name,
    COALESCE(SUM(s.quantity), 0) as total_quantity_sold,
    COALESCE(SUM(s.total_amount), 0) as total_revenue
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- 2. Enable RLS on company_settings table
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_settings
-- Only admins can view and modify company settings
CREATE POLICY "Admins can view company settings" ON public.company_settings
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update company settings" ON public.company_settings
    FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert company settings" ON public.company_settings
    FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete company settings" ON public.company_settings
    FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Grant necessary permissions
GRANT SELECT ON public.current_stock TO authenticated;
GRANT SELECT ON public.financial_summary TO authenticated;
GRANT SELECT ON public.total_sales_per_product TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
