-- Create expense categories table with French translations
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fr TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default French categories
INSERT INTO expense_categories (name_fr, name_en, is_default) VALUES
  ('Fournitures de Bureau', 'Office Supplies', true),
  ('Transport', 'Transportation', true),
  ('Services Publics', 'Utilities', true),
  ('Marketing', 'Marketing', true),
  ('Équipement', 'Equipment', true),
  ('Maintenance', 'Maintenance', true),
  ('Services Professionnels', 'Professional Services', true),
  ('Assurance', 'Insurance', true),
  ('Autre', 'Other', true)
ON CONFLICT (name_fr) DO NOTHING;

-- Update expenses table to reference categories (if not already done)
DO $$ 
BEGIN
  -- Check if category column exists and is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'expenses' AND column_name = 'category' AND data_type = 'text'
  ) THEN
    -- Add new category_id column
    ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES expense_categories(id);
    
    -- Migrate existing text categories to category_id
    UPDATE expenses SET category_id = (
      SELECT id FROM expense_categories 
      WHERE name_en = expenses.category OR name_fr = expenses.category
      LIMIT 1
    ) WHERE category_id IS NULL;
  END IF;
END $$;

-- Create RLS policies for expense_categories
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read categories
CREATE POLICY "Users can view expense categories" ON expense_categories
  FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to insert new categories
CREATE POLICY "Users can create expense categories" ON expense_categories
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_expense_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_expense_categories_updated_at ON expense_categories;
CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW EXECUTE FUNCTION update_expense_categories_updated_at();
