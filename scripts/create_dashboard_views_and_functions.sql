-- Create views and functions for dashboard analytics

-- View for current stock levels with low stock alerts
CREATE OR REPLACE VIEW current_stock AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.seuil_stock_bas,
    CASE 
        WHEN p.quantity <= p.seuil_stock_bas THEN true 
        ELSE false 
    END as is_low_stock,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.prix_achat,
    p.type,
    p.created_at,
    p.updated_at
FROM products p;

-- View for monthly sales summary
CREATE OR REPLACE VIEW monthly_sales_summary AS
SELECT 
    DATE_TRUNC('month', s.sale_date) as month,
    COUNT(*) as total_sales,
    SUM(s.total) as total_revenue,
    AVG(s.total) as avg_sale_amount,
    COUNT(DISTINCT s.client_id) as unique_clients,
    COUNT(DISTINCT s.product_id) as unique_products
FROM sales s
GROUP BY DATE_TRUNC('month', s.sale_date)
ORDER BY month DESC;

-- View for recent sales with client and product details
CREATE OR REPLACE VIEW recent_sales_detailed AS
SELECT 
    s.id,
    s.sale_date,
    s.total,
    s.quantity,
    s.unit_price,
    s.price_plan,
    s.notes,
    c.name as client_name,
    c.phone as client_phone,
    p.name as product_name,
    p.type as product_type,
    up.full_name as created_by_name
FROM sales s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN products p ON s.product_id = p.id
LEFT JOIN user_profiles up ON s.created_by = up.user_id
ORDER BY s.sale_date DESC;

-- View for financial summary
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', date_col) as month,
    'sales' as type,
    SUM(amount) as total_amount
FROM (
    SELECT sale_date as date_col, total as amount FROM sales
) sales_data
GROUP BY DATE_TRUNC('month', date_col)

UNION ALL

SELECT 
    DATE_TRUNC('month', date_col) as month,
    'expenses' as type,
    -SUM(amount) as total_amount
FROM (
    SELECT expense_date as date_col, amount FROM expenses
) expense_data
GROUP BY DATE_TRUNC('month', date_col)

UNION ALL

SELECT 
    DATE_TRUNC('month', date_col) as month,
    'purchases' as type,
    -SUM(amount) as total_amount
FROM (
    SELECT purchase_date as date_col, total as amount FROM purchases
) purchase_data
GROUP BY DATE_TRUNC('month', date_col)

ORDER BY month DESC, type;

-- View for current stock with batches (if needed)
CREATE OR REPLACE VIEW current_stock_with_batches AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.seuil_stock_bas,
    CASE 
        WHEN p.quantity <= p.seuil_stock_bas THEN true 
        ELSE false 
    END as is_low_stock,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.prix_achat,
    p.type,
    p.created_at,
    p.updated_at,
    -- Calculate total purchased vs sold
    COALESCE(purchased.total_purchased, 0) as total_purchased,
    COALESCE(sold.total_sold, 0) as total_sold,
    COALESCE(purchased.total_purchased, 0) - COALESCE(sold.total_sold, 0) as calculated_stock
FROM products p
LEFT JOIN (
    SELECT 
        product_id, 
        SUM(quantity) as total_purchased
    FROM purchases 
    GROUP BY product_id
) purchased ON p.id = purchased.product_id
LEFT JOIN (
    SELECT 
        product_id, 
        SUM(quantity) as total_sold
    FROM sales 
    GROUP BY product_id
) sold ON p.id = sold.product_id;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_sales', (SELECT COUNT(*) FROM sales WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE)),
        'total_products', (SELECT COUNT(*) FROM products),
        'total_clients', (SELECT COUNT(*) FROM clients),
        'total_suppliers', (SELECT COUNT(*) FROM suppliers),
        'monthly_revenue', (SELECT COALESCE(SUM(total), 0) FROM sales WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE)),
        'low_stock_items', (SELECT COUNT(*) FROM current_stock WHERE is_low_stock = true),
        'recent_sales', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'client_name', client_name,
                    'product_name', product_name,
                    'total', total,
                    'sale_date', sale_date
                )
            )
            FROM (SELECT * FROM recent_sales_detailed LIMIT 10) recent
        ),
        'low_stock_products', (
            SELECT json_agg(
                json_build_object(
                    'name', name,
                    'quantity', quantity,
                    'seuil_stock_bas', seuil_stock_bas
                )
            )
            FROM current_stock 
            WHERE is_low_stock = true 
            LIMIT 10
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate monthly growth
CREATE OR REPLACE FUNCTION calculate_monthly_growth(metric_type TEXT)
RETURNS NUMERIC AS $$
DECLARE
    current_month NUMERIC;
    previous_month NUMERIC;
    growth_rate NUMERIC;
BEGIN
    IF metric_type = 'sales' THEN
        SELECT COALESCE(SUM(total), 0) INTO current_month
        FROM sales 
        WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE);
        
        SELECT COALESCE(SUM(total), 0) INTO previous_month
        FROM sales 
        WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND sale_date < DATE_TRUNC('month', CURRENT_DATE);
        
    ELSIF metric_type = 'clients' THEN
        SELECT COUNT(*) INTO current_month
        FROM clients 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
        
        SELECT COUNT(*) INTO previous_month
        FROM clients 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND created_at < DATE_TRUNC('month', CURRENT_DATE);
        
    ELSIF metric_type = 'products' THEN
        SELECT COUNT(*) INTO current_month
        FROM products 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
        
        SELECT COUNT(*) INTO previous_month
        FROM products 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND created_at < DATE_TRUNC('month', CURRENT_DATE);
    END IF;
    
    IF previous_month = 0 THEN
        RETURN CASE WHEN current_month > 0 THEN 100 ELSE 0 END;
    END IF;
    
    growth_rate := ((current_month - previous_month) / previous_month) * 100;
    RETURN ROUND(growth_rate, 1);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on views (inherit from base tables)
ALTER VIEW current_stock OWNER TO postgres;
ALTER VIEW monthly_sales_summary OWNER TO postgres;
ALTER VIEW recent_sales_detailed OWNER TO postgres;
ALTER VIEW financial_summary OWNER TO postgres;
ALTER VIEW current_stock_with_batches OWNER TO postgres;

-- Grant permissions
GRANT SELECT ON current_stock TO authenticated;
GRANT SELECT ON monthly_sales_summary TO authenticated;
GRANT SELECT ON recent_sales_detailed TO authenticated;
GRANT SELECT ON financial_summary TO authenticated;
GRANT SELECT ON current_stock_with_batches TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_monthly_growth(TEXT) TO authenticated;
