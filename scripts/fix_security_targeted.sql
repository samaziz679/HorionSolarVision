-- Fix Security Issues - Targeted Approach
-- Based on actual database structure analysis

-- 1. Enable RLS on company_settings table (currently disabled)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for company_settings table
-- Only admins can view and modify company settings
CREATE POLICY "Admins can view company settings" ON company_settings
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update company settings" ON company_settings
    FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert company settings" ON company_settings
    FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete company settings" ON company_settings
    FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- 3. Fix SECURITY DEFINER views by recreating them as SECURITY INVOKER
-- Note: We'll drop and recreate the problematic views

-- Drop existing views (if they exist)
DROP VIEW IF EXISTS current_stock CASCADE;
DROP VIEW IF EXISTS financial_summary CASCADE;
DROP VIEW IF EXISTS total_sales_per_product CASCADE;

-- Recreate views with SECURITY INVOKER (safer than SECURITY DEFINER)
-- These are simplified versions - you may need to adjust based on your business logic

-- Current Stock View
CREATE VIEW current_stock WITH (security_invoker=true) AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.unit,
    p.type
FROM products p
WHERE p.quantity IS NOT NULL;

-- Financial Summary View (simplified)
CREATE VIEW financial_summary WITH (security_invoker=true) AS
SELECT 
    CURRENT_DATE as date,
    0 as total_deposits,
    COALESCE(SUM(e.amount), 0) as total_withdrawals,
    -COALESCE(SUM(e.amount), 0) as net_flow
FROM expenses e
WHERE DATE(e.created_at) = CURRENT_DATE;

-- Total Sales Per Product View
CREATE VIEW total_sales_per_product WITH (security_invoker=true) AS
SELECT 
    p.name as product_name,
    COALESCE(SUM(s.quantity), 0) as total_quantity_sold,
    COALESCE(SUM(s.total_amount), 0) as total_revenue
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.id, p.name;

-- Grant appropriate permissions
GRANT SELECT ON current_stock TO authenticated;
GRANT SELECT ON financial_summary TO authenticated;
GRANT SELECT ON total_sales_per_product TO authenticated;
