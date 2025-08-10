-- This script sets up the full database schema for the Solar Vision ERP application.
-- It includes tables for users, banking, clients, expenses, inventory, purchases, sales, and suppliers.
-- It also sets up Row Level Security (RLS) policies for each table to ensure data isolation per user.

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors on re-execution
DROP POLICY IF EXISTS "Users can view their own user entry." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own user entry." ON public.users;
DROP POLICY IF EXISTS "Users can update their own user entry." ON public.users;
DROP POLICY IF EXISTS "Users can delete their own user entry." ON public.users;

DROP POLICY IF EXISTS "Users can view their own banking accounts." ON public.banking;
DROP POLICY IF EXISTS "Users can insert their own banking accounts." ON public.banking;
DROP POLICY IF EXISTS "Users can update their own banking accounts." ON public.banking;
DROP POLICY IF EXISTS "Users can delete their own banking accounts." ON public.banking;

DROP POLICY IF EXISTS "Users can view their own clients." ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients." ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients." ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients." ON public.clients;

DROP POLICY IF EXISTS "Users can view their own expenses." ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses." ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses." ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses." ON public.expenses;

DROP POLICY IF EXISTS "Users can view their own inventory." ON public.inventory;
DROP POLICY IF EXISTS "Users can insert their own inventory." ON public.inventory;
DROP POLICY IF EXISTS "Users can update their own inventory." ON public.inventory;
DROP POLICY IF EXISTS "Users can delete their own inventory." ON public.inventory;

DROP POLICY IF EXISTS "Users can view their own purchases." ON public.purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases." ON public.purchases;
DROP POLICY IF EXISTS "Users can update their own purchases." ON public.purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases." ON public.purchases;

DROP POLICY IF EXISTS "Users can view their own sales." ON public.sales;
DROP POLICY IF EXISTS "Users can insert their own sales." ON public.sales;
DROP POLICY IF EXISTS "Users can update their own sales." ON public.sales;
DROP POLICY IF EXISTS "Users can delete their own sales." ON public.sales;

DROP POLICY IF EXISTS "Users can view their own suppliers." ON public.suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers." ON public.suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers." ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers." ON public.suppliers;

-- 1. Users Table
-- This table stores basic user information, linked to Supabase Auth.
-- CREATE TABLE IF NOT EXISTS public.users (
--   id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
--   email text UNIQUE,
--   created_at timestamp with time zone DEFAULT now()
-- );

-- Enable Row Level Security (RLS) for the 'users' table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the 'users' table
-- Allow users to view their own user data
CREATE POLICY "Users can view their own user data." ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own user data (e.g., during sign-up)
CREATE POLICY "Users can insert their own user data." ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own user data
CREATE POLICY "Users can update their own user data." ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own user data
CREATE POLICY "Users can delete their own user data." ON public.users
  FOR DELETE USING (auth.uid() = id);

-- 2. Banking Accounts Table
CREATE TABLE IF NOT EXISTS public.banking (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  balance numeric DEFAULT 0 NOT NULL,
  currency text DEFAULT 'XOF' NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies for Banking Accounts Table
CREATE POLICY "Users can view their own banking accounts." ON public.banking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own banking accounts." ON public.banking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own banking accounts." ON public.banking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own banking accounts." ON public.banking
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies for Clients Table
CREATE POLICY "Users can view their own clients." ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients." ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients." ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients." ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies for Expenses Table
CREATE POLICY "Users can view their own expenses." ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses." ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses." ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses." ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Inventory (Products) Table
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0 NOT NULL,
  stock integer DEFAULT 0 NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies for Inventory Table
CREATE POLICY "Users can view their own inventory." ON public.inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory." ON public.inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory." ON public.inventory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory." ON public.inventory
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies for Suppliers Table
CREATE POLICY "Users can view their own suppliers." ON public.suppliers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers." ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers." ON public.suppliers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers." ON public.suppliers
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.inventory ON DELETE RESTRICT NOT NULL, -- RESTRICT to prevent deleting products with existing purchases
  supplier_id uuid REFERENCES public.suppliers ON DELETE RESTRICT NOT NULL, -- RESTRICT to prevent deleting suppliers with existing purchases
  quantity integer NOT NULL,
  purchase_date date NOT NULL,
  total_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies for Purchases Table
CREATE POLICY "Users can view their own purchases." ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases." ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases." ON public.purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases." ON public.purchases
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.inventory ON DELETE RESTRICT NOT NULL, -- RESTRICT to prevent deleting products with existing sales
  client_id uuid REFERENCES public.clients ON DELETE RESTRICT NOT NULL, -- RESTRICT to prevent deleting clients with existing sales
  quantity integer NOT NULL,
  sale_date date NOT NULL,
  total_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies for Sales Table
CREATE POLICY "Users can view their own sales." ON public.sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales." ON public.sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales." ON public.sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales." ON public.sales
  FOR DELETE USING (auth.uid() = user_id);

-- Function to create a public.users entry on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users inserts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- This script is deprecated. Use complete_supabase_schema_final_correction_v2.sql instead.
