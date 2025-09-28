-- Check current user roles and voice assistant access
-- This script helps diagnose why the voice assistant might not be visible

-- 1. Check all user roles
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    up.email,
    up.full_name,
    ur.created_at
FROM user_roles ur
LEFT JOIN user_profiles up ON ur.user_id = up.user_id
ORDER BY ur.created_at DESC;

-- 2. Check if there are users without roles
SELECT 
    up.user_id,
    up.email,
    up.full_name,
    'No role assigned' as issue
FROM user_profiles up
LEFT JOIN user_roles ur ON up.user_id = ur.user_id
WHERE ur.user_id IS NULL;

-- 3. Show which roles have access to voice assistant (sales module)
-- According to RBAC: admin, commercial, seller have sales module access
SELECT 
    'admin' as role,
    'Has voice assistant access' as voice_access
UNION ALL
SELECT 
    'commercial' as role,
    'Has voice assistant access' as voice_access
UNION ALL
SELECT 
    'seller' as role,
    'Has voice assistant access' as voice_access
UNION ALL
SELECT 
    'stock_manager' as role,
    'NO voice assistant access' as voice_access
UNION ALL
SELECT 
    'finance' as role,
    'NO voice assistant access' as voice_access
UNION ALL
SELECT 
    'visitor' as role,
    'NO voice assistant access' as voice_access;

-- 4. Count users by role
SELECT 
    role,
    COUNT(*) as user_count,
    CASE 
        WHEN role IN ('admin', 'commercial', 'seller') THEN 'Can see voice assistant'
        ELSE 'Cannot see voice assistant'
    END as voice_access_status
FROM user_roles
GROUP BY role
ORDER BY user_count DESC;
