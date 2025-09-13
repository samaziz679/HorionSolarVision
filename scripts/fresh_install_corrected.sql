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

-- Drop existing user_profiles table if it exists to recreate with proper structure
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- User profiles table
CREATE TABLE public.user_profiles (
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

-- Drop existing user_roles table if it exists to recreate with proper structure
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- User roles table
CREATE TABLE public.user_roles (
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

-- Create other tables if they don't exist
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

-- Drop existing stock tables to recreate properly
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.stock_lots CASCADE;

-- Stock lots table for batch tracking
CREATE TABLE public.stock_lots (
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
CREATE TABLE public.stock_movements (
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

-- Create sequence for lot numbers
DROP SEQUENCE IF EXISTS public.lot_number_seq CASCADE;
CREATE SEQUENCE public.lot_number_seq START 1;

-- =====================================================
-- BUSINESS TRANSACTION TABLES
-- =====================================================

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

-- =====================================================
-- VIEWS AND FUNCTIONS
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

-- =====================================================
-- ROW LEVEL SECURITY
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

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- General policies for business data
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage clients" ON public.clients;
CREATE POLICY "Authenticated users can manage clients" ON public.clients FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL TO authenticated USING (true);

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

-- Grant permissions
GRANT USAGE ON SEQUENCE public.lot_number_seq TO authenticated;
GRANT SELECT ON public.current_stock_with_batches TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_lot_number() TO authenticated;

-- Success message
SELECT 'Solar Vision ERP database setup completed successfully!' as message;
