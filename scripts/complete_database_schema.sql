-- =====================================================
-- Solar Vision ERP - Complete Database Schema
-- =====================================================
-- This script creates the complete database schema for Solar Vision ERP
-- including all tables, views, functions, and batch tracking system
-- 
-- Run this script on a fresh Supabase project to set up the entire system
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles for RBAC
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'vendeur');

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'vendeur',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Company settings
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tagline TEXT,
    logo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0,
    prix_achat DECIMAL(10,2) DEFAULT 0,
    prix_vente_detail_1 DECIMAL(10,2) DEFAULT 0,
    prix_vente_detail_2 DECIMAL(10,2) DEFAULT 0,
    prix_vente_gros DECIMAL(10,2) DEFAULT 0,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- BATCH TRACKING SYSTEM
-- =====================================================

-- Stock lots table for batch tracking
CREATE TABLE IF NOT EXISTS stock_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    lot_number VARCHAR(50) NOT NULL, -- Auto-generated lot number (e.g., LOT-2025-001)
    quantity_received INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER NOT NULL DEFAULT 0, -- Remaining quantity after sales
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ, -- Optional expiry date for products
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Ensure lot numbers are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_lots_lot_number ON stock_lots(lot_number);

-- Stock movements table for tracking all inventory changes
CREATE TYPE movement_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');
CREATE TYPE reference_type AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT');

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_lot_id UUID NOT NULL REFERENCES stock_lots(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type movement_type NOT NULL,
    reference_type reference_type NOT NULL,
    reference_id UUID, -- Can reference purchases, sales, etc.
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- BUSINESS TRANSACTIONS
-- =====================================================

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Expense categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_french VARCHAR(100) NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO expense_categories (name_french, name_english) VALUES
('Transport', 'transport'),
('Alimentation', 'alimentation'),
('Logement', 'logement'),
('Santé', 'sante'),
('Éducation', 'education'),
('Divertissement', 'divertissement'),
('Vêtements', 'vetements'),
('Services publics', 'services_publics'),
('Assurance', 'assurance'),
('Épargne', 'epargne'),
('Dettes', 'dettes'),
('Cadeaux', 'cadeaux'),
('Divers', 'divers')
ON CONFLICT DO NOTHING;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES expense_categories(id),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    expense_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Bank entries table
CREATE TABLE IF NOT EXISTS bank_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    entry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- VIEWS FOR ANALYTICS AND REPORTING
-- =====================================================

-- Current stock view with batch information
CREATE OR REPLACE VIEW current_stock_with_batches AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.type,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.image,
    COALESCE(SUM(sl.quantity_available), 0) as total_quantity,
    COUNT(sl.id) as total_batches,
    COALESCE(AVG(sl.unit_cost), p.prix_achat) as avg_cost,
    MIN(sl.purchase_date) as oldest_batch_date,
    MAX(sl.purchase_date) as newest_batch_date,
    -- Updated stock status values to French
    CASE 
        WHEN COALESCE(SUM(sl.quantity_available), 0) = 0 THEN 'rupture_stock'
        WHEN COALESCE(SUM(sl.quantity_available), 0) <= 10 THEN 'stock_faible'
        ELSE 'en_stock'
    END as stock_status
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_available > 0
GROUP BY p.id, p.name, p.type, p.prix_achat, p.prix_vente_detail_1, p.prix_vente_detail_2, p.prix_vente_gros, p.image;

-- Legacy current stock view for backward compatibility
CREATE OR REPLACE VIEW current_stock AS
SELECT 
    product_id,
    product_name,
    type,
    prix_achat,
    prix_vente_detail_1,
    prix_vente_detail_2,
    prix_vente_gros,
    image,
    total_quantity as quantity,
    avg_cost,
    stock_status
FROM current_stock_with_batches;

-- =====================================================
-- FUNCTIONS FOR BATCH TRACKING
-- =====================================================

-- Function to generate lot numbers
CREATE OR REPLACE FUNCTION generate_lot_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    lot_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(lot_number FROM 'LOT-' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM stock_lots
    WHERE lot_number LIKE 'LOT-' || year_part || '-%';
    
    lot_number := 'LOT-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN lot_number;
END;
$$ LANGUAGE plpgsql;

-- Function to create stock lot from purchase
CREATE OR REPLACE FUNCTION create_stock_lot_from_purchase()
RETURNS TRIGGER AS $$
DECLARE
    lot_num TEXT;
BEGIN
    -- Generate lot number
    lot_num := generate_lot_number();
    
    -- Create stock lot
    INSERT INTO stock_lots (
        product_id,
        purchase_id,
        lot_number,
        quantity_received,
        quantity_available,
        unit_cost,
        purchase_date,
        created_by
    ) VALUES (
        NEW.product_id,
        NEW.id,
        lot_num,
        NEW.quantity,
        NEW.quantity,
        NEW.unit_price,
        NEW.purchase_date,
        NEW.created_by
    );
    
    -- Create stock movement record
    INSERT INTO stock_movements (
        stock_lot_id,
        product_id,
        movement_type,
        reference_type,
        reference_id,
        quantity,
        unit_cost,
        notes,
        created_by
    ) VALUES (
        (SELECT id FROM stock_lots WHERE lot_number = lot_num),
        NEW.product_id,
        'IN',
        'PURCHASE',
        NEW.id,
        NEW.quantity,
        NEW.unit_price,
        'Stock lot created from purchase',
        NEW.created_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create stock lots when purchases are made
DROP TRIGGER IF EXISTS trigger_create_stock_lot_from_purchase ON purchases;
CREATE TRIGGER trigger_create_stock_lot_from_purchase
    AFTER INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION create_stock_lot_from_purchase();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_entries ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (authenticated users can access all data)
-- Note: Implement more restrictive policies based on user roles as needed

CREATE POLICY "Authenticated users can view user profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view user roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view company settings" ON company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage company settings" ON company_settings FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage clients" ON clients FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON suppliers FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view stock lots" ON stock_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stock lots" ON stock_lots FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view stock movements" ON stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stock movements" ON stock_movements FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view purchases" ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchases" ON purchases FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON sales FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view expense categories" ON expense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage expense categories" ON expense_categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage expenses" ON expenses FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view bank entries" ON bank_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage bank entries" ON bank_entries FOR ALL TO authenticated USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);

-- Stock lots indexes
CREATE INDEX IF NOT EXISTS idx_stock_lots_product_id ON stock_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_purchase_id ON stock_lots(purchase_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_purchase_date ON stock_lots(purchase_date);
CREATE INDEX IF NOT EXISTS idx_stock_lots_quantity_available ON stock_lots(quantity_available);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_stock_lot_id ON stock_movements(stock_lot_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_id ON stock_movements(reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON sales(created_by);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_created_by ON purchases(created_by);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Solar Vision ERP database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Set up your Supabase environment variables in your application';
    RAISE NOTICE '2. Configure authentication settings in Supabase dashboard';
    RAISE NOTICE '3. Create your first admin user through the application';
    RAISE NOTICE '4. Upload company logo and configure settings';
END $$;
