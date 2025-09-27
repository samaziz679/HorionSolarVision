-- Seed company_settings table with default values
-- Only insert if the table is completely empty

INSERT INTO company_settings (
  name,
  tagline,
  logo,
  currency,
  email,
  phone,
  address
)
SELECT 
  'Solar Vision Burkina',
  'Votre partenaire en énergie solaire',
  '/images/company/logo.png',
  'FCFA',
  'contact@solarvisionbf.com',
  '+226 XX XX XX XX',
  'Ouagadougou, Burkina Faso'
WHERE NOT EXISTS (
  SELECT 1 FROM company_settings LIMIT 1
);
