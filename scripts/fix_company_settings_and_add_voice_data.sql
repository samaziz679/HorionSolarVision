-- Fix company settings data and ensure voice assistant is accessible
-- This script fixes the 406 error and ensures proper data exists

-- First, check if company_settings table has data
DO $$
BEGIN
    -- Insert default company settings if none exist
    IF NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1) THEN
        INSERT INTO company_settings (
            name, 
            tagline, 
            email, 
            phone, 
            address, 
            currency,
            logo
        ) VALUES (
            'Solar Vision ERP',
            'Système de gestion pour l''énergie solaire au Burkina Faso',
            'contact@solarvision.bf',
            '+226 25 XX XX XX',
            'Ouagadougou, Burkina Faso',
            'FCFA',
            null
        );
        
        RAISE NOTICE 'Default company settings created successfully';
    ELSE
        RAISE NOTICE 'Company settings already exist';
    END IF;
END $$;

-- Ensure RLS policies allow authenticated users to read company settings
DROP POLICY IF EXISTS "Allow authenticated users to read company settings" ON company_settings;
CREATE POLICY "Allow authenticated users to read company settings" 
ON company_settings FOR SELECT 
TO authenticated 
USING (true);

-- Ensure admins can manage company settings
DROP POLICY IF EXISTS "Allow admins to manage company settings" ON company_settings;
CREATE POLICY "Allow admins to manage company settings" 
ON company_settings FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    )
);

-- Grant necessary permissions
GRANT SELECT ON company_settings TO authenticated;
GRANT ALL ON company_settings TO authenticated;

-- Verify the data exists
SELECT 'Company settings verification:' as status;
SELECT name, tagline, currency, email, phone FROM company_settings;
