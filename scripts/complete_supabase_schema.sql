-- Add products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone_number TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone_number TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    sale_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add banking_accounts table
CREATE TABLE banking_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products table
CREATE POLICY "Users can view their own products." ON products
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products." ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products." ON products
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products." ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for clients table
CREATE POLICY "Users can view their own clients." ON clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients." ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients." ON clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients." ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for suppliers table
CREATE POLICY "Users can view their own suppliers." ON suppliers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own suppliers." ON suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suppliers." ON suppliers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suppliers." ON suppliers
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sales table
CREATE POLICY "Users can view their own sales." ON sales
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales." ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales." ON sales
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales." ON sales
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for purchases table
CREATE POLICY "Users can view their own purchases." ON purchases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchases." ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchases." ON purchases
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own purchases." ON purchases
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expenses table
CREATE POLICY "Users can view their own expenses." ON expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses." ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses." ON expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses." ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for banking_accounts table
CREATE POLICY "Users can view their own banking accounts." ON banking_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own banking accounts." ON banking_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own banking accounts." ON banking_accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own banking accounts." ON banking_accounts
  FOR DELETE USING (auth.uid() = user_id);
