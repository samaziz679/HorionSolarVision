-- Creating fresh install script that matches actual database structure
-- Drop and recreate views that reference non-existent columns
DROP VIEW IF EXISTS recent_sales_detailed CASCADE;
DROP VIEW IF EXISTS current_stock_with_batches CASCADE;
DROP VIEW IF EXISTS current_stock CASCADE;
DROP VIEW IF EXISTS monthly_sales_summary CASCADE;
DROP VIEW IF EXISTS financial_summary CASCADE;
DROP VIEW IF EXISTS lot_status_view CASCADE;

-- Recreate views with correct column references
CREATE OR REPLACE VIEW current_stock AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.quantity,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.seuil_stock_bas,
    (p.quantity <= p.seuil_stock_bas) as is_low_stock,
    p.created_at,
    p.updated_at
FROM products p;

CREATE OR REPLACE VIEW current_stock_with_batches AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.quantity,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.seuil_stock_bas,
    COALESCE(purchased.total_purchased, 0) as total_purchased,
    COALESCE(sold.total_sold, 0) as total_sold,
    COALESCE(purchased.total_purchased, 0) - COALESCE(sold.total_sold, 0) as calculated_stock,
    (p.quantity <= p.seuil_stock_bas) as is_low_stock,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN (
    SELECT product_id, SUM(quantity) as total_purchased
    FROM purchases
    GROUP BY product_id
) purchased ON p.id = purchased.product_id
LEFT JOIN (
    SELECT product_id, SUM(quantity) as total_sold
    FROM sales
    GROUP BY product_id
) sold ON p.id = sold.product_id;

CREATE OR REPLACE VIEW recent_sales_detailed AS
SELECT 
    s.id,
    s.sale_date,
    p.name as product_name,
    p.type as product_type,
    s.quantity,
    s.unit_price,
    s.total,
    s.price_plan,
    c.name as client_name,
    c.phone as client_phone,
    up.full_name as created_by_name,
    s.notes
FROM sales s
LEFT JOIN products p ON s.product_id = p.id
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN user_profiles up ON s.created_by = up.user_id
ORDER BY s.sale_date DESC;

CREATE OR REPLACE VIEW monthly_sales_summary AS
SELECT 
    DATE_TRUNC('month', sale_date) as month,
    COUNT(*) as total_sales,
    SUM(total) as total_revenue,
    AVG(total) as avg_sale_amount,
    COUNT(DISTINCT client_id) as unique_clients,
    COUNT(DISTINCT product_id) as unique_products
FROM sales
GROUP BY DATE_TRUNC('month', sale_date)
ORDER BY month DESC;

CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', sale_date) as month,
    'revenue' as type,
    SUM(total) as total_amount
FROM sales
GROUP BY DATE_TRUNC('month', sale_date)
UNION ALL
SELECT 
    DATE_TRUNC('month', expense_date) as month,
    'expense' as type,
    SUM(amount) as total_amount
FROM expenses
GROUP BY DATE_TRUNC('month', expense_date)
ORDER BY month DESC, type;

CREATE OR REPLACE VIEW lot_status_view AS
SELECT 
    sl.id,
    sl.lot_number,
    p.name as product_name,
    s.name as supplier_name,
    sl.quantity_remaining,
    sl.received_date,
    sl.expiry_date,
    CASE 
        WHEN sl.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN sl.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING_SOON'
        WHEN sl.quantity_remaining = 0 THEN 'DEPLETED'
        ELSE 'ACTIVE'
    END as status,
    (sl.expiry_date - CURRENT_DATE)::integer as days_to_expiry
FROM stock_lots sl
LEFT JOIN products p ON sl.product_id = p.id
LEFT JOIN suppliers s ON sl.supplier_id = s.id
ORDER BY sl.expiry_date ASC;

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON purchases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON stock_lots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON stock_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON bank_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON user_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON user_roles FOR ALL USING (auth.role() = 'authenticated');
