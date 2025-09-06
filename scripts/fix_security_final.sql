-- Fix security issues with accurate column references
-- Enable RLS on company_settings and recreate views with SECURITY INVOKER

-- 1. Enable RLS on company_settings table
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for company_settings (admin only access)
CREATE POLICY "Admin can manage company settings" ON company_settings
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- 3. Drop and recreate problematic views with SECURITY INVOKER

-- Drop existing views
DROP VIEW IF EXISTS current_stock CASCADE;
DROP VIEW IF EXISTS financial_summary CASCADE;
DROP VIEW IF EXISTS total_sales_per_product CASCADE;

-- Recreate current_stock view with SECURITY INVOKER
CREATE VIEW current_stock 
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
FROM products p;

-- Recreate financial_summary view with SECURITY INVOKER
CREATE VIEW financial_summary 
WITH (security_invoker = true) AS
SELECT 
    DATE(e.expense_date) as date,
    COALESCE(SUM(CASE WHEN e.amount > 0 THEN e.amount END), 0) as total_deposits,
    COALESCE(SUM(CASE WHEN e.amount < 0 THEN ABS(e.amount) END), 0) as total_withdrawals,
    COALESCE(SUM(e.amount), 0) as net_flow
FROM expenses e
GROUP BY DATE(e.expense_date)
ORDER BY date DESC;

-- Recreate total_sales_per_product view with SECURITY INVOKER
CREATE VIEW total_sales_per_product 
WITH (security_invoker = true) AS
SELECT 
    p.name as product_name,
    COALESCE(SUM(s.quantity_sold), 0)::bigint as total_quantity_sold,
    COALESCE(SUM(s.total_price), 0) as total_revenue
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- Grant appropriate permissions
GRANT SELECT ON current_stock TO authenticated;
GRANT SELECT ON financial_summary TO authenticated;
GRANT SELECT ON total_sales_per_product TO authenticated;
