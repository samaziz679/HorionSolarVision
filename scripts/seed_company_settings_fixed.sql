-- Seed company_settings table with default values (matching actual schema)
INSERT INTO company_settings (
  id,
  name,
  address,
  phone,
  email,
  tagline,
  logo,
  currency,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Solar Vision ERP',
  '123 Business Street, City, Country',
  '+1-234-567-8900',
  'info@solarvision.com',
  'Powering Your Solar Business',
  NULL,
  'USD',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- If the table is empty, we can also use this approach to ensure at least one record exists
INSERT INTO company_settings (
  id,
  name,
  address,
  phone,
  email,
  tagline,
  logo,
  currency,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'Solar Vision ERP',
  '123 Business Street, City, Country',
  '+1-234-567-8900',
  'info@solarvision.com',
  'Powering Your Solar Business',
  NULL,
  'USD',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM company_settings);
