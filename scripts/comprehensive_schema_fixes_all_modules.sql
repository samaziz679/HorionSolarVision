-- Comprehensive Schema Fixes for All Modules
-- This script adds all missing columns that are referenced in the application code but don't exist in the database

BEGIN;

-- Fix Products table - add missing columns
DO $$ 
BEGIN
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;
    
    -- Add image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
        ALTER TABLE products ADD COLUMN image TEXT;
    END IF;
    
    -- Add unit column if it doesn't exist (referenced in product form)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit') THEN
        ALTER TABLE products ADD COLUMN unit VARCHAR(50);
    END IF;
END $$;

-- Fix Expenses table - add missing columns
DO $$ 
BEGIN
    -- Add notes column if it doesn't exist (referenced in expense form)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'notes') THEN
        ALTER TABLE expenses ADD COLUMN notes TEXT;
    END IF;
    
    -- Fix category column - should be category_id to match the form
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'category') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'category_id') THEN
        ALTER TABLE expenses RENAME COLUMN category TO category_id;
    END IF;
END $$;

-- Create expense_categories table if it doesn't exist (referenced in expense form)
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Insert default expense categories if table is empty
INSERT INTO expense_categories (name_fr, name_en, is_default)
SELECT * FROM (VALUES 
    ('Fournitures de bureau', 'Office Supplies', true),
    ('Transport', 'Transportation', true),
    ('Maintenance', 'Maintenance', true),
    ('Marketing', 'Marketing', true),
    ('Utilities', 'Utilities', true),
    ('Autres', 'Other', true)
) AS v(name_fr, name_en, is_default)
WHERE NOT EXISTS (SELECT 1 FROM expense_categories);

-- Fix Sales table - ensure all referenced columns exist
DO $$ 
BEGIN
    -- Add notes column if it doesn't exist (referenced in sale form)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'notes') THEN
        ALTER TABLE sales ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Fix Purchases table - ensure all referenced columns exist
DO $$ 
BEGIN
    -- Add notes column if it doesn't exist (referenced in purchase form)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'notes') THEN
        ALTER TABLE purchases ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create company_settings table if it doesn't exist (referenced in settings)
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Solar Vision Burkina',
    tagline TEXT DEFAULT 'Votre partenaire en énergie solaire',
    logo TEXT DEFAULT '/images/company/logo.png',
    currency VARCHAR(10) DEFAULT 'FCFA',
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default company settings if table is empty
INSERT INTO company_settings (name, tagline, logo, currency)
SELECT 'Solar Vision Burkina', 'Votre partenaire en énergie solaire', '/images/company/logo.png', 'FCFA'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Update TypeScript types to match database schema
-- Recreate views with all necessary columns

-- Drop and recreate current_stock_with_batches view to include all columns
DROP VIEW IF EXISTS current_stock_with_batches CASCADE;

CREATE VIEW current_stock_with_batches AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.image,
    p.type,
    p.unit,
    p.prix_achat,
    p.prix_vente_detail_1,
    p.prix_vente_detail_2,
    p.prix_vente_gros,
    p.quantity,
    p.seuil_stock_bas,
    p.created_at,
    p.updated_at,
    p.created_by,
    COALESCE(SUM(sl.quantity_remaining), 0) as total_stock,
    COUNT(sl.id) as batch_count,
    MIN(sl.expiry_date) as earliest_expiry,
    MAX(sl.created_at) as latest_batch_date,
    (COALESCE(SUM(sl.quantity_remaining), 0) <= p.seuil_stock_bas) as is_low_stock
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_remaining > 0
GROUP BY p.id, p.name, p.description, p.image, p.type, p.unit, p.prix_achat, 
         p.prix_vente_detail_1, p.prix_vente_detail_2, p.prix_vente_gros, 
         p.quantity, p.seuil_stock_bas, p.created_at, p.updated_at, p.created_by;

-- Enable RLS on new tables
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expense_categories
CREATE POLICY "Enable read access for authenticated users" ON expense_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON expense_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON expense_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for company_settings
CREATE POLICY "Enable read access for authenticated users" ON company_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON company_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON company_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

-- Final status check
SELECT 
    'Schema fixes completed successfully' as status,
    (SELECT COUNT(*) FROM products) as product_count,
    (SELECT COUNT(*) FROM suppliers) as supplier_count,
    (SELECT COUNT(*) FROM clients) as client_count,
    (SELECT COUNT(*) FROM expense_categories) as expense_category_count,
    (SELECT COUNT(*) FROM company_settings) as company_settings_count;
