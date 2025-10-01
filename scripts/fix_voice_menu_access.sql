-- Script to ensure users have proper role assignments to see the voice assistant
-- The voice assistant requires the 'sales' module which is available to:
-- admin, commercial, seller, and finance roles

-- Step 1: Check if there are users without role assignments
-- Removed non-existent columns and fixed the logic to use correct schema
DO $$
DECLARE
  user_record RECORD;
  users_without_roles INTEGER;
BEGIN
  -- Count users without roles
  SELECT COUNT(*) INTO users_without_roles
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  WHERE ur.id IS NULL;

  RAISE NOTICE 'Users without role assignments: %', users_without_roles;

  -- If there are users without roles, assign them the 'seller' role
  -- (seller role has access to sales module and thus the voice assistant)
  IF users_without_roles > 0 THEN
    FOR user_record IN 
      SELECT au.id, au.email
      FROM auth.users au
      LEFT JOIN user_roles ur ON au.id = ur.user_id
      WHERE ur.id IS NULL
    LOOP
      -- Removed status and email columns that don't exist in user_roles
      INSERT INTO user_roles (user_id, role)
      VALUES (user_record.id, 'seller'::user_role);
      
      RAISE NOTICE 'Assigned seller role to user: %', user_record.email;
    END LOOP;
  END IF;
END $$;

-- Step 2: Ensure the first user is an admin (if no admin exists)
-- Fixed to use correct schema without status and email columns
DO $$
DECLARE
  admin_count INTEGER;
  first_user_id UUID;
  first_user_email TEXT;
BEGIN
  -- Check if there's at least one admin
  SELECT COUNT(*) INTO admin_count
  FROM user_roles
  WHERE role = 'admin';

  IF admin_count = 0 THEN
    -- Get the first user
    SELECT id, email INTO first_user_id, first_user_email
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;

    IF first_user_id IS NOT NULL THEN
      -- Update or insert admin role for first user
      -- Removed status and email, added proper conflict handling
      INSERT INTO user_roles (user_id, role)
      VALUES (first_user_id, 'admin'::user_role)
      ON CONFLICT (user_id) 
      DO UPDATE SET role = 'admin'::user_role;

      RAISE NOTICE 'Promoted first user to admin: %', first_user_email;
    END IF;
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;

-- Step 3: Show final user roles
-- Fixed to join with user_profiles for email and status info
SELECT 
  ur.user_id,
  up.email,
  up.full_name,
  ur.role,
  up.status as profile_status,
  CASE 
    WHEN ur.role IN ('admin', 'commercial', 'seller', 'finance') THEN '✓ Has voice assistant access'
    ELSE '✗ No voice assistant access'
  END as voice_access
FROM user_roles ur
LEFT JOIN user_profiles up ON ur.user_id = up.user_id
ORDER BY ur.created_at ASC;
