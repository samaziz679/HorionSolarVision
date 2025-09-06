-- Create company_settings table for storing configurable company information
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Solar Vision ERP',
  tagline TEXT DEFAULT 'Bienvenue dans le système ERP Solar Vision',
  logo TEXT DEFAULT '/images/company/logo.png',
  currency TEXT DEFAULT 'FCFA',
  email TEXT DEFAULT 'contact@solarvision.bf',
  phone TEXT DEFAULT '+226 XX XX XX XX',
  address TEXT DEFAULT 'Ouagadougou, Burkina Faso',
  theme_primary TEXT DEFAULT 'hsl(24, 95%, 53%)',
  theme_secondary TEXT DEFAULT 'hsl(197, 71%, 73%)',
  theme_accent TEXT DEFAULT 'hsl(45, 93%, 58%)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default company settings
INSERT INTO company_settings (name, tagline, email, phone, address) 
VALUES (
  'Horion Solar Vision Burkina',
  'Bienvenue dans le système ERP Solar Vision',
  'horionsolarvisionburkina@gmail.com',
  '+226 64 25 88 88',
  'Ouagadougou, Burkina Faso'
) ON CONFLICT (id) DO NOTHING;

-- Ensure only one row exists (singleton pattern)
CREATE OR REPLACE FUNCTION ensure_single_company_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM company_settings) > 1 THEN
    DELETE FROM company_settings WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_company_settings_trigger
  AFTER INSERT ON company_settings
  FOR EACH ROW EXECUTE FUNCTION ensure_single_company_settings();
