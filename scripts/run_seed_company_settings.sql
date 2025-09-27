-- Seed company settings table with default values
INSERT INTO company_settings (
  id,
  company_name,
  company_address,
  company_phone,
  company_email,
  company_website,
  tax_number,
  currency,
  timezone,
  date_format,
  number_format,
  fiscal_year_start,
  logo_url,
  primary_color,
  secondary_color,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Solar Vision ERP',
  '123 Solar Street, Green City, GC 12345',
  '+1 (555) 123-4567',
  'info@solarvision.com',
  'https://solarvision.com',
  'TAX123456789',
  'USD',
  'America/New_York',
  'MM/DD/YYYY',
  'en-US',
  '01-01',
  null,
  '#0ea5e9',
  '#64748b',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Ensure there's at least one company settings record
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1) THEN
    INSERT INTO company_settings (
      id,
      company_name,
      company_address,
      company_phone,
      company_email,
      company_website,
      tax_number,
      currency,
      timezone,
      date_format,
      number_format,
      fiscal_year_start,
      logo_url,
      primary_color,
      secondary_color,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'Solar Vision ERP',
      '123 Solar Street, Green City, GC 12345',
      '+1 (555) 123-4567',
      'info@solarvision.com',
      'https://solarvision.com',
      'TAX123456789',
      'USD',
      'America/New_York',
      'MM/DD/YYYY',
      'en-US',
      '01-01',
      null,
      '#0ea5e9',
      '#64748b',
      now(),
      now()
    );
  END IF;
END $$;
