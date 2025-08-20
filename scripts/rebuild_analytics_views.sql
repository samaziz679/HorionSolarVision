-- Clear existing problematic views and rebuild analytics system from scratch
-- This addresses the disconnected financial data in reports

-- Drop existing views that are not working correctly
DROP VIEW IF EXISTS current_stock CASCADE;
DROP VIEW IF EXISTS financial_summary CASCADE;
DROP VIEW IF EXISTS total_sales_per_product CASCADE;

-- Create current_stock view with correct product data
CREATE VIEW current_stock AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.unit,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.type,
    CASE 
        WHEN p.quantity <= COALESCE(p.seuil_stock_bas, 5) THEN 'Critique'
        WHEN p.quantity <= COALESCE(p.seuil_stock_bas, 5) * 2 THEN 'Bas'
        ELSE 'Normal'
    END as stock_status
FROM products p
WHERE p.quantity IS NOT NULL;

-- Create financial_summary view with monthly aggregations
CREATE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', s.sale_date) as month,
    SUM(s.total) as total_revenue,
    COUNT(s.id) as total_sales,
    COUNT(DISTINCT s.client_id) as unique_clients
FROM sales s
WHERE s.sale_date IS NOT NULL
GROUP BY DATE_TRUNC('month', s.sale_date)
ORDER BY month DESC;

-- Create total_sales_per_product view with product performance
CREATE VIEW total_sales_per_product AS
SELECT 
    p.name as product_name,
    SUM(s.quantity) as total_quantity_sold,
    SUM(s.total) as total_revenue,
    COUNT(s.id) as total_orders,
    AVG(s.total) as avg_order_value
FROM sales s
JOIN products p ON s.product_id = p.id
WHERE s.sale_date IS NOT NULL
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- Create monthly expenses view
CREATE VIEW monthly_expenses AS
SELECT 
    DATE_TRUNC('month', e.expense_date) as month,
    SUM(e.amount) as total_expenses,
    COUNT(e.id) as expense_count
FROM expenses e
WHERE e.expense_date IS NOT NULL
GROUP BY DATE_TRUNC('month', e.expense_date)
ORDER BY month DESC;

-- Grant appropriate permissions
GRANT SELECT ON current_stock TO authenticated;
GRANT SELECT ON financial_summary TO authenticated;
GRANT SELECT ON total_sales_per_product TO authenticated;
GRANT SELECT ON monthly_expenses TO authenticated;
