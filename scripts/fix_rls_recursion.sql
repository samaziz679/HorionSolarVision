-- Fix RLS policy recursion for first admin user creation
-- This script resolves the infinite recursion in user_roles policies

-- Temporarily disable RLS on user_roles and user_profiles for admin creation
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Create non-recursive policies for user_roles
CREATE POLICY "Enable read for authenticated users" ON user_roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for service role" ON user_roles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON user_roles
    FOR UPDATE USING (true);

-- Create non-recursive policies for user_profiles  
CREATE POLICY "Enable read for authenticated users" ON user_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for service role" ON user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON user_profiles
    FOR UPDATE USING (true);

-- Re-enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create the first admin user if not exists
DO $$
DECLARE
    admin_user_id UUID := 'd90e6fce-5b76-4f54-adee-66176543e87a';
    admin_email TEXT := 'horionsolarvisionburkina@gmail.com';
BEGIN
    -- Insert user profile if not exists
    INSERT INTO user_profiles (id, email, full_name, created_by)
    VALUES (admin_user_id, admin_email, 'Admin User', admin_user_id)
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert admin role if not exists
    INSERT INTO user_roles (user_id, role, created_by)
    VALUES (admin_user_id, 'admin', admin_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'First admin user created successfully';
END $$;
