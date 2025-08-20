-- Clear existing problematic views and rebuild analytics system from scratch
-- This addresses the disconnected financial data in reports

-- Drop existing views that are not working correctly
DROP VIEW IF EXISTS current_stock CASCADE;
DROP VIEW IF EXISTS financial_summary CASCADE;
DROP VIEW IF EXISTS total_sales_per_product CASCADE;
DROP VIEW IF EXISTS monthly_expenses CASCADE;

-- Create current_stock view with correct product data and better stock status logic
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
        WHEN p.quantity = 0 THEN 'Critique'
        WHEN p.quantity <= COALESCE(p.seuil_stock_bas, 5) THEN 'Bas'
        ELSE 'Normal'
    END as stock_status
FROM products p
WHERE p.quantity IS NOT NULL;

-- Create financial_summary view with monthly aggregations using correct date format
CREATE VIEW financial_summary AS
SELECT 
    TO_CHAR(DATE_TRUNC('month', s.sale_date), 'YYYY-MM') as month,
    SUM(s.total) as total_revenue,
    COUNT(s.id) as total_sales,
    COUNT(DISTINCT s.client_id) as unique_clients
FROM sales s
WHERE s.sale_date IS NOT NULL
GROUP BY DATE_TRUNC('month', s.sale_date)
ORDER BY DATE_TRUNC('month', s.sale_date) DESC;

-- Create total_sales_per_product view with product performance metrics
CREATE VIEW total_sales_per_product AS
SELECT 
    p.name as product_name,
    SUM(s.quantity) as total_quantity_sold,
    SUM(s.total) as total_revenue,
    COUNT(s.id) as total_orders,
    ROUND(AVG(s.total), 2) as avg_order_value
FROM sales s
JOIN products p ON s.product_id = p.id
WHERE s.sale_date IS NOT NULL
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- Create monthly expenses view with proper date formatting
CREATE VIEW monthly_expenses AS
SELECT 
    TO_CHAR(DATE_TRUNC('month', e.expense_date), 'YYYY-MM') as month,
    SUM(e.amount) as total_expenses,
    COUNT(e.id) as expense_count
FROM expenses e
WHERE e.expense_date IS NOT NULL
GROUP BY DATE_TRUNC('month', e.expense_date)
ORDER BY DATE_TRUNC('month', e.expense_date) DESC;

-- Create client performance view for top clients analysis
CREATE VIEW client_performance AS
SELECT 
    c.name as client_name,
    SUM(s.total) as total_spent,
    COUNT(s.id) as order_count,
    ROUND(AVG(s.total), 2) as avg_order_value,
    MAX(s.sale_date) as last_order_date
FROM sales s
JOIN clients c ON s.client_id = c.id
WHERE s.sale_date IS NOT NULL
GROUP BY c.id, c.name
ORDER BY total_spent DESC;

-- Grant appropriate permissions to all views
GRANT SELECT ON current_stock TO authenticated;
GRANT SELECT ON financial_summary TO authenticated;
GRANT SELECT ON total_sales_per_product TO authenticated;
GRANT SELECT ON monthly_expenses TO authenticated;
GRANT SELECT ON client_performance TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
