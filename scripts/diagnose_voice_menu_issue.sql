-- Diagnostic script to understand why voice menu is not showing
-- This script will help identify the root cause

-- 1. Check if there are any users in the system
SELECT 'Total users in auth.users:' as info, COUNT(*) as count FROM auth.users;

-- 2. Check if there are any user roles assigned
SELECT 'Total user roles:' as info, COUNT(*) as count FROM user_roles;

-- 3. Show all users and their roles
SELECT 
  'User roles details:' as info,
  ur.user_id,
  ur.role,
  ur.status,
  ur.email,
  ur.created_at
FROM user_roles ur
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
SELECT 
  'Current user role assignment:' as info,
  ur.role,
  ur.status,
  CASE 
    WHEN ur.role IN ('admin', 'commercial', 'seller', 'finance') THEN 'YES - Should see voice assistant'
    ELSE 'NO - Will not see voice assistant'
  END as voice_assistant_access
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
ORDER BY au.created_at DESC
LIMIT 1;
