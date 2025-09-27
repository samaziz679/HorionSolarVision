-- Check current user and their role assignments
SELECT 
    'Current User Info' as section,
    auth.uid() as user_id,
    auth.email() as user_email;

-- Fixed column names to match actual database schema
-- Check user profiles and roles
SELECT 
    'User Profiles' as section,
    up.id,
    up.user_id,
    up.email,
    up.full_name,
    up.status,
    up.created_at,
    up.updated_at
FROM user_profiles up
WHERE up.user_id = auth.uid();

-- Check user roles
SELECT 
    'User Roles' as section,
    ur.id,
    ur.user_id,
    ur.role,
    ur.created_at,
    ur.created_by
FROM user_roles ur
WHERE ur.user_id = auth.uid();

-- Check all user profiles (for admin debugging)
SELECT 
    'All User Profiles' as section,
    up.id,
    up.user_id,
    up.email,
    up.full_name,
    up.status,
    up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC
LIMIT 10;

-- Check all user roles (for admin debugging)
SELECT 
    'All User Roles' as section,
    ur.id,
    ur.user_id,
    ur.role,
    ur.created_at
FROM user_roles ur
ORDER BY ur.created_at DESC
LIMIT 10;

-- Fixed column names for company_settings
-- Check company settings
SELECT 
    'Company Settings' as section,
    cs.id,
    cs.name,
    cs.email,
    cs.phone,
    cs.address,
    cs.tagline,
    cs.logo,
    cs.currency,
    cs.created_at,
    cs.updated_at
FROM company_settings cs;

-- Check if there are any RLS policies blocking access
SELECT 
    'RLS Policies on user_profiles' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Check if there are any RLS policies on user_roles
SELECT 
    'RLS Policies on user_roles' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Check if there are any RLS policies on company_settings
SELECT 
    'RLS Policies on company_settings' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'company_settings';

-- Test direct access to check what the current user can see
SELECT 
    'Direct Access Test' as section,
    'Can access user_profiles' as test,
    COUNT(*) as count
FROM user_profiles;

SELECT 
    'Direct Access Test' as section,
    'Can access user_roles' as test,
    COUNT(*) as count
FROM user_roles;

SELECT 
    'Direct Access Test' as section,
    'Can access company_settings' as test,
    COUNT(*) as count
FROM company_settings;

-- Added comprehensive user and role join query
-- Combined user profile and role information
SELECT 
    'Combined User Info' as section,
    up.user_id,
    up.email,
    up.full_name,
    up.status as profile_status,
    ur.role,
    ur.created_at as role_assigned_at,
    CASE 
        WHEN ur.role IN ('admin', 'commercial', 'seller') THEN 'Should see voice assistant'
        ELSE 'Should NOT see voice assistant'
    END as voice_assistant_access
FROM user_profiles up
LEFT JOIN user_roles ur ON up.user_id = ur.user_id
WHERE up.user_id = auth.uid();
