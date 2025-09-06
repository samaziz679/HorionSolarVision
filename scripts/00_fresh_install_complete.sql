-- =====================================================
-- Solar Vision ERP - Complete Fresh Installation Script
-- =====================================================
-- This script sets up the complete database schema for a fresh installation
-- Run this ONCE when setting up a new deployment
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Solar Vision',
  logo_url text NULL,
  address text NULL,
  phone text NULL,
  email text NULL,
  currency text NOT NULL DEFAULT 'FCFA',
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT company_settings_pkey PRIMARY KEY (id)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  full_name text NULL,
  avatar_url text NULL,
  phone text NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_profiles_email_key UNIQUE (email),
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'manager', 'user')),
  CONSTRAINT user_roles_user_id_key UNIQUE (user_id)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NULL,
  email text NULL,
  address text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id),
  CONSTRAINT suppliers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NULL,
  email text NULL,
  address text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NULL,
  description text NULL,
  quantity integer NOT NULL DEFAULT 0,
  prix_achat numeric(10,2) NULL,
  prix_vente_detail_1 numeric(10,2) NULL,
  prix_vente_detail_2 numeric(10,2) NULL,
  prix_vente_gros numeric(10,2) NULL,
  image text NULL,
  seuil_stock_bas integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- =====================================================
-- BATCH TRACKING SYSTEM
-- =====================================================

-- Stock lots table for batch tracking
CREATE TABLE IF NOT EXISTS public.stock_lots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  lot_number text NOT NULL,
  quantity_received integer NOT NULL,
  quantity_available integer NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  purchase_date date NOT NULL,
  expiry_date date NULL,
  supplier_id uuid NULL,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT stock_lots_pkey PRIMARY KEY (id),
  CONSTRAINT stock_lots_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT stock_lots_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT stock_lots_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT stock_lots_lot_number_key UNIQUE (lot_number),
  CONSTRAINT stock_lots_quantity_check CHECK (quantity_received >= 0 AND quantity_available >= 0 AND quantity_available <= quantity_received)
);

-- Stock movements table for tracking all inventory changes
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stock_lot_id uuid NOT NULL,
  movement_type text NOT NULL,
  quantity integer NOT NULL,
  reference_type text NOT NULL,
  reference_id uuid NULL,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT stock_movements_pkey PRIMARY KEY (id),
  CONSTRAINT stock_movements_stock_lot_id_fkey FOREIGN KEY (stock_lot_id) REFERENCES public.stock_lots(id) ON DELETE CASCADE,
  CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT stock_movements_movement_type_check CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  CONSTRAINT stock_movements_reference_type_check CHECK (reference_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT')),
  CONSTRAINT stock_movements_quantity_check CHECK (quantity > 0)
);

-- Lot number sequence for automatic lot numbering
CREATE SEQUENCE IF NOT EXISTS public.lot_number_seq START 1;

-- =====================================================
-- BUSINESS TRANSACTION TABLES
-- =====================================================

-- Purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  purchase_date timestamp with time zone NULL DEFAULT now(),
  notes text NULL,
  created_by uuid NULL,
  CONSTRAINT purchases_pkey PRIMARY KEY (id),
  CONSTRAINT purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT purchases_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  client_id uuid NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  sale_date timestamp with time zone NULL DEFAULT now(),
  notes text NULL,
  created_by uuid NULL,
  CONSTRAINT sales_pkey PRIMARY KEY (id),
  CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT sales_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT sales_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Expense categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT expense_categories_pkey PRIMARY KEY (id),
  CONSTRAINT expense_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT expense_categories_name_key UNIQUE (name)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  expense_date timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id),
  CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  action text NOT NULL,
  table_name text NULL,
  record_id uuid NULL,
  old_values jsonb NULL,
  new_values jsonb NULL,
  ip_address inet NULL,
  user_agent text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Current stock with batches view
CREATE OR REPLACE VIEW public.current_stock_with_batches AS
SELECT 
  p.id,
  p.name,
  p.type,
  p.description,
  p.prix_achat,
  p.prix_vente_detail_1,
  p.prix_vente_detail_2,
  p.prix_vente_gros,
  p.image,
  p.seuil_stock_bas,
  COALESCE(SUM(sl.quantity_available), 0) as quantity,
  COUNT(sl.id) as lot_count,
  CASE 
    WHEN COALESCE(SUM(sl.quantity_available), 0) = 0 THEN 'rupture_stock'
    WHEN COALESCE(SUM(sl.quantity_available), 0) <= p.seuil_stock_bas THEN 'stock_faible'
    ELSE 'en_stock'
  END as stock_status,
  CASE 
    WHEN COUNT(sl.id) > 0 THEN 
      SUM(sl.quantity_available * sl.unit_cost) / NULLIF(SUM(sl.quantity_available), 0)
    ELSE p.prix_achat
  END as average_cost,
  p.created_at,
  p.updated_at
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_available > 0
GROUP BY 
  p.id, p.name, p.type, p.description, p.prix_achat,
  p.prix_vente_detail_1, p.prix_vente_detail_2, p.prix_vente_gros,
  p.image, p.seuil_stock_bas, p.created_at, p.updated_at;

-- Sales analytics view
CREATE OR REPLACE VIEW public.sales_analytics AS
SELECT 
  DATE_TRUNC('month', s.sale_date) as month,
  COUNT(*) as total_sales,
  SUM(s.total) as total_revenue,
  AVG(s.total) as average_sale_value,
  SUM(s.quantity) as total_quantity_sold
FROM sales s
GROUP BY DATE_TRUNC('month', s.sale_date)
ORDER BY month DESC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate lot numbers
CREATE OR REPLACE FUNCTION public.generate_lot_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
  lot_number text;
BEGIN
  SELECT nextval('lot_number_seq') INTO next_number;
  lot_number := 'LOT-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(next_number::text, 3, '0');
  RETURN lot_number;
END;
$$;

-- Function to create stock lot from purchase
CREATE OR REPLACE FUNCTION public.create_stock_lot_from_purchase()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  lot_number text;
BEGIN
  -- Generate lot number
  lot_number := generate_lot_number();
  
  -- Create stock lot
  INSERT INTO stock_lots (
    product_id,
    lot_number,
    quantity_received,
    quantity_available,
    unit_cost,
    purchase_date,
    supplier_id,
    created_by
  ) VALUES (
    NEW.product_id,
    lot_number,
    NEW.quantity,
    NEW.quantity,
    NEW.unit_price,
    NEW.purchase_date::date,
    NEW.supplier_id,
    NEW.created_by
  );
  
  -- Create stock movement record
  INSERT INTO stock_movements (
    stock_lot_id,
    movement_type,
    quantity,
    reference_type,
    reference_id,
    created_by
  ) VALUES (
    (SELECT id FROM stock_lots WHERE lot_number = lot_number),
    'IN',
    NEW.quantity,
    'PURCHASE',
    NEW.id,
    NEW.created_by
  );
  
  RETURN NEW;
END;
$$;

-- Function to handle FIFO deduction for sales
CREATE OR REPLACE FUNCTION public.deduct_stock_fifo(
  p_product_id uuid,
  p_quantity integer,
  p_sale_id uuid,
  p_created_by uuid
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  lot_record RECORD;
  remaining_quantity integer := p_quantity;
  deduction_quantity integer;
BEGIN
  -- Get available lots ordered by purchase date (FIFO)
  FOR lot_record IN
    SELECT id, quantity_available, purchase_date
    FROM stock_lots
    WHERE product_id = p_product_id 
      AND quantity_available > 0
    ORDER BY purchase_date ASC, created_at ASC
  LOOP
    EXIT WHEN remaining_quantity <= 0;
    
    -- Calculate how much to deduct from this lot
    deduction_quantity := LEAST(remaining_quantity, lot_record.quantity_available);
    
    -- Update the lot quantity
    UPDATE stock_lots
    SET quantity_available = quantity_available - deduction_quantity
    WHERE id = lot_record.id;
    
    -- Create stock movement record
    INSERT INTO stock_movements (
      stock_lot_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      created_by
    ) VALUES (
      lot_record.id,
      'OUT',
      deduction_quantity,
      'SALE',
      p_sale_id,
      p_created_by
    );
    
    remaining_quantity := remaining_quantity - deduction_quantity;
  END LOOP;
  
  -- Return true if all quantity was deducted
  RETURN remaining_quantity = 0;
END;
$$;

-- Function to handle sales stock deduction
CREATE OR REPLACE FUNCTION public.handle_sale_stock_deduction()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Deduct stock using FIFO
  IF NOT deduct_stock_fifo(NEW.product_id, NEW.quantity, NEW.id, NEW.created_by) THEN
    RAISE EXCEPTION 'Insufficient stock available for product';
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create stock lot when purchase is made
DROP TRIGGER IF EXISTS trigger_create_stock_lot_from_purchase ON public.purchases;
CREATE TRIGGER trigger_create_stock_lot_from_purchase
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.create_stock_lot_from_purchase();

-- Trigger to handle stock deduction on sales
DROP TRIGGER IF EXISTS trigger_handle_sale_stock_deduction ON public.sales;
CREATE TRIGGER trigger_handle_sale_stock_deduction
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock_deduction();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles USING btree (email);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles USING btree (role);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING btree (name);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products USING btree (type);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products USING btree (created_at);

-- Stock lots indexes
CREATE INDEX IF NOT EXISTS idx_stock_lots_product_id ON public.stock_lots USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_lot_number ON public.stock_lots USING btree (lot_number);
CREATE INDEX IF NOT EXISTS idx_stock_lots_purchase_date ON public.stock_lots USING btree (purchase_date);
CREATE INDEX IF NOT EXISTS idx_stock_lots_quantity_available ON public.stock_lots USING btree (quantity_available);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_stock_lot_id ON public.stock_movements USING btree (stock_lot_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_type ON public.stock_movements USING btree (reference_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements USING btree (created_at);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON public.sales USING btree (client_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales USING btree (sale_date);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON public.purchases USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON public.purchases USING btree (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date ON public.purchases USING btree (purchase_date);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs USING btree (table_name);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Company settings policies
CREATE POLICY "Authenticated users can view company settings" ON public.company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage company settings" ON public.company_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- General policies for business data (suppliers, clients, products, etc.)
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage clients" ON public.clients FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view stock lots" ON public.stock_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage stock lots" ON public.stock_lots FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create stock movements" ON public.stock_movements FOR INSERT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchases" ON public.purchases FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON public.sales FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view expense categories" ON public.expense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage expense categories" ON public.expense_categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage expenses" ON public.expenses FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create audit logs" ON public.audit_logs FOR INSERT TO authenticated USING (true);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default company settings
INSERT INTO public.company_settings (company_name, currency) 
VALUES ('Solar Vision', 'FCFA')
ON CONFLICT DO NOTHING;

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description) VALUES
  ('Transport', 'Frais de transport et déplacement'),
  ('Fournitures', 'Fournitures de bureau et matériel'),
  ('Marketing', 'Publicité et marketing'),
  ('Maintenance', 'Maintenance et réparations'),
  ('Autres', 'Autres dépenses diverses')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE public.lot_number_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.lot_number_seq TO anon;

-- Grant permissions on views
GRANT SELECT ON public.current_stock_with_batches TO authenticated;
GRANT SELECT ON public.current_stock_with_batches TO anon;
GRANT SELECT ON public.sales_analytics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.generate_lot_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_stock_fifo(uuid, integer, uuid, uuid) TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Solar Vision ERP database setup completed successfully!';
  RAISE NOTICE '📦 Batch tracking system enabled with automatic lot creation';
  RAISE NOTICE '🔒 Row Level Security policies configured';
  RAISE NOTICE '📊 Analytics views and functions created';
  RAISE NOTICE '🚀 Ready for deployment!';
END $$;
