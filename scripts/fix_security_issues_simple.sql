-- Fix database security issues identified by Supabase Security Advisor
-- This script addresses RLS and view security issues

-- 1. Enable RLS on company_settings table
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policy for company_settings (allow all authenticated users)
DROP POLICY IF EXISTS "Allow authenticated users to manage company settings" ON public.company_settings;
CREATE POLICY "Allow authenticated users to manage company settings" 
ON public.company_settings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Drop existing views that have SECURITY DEFINER issues
DROP VIEW IF EXISTS public.current_stock CASCADE;
DROP VIEW IF EXISTS public.financial_summary CASCADE;
DROP VIEW IF EXISTS public.total_sales_per_product CASCADE;

-- 4. Recreate current_stock view with SECURITY INVOKER (safer)
CREATE OR REPLACE VIEW public.current_stock 
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.type
FROM products p
WHERE p.quantity IS NOT NULL;

-- 5. Recreate financial_summary view with SECURITY INVOKER
CREATE OR REPLACE VIEW public.financial_summary 
WITH (security_invoker = true) AS
SELECT 
    'current_month' as period,
    COALESCE(SUM(s.total_amount), 0) as total_revenue,
    COALESCE(SUM(e.amount), 0) as total_expenses,
    COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(e.amount), 0) as net_profit
FROM sales s
FULL OUTER JOIN expenses e ON DATE_TRUNC('month', s.sale_date) = DATE_TRUNC('month', e.expense_date)
WHERE DATE_TRUNC('month', COALESCE(s.sale_date, e.expense_date)) = DATE_TRUNC('month', CURRENT_DATE);

-- 6. Recreate total_sales_per_product view with SECURITY INVOKER
CREATE OR REPLACE VIEW public.total_sales_per_product 
WITH (security_invoker = true) AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    COUNT(s.id) as total_sales,
    COALESCE(SUM(s.total_amount), 0) as total_revenue
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.id, p.name;

-- 7. Grant appropriate permissions
GRANT SELECT ON public.current_stock TO authenticated;
GRANT SELECT ON public.financial_summary TO authenticated;
GRANT SELECT ON public.total_sales_per_product TO authenticated;

-- Security fix completed
-- All views now use SECURITY INVOKER instead of SECURITY DEFINER
-- RLS is enabled on company_settings table
-- Proper access policies are in place
