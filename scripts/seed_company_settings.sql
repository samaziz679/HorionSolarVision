-- Seed company settings table with default data if empty
-- This script ensures the company_settings table has at least one row

DO $$
BEGIN
    -- Check if company_settings table is empty and insert default data
    IF NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1) THEN
        INSERT INTO company_settings (
            name, 
            tagline, 
            email, 
            phone, 
            address, 
            currency,
            logo,
            created_at,
            updated_at
        ) VALUES (
            'Solar Vision ERP',
            'Système de gestion pour l''énergie solaire au Burkina Faso',
            'contact@solarvision.bf',
            '+226 25 XX XX XX',
            'Ouagadougou, Burkina Faso',
            'FCFA',
            '/images/company/logo.png',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Default company settings created successfully';
    ELSE
        RAISE NOTICE 'Company settings already exist, skipping seed';
    END IF;
END $$;

-- Verify the data exists
SELECT 'Company settings verification:' as status;
SELECT name, tagline, currency, email, phone FROM company_settings;
