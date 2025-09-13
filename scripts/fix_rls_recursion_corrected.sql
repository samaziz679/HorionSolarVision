-- Fix RLS policy recursion and create first admin user
-- This script resolves the infinite recursion in user_roles policies

-- First, temporarily disable RLS to allow initial admin creation
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Create the first admin user profile and role
-- Using the existing Supabase user ID: d90e6fce-5b76-4f54-adee-66176543e87a
INSERT INTO user_profiles (
    id,
    user_id, 
    email, 
    full_name, 
    status,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'd90e6fce-5b76-4f54-adee-66176543e87a',
    'horionsolarvisionburkina@gmail.com',
    'Admin User',
    'active',
    'd90e6fce-5b76-4f54-adee-66176543e87a',
    now(),
    now()
);

-- Create admin role for the user
INSERT INTO user_roles (
    id,
    user_id,
    role,
    created_by,
    created_at
) VALUES (
    gen_random_uuid(),
    'd90e6fce-5b76-4f54-adee-66176543e87a',
    'admin',
    'd90e6fce-5b76-4f54-adee-66176543e87a',
    now()
);

-- Create simple, non-recursive RLS policies
-- User profiles policies
CREATE POLICY "Enable read for authenticated users" ON user_profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own profile" ON user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User roles policies  
CREATE POLICY "Enable read for authenticated users" ON user_roles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_roles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verify the admin user was created
SELECT 
    up.email,
    up.full_name,
    up.status,
    ur.role
FROM user_profiles up
JOIN user_roles ur ON up.user_id = ur.user_id
WHERE up.user_id = 'd90e6fce-5b76-4f54-adee-66176543e87a';
