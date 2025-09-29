-- Script to ensure users have proper role assignments to see the voice assistant
-- The voice assistant requires the 'sales' module which is available to:
-- admin, commercial, seller, and finance roles

-- Step 1: Check if there are users without role assignments
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
      INSERT INTO user_roles (user_id, role, status, email)
      VALUES (user_record.id, 'seller', 'active', user_record.email);
      
      RAISE NOTICE 'Assigned seller role to user: %', user_record.email;
    END LOOP;
  END IF;
END $$;

-- Step 2: Ensure the first user is an admin (if no admin exists)
DO $$
DECLARE
  admin_count INTEGER;
  first_user_id UUID;
  first_user_email TEXT;
BEGIN
  -- Check if there's at least one admin
  SELECT COUNT(*) INTO admin_count
  FROM user_roles
  WHERE role = 'admin' AND status = 'active';

  IF admin_count = 0 THEN
    -- Get the first user
    SELECT id, email INTO first_user_id, first_user_email
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;

    IF first_user_id IS NOT NULL THEN
      -- Update or insert admin role for first user
      INSERT INTO user_roles (user_id, role, status, email)
      VALUES (first_user_id, 'admin', 'active', first_user_email)
      ON CONFLICT (user_id) 
      DO UPDATE SET role = 'admin', status = 'active';

      RAISE NOTICE 'Promoted first user to admin: %', first_user_email;
    END IF;
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;

-- Step 3: Show final user roles
SELECT 
  ur.user_id,
  ur.email,
  ur.role,
  ur.status,
  CASE 
    WHEN ur.role IN ('admin', 'commercial', 'seller', 'finance') THEN '✓ Has voice assistant access'
    ELSE '✗ No voice assistant access'
  END as voice_access
FROM user_roles ur
ORDER BY ur.created_at ASC;
