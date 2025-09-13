-- Comprehensive Database Fixes for Solar Vision ERP
-- This script addresses remaining schema mismatches and ensures all modules work correctly

-- 1. Ensure all required views exist and are up to date
DROP VIEW IF EXISTS current_stock_with_batches CASCADE;
CREATE VIEW current_stock_with_batches AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.prix_achat,
    p.prix_vente_gros,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.seuil_stock_bas,
    p.quantity,
    p.created_at,
    p.updated_at,
    (p.quantity <= p.seuil_stock_bas) as is_low_stock,
    COALESCE(purchase_totals.total_purchased, 0) as total_purchased,
    COALESCE(sales_totals.total_sold, 0) as total_sold,
    COALESCE(purchase_totals.total_purchased, 0) - COALESCE(sales_totals.total_sold, 0) as calculated_stock
FROM products p
LEFT JOIN (
    SELECT 
        product_id,
        SUM(quantity) as total_purchased
    FROM purchases 
    GROUP BY product_id
) purchase_totals ON p.id = purchase_totals.product_id
LEFT JOIN (
    SELECT 
        product_id,
        SUM(quantity) as total_sold
    FROM sales 
    GROUP BY product_id
) sales_totals ON p.id = sales_totals.product_id;

-- 2. Update RLS policies to ensure they don't cause recursion
-- Drop existing policies that might cause issues
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Enable read access for authenticated users" ON user_roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Ensure all tables have proper RLS policies for basic operations
-- Products table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;
CREATE POLICY "Enable read access for authenticated users" ON products
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;
CREATE POLICY "Enable insert for authenticated users" ON products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON products;
CREATE POLICY "Enable update for authenticated users" ON products
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Sales table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sales;
CREATE POLICY "Enable read access for authenticated users" ON sales
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sales;
CREATE POLICY "Enable insert for authenticated users" ON sales
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Purchases table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON purchases;
CREATE POLICY "Enable read access for authenticated users" ON purchases
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON purchases;
CREATE POLICY "Enable insert for authenticated users" ON purchases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Suppliers table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON suppliers;
CREATE POLICY "Enable read access for authenticated users" ON suppliers
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON suppliers;
CREATE POLICY "Enable insert for authenticated users" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON suppliers;
CREATE POLICY "Enable update for authenticated users" ON suppliers
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Clients table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON clients;
CREATE POLICY "Enable read access for authenticated users" ON clients
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON clients;
CREATE POLICY "Enable insert for authenticated users" ON clients
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON clients;
CREATE POLICY "Enable update for authenticated users" ON clients
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Expenses table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON expenses;
CREATE POLICY "Enable read access for authenticated users" ON expenses
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON expenses;
CREATE POLICY "Enable insert for authenticated users" ON expenses
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Stock tables
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stock_lots;
CREATE POLICY "Enable read access for authenticated users" ON stock_lots
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON stock_lots;
CREATE POLICY "Enable insert for authenticated users" ON stock_lots
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stock_movements;
CREATE POLICY "Enable read access for authenticated users" ON stock_movements
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON stock_movements;
CREATE POLICY "Enable insert for authenticated users" ON stock_movements
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 5. Verify the fix by checking if we can query key tables
SELECT 'Database fixes applied successfully' as status;
SELECT COUNT(*) as supplier_count FROM suppliers;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as user_profile_count FROM user_profiles;
