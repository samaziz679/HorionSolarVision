-- Diagnostic script to understand why voice menu is not showing
-- This script will help identify the root cause

-- 1. Check if there are any users in the system
SELECT 'Total users in auth.users:' as info, COUNT(*) as count FROM auth.users;

-- 2. Check if there are any user roles assigned
SELECT 'Total user roles:' as info, COUNT(*) as count FROM user_roles;

-- 3. Show all users and their roles
-- Removed non-existent columns (status, email) and joined with user_profiles for additional info
SELECT 
  'User roles details:' as info,
  ur.user_id,
  ur.role,
  up.email,
  up.full_name,
  up.status as profile_status,
  ur.created_at
FROM user_roles ur
LEFT JOIN user_profiles up ON ur.user_id = up.user_id
ORDER BY ur.created_at DESC;

-- 4. Check which roles have access to 'sales' module
SELECT 
  'Roles that should see voice assistant:' as info,
  'admin, commercial, seller, finance' as roles_with_sales_access;

-- 5. Show current user (if logged in)
SELECT 
  'Current authenticated user:' as info,
  au.id as user_id,
  au.email,
  au.created_at
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 1;

-- 6. Check if current user has a role assigned
-- Fixed to use correct schema and join with user_profiles
SELECT 
  'Current user role assignment:' as info,
  au.email,
  up.full_name,
  ur.role,
  up.status as profile_status,
  CASE 
    WHEN ur.role IN ('admin', 'commercial', 'seller', 'finance') THEN 'YES - Should see voice assistant'
    WHEN ur.role IS NULL THEN 'NO ROLE ASSIGNED - Will not see voice assistant'
    ELSE 'NO - Will not see voice assistant'
  END as voice_assistant_access
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC
LIMIT 1;
