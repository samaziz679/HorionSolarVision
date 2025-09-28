-- Ensure there's at least one admin user who can access the voice assistant
-- This script will promote the first user to admin if no admin exists

DO $$
DECLARE
    admin_count INTEGER;
    first_user_id UUID;
BEGIN
    -- Check if there are any admin users
    SELECT COUNT(*) INTO admin_count
    FROM user_roles
    WHERE role = 'admin';
    
    -- If no admin exists, promote the first user to admin
    IF admin_count = 0 THEN
        -- Get the first user (oldest by creation date)
        SELECT user_id INTO first_user_id
        FROM user_roles
        ORDER BY created_at ASC
        LIMIT 1;
        
        -- If we found a user, promote them to admin
        IF first_user_id IS NOT NULL THEN
            UPDATE user_roles
            SET role = 'admin'
            WHERE user_id = first_user_id;
            
            RAISE NOTICE 'Promoted user % to admin role for voice assistant access', first_user_id;
        ELSE
            RAISE NOTICE 'No users found in user_roles table';
        END IF;
    ELSE
        RAISE NOTICE 'Admin user(s) already exist: % admin(s) found', admin_count;
    END IF;
END $$;

-- Show the result
SELECT 
    ur.user_id,
    ur.role,
    up.email,
    up.full_name,
    CASE 
        WHEN ur.role IN ('admin', 'commercial', 'seller') THEN 'CAN see voice assistant'
        ELSE 'CANNOT see voice assistant'
    END as voice_access
FROM user_roles ur
LEFT JOIN user_profiles up ON ur.user_id = up.user_id
ORDER BY ur.created_at ASC;
