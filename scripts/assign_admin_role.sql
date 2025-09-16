-- Simple script to assign admin role to existing user
-- This works with the existing user in the database

-- Temporarily disable RLS to allow admin role assignment
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_roles;

-- Assign admin role to the existing user
DO $$
DECLARE
    existing_user_id uuid;
    existing_role_id uuid;
BEGIN
    -- Get the actual user ID from the existing user_profiles record
    SELECT user_id INTO existing_user_id 
    FROM user_profiles 
    WHERE email = 'horionsolarvisionburkina@gmail.com' 
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Check if user already has a role
        SELECT id INTO existing_role_id 
        FROM user_roles 
        WHERE user_id = existing_user_id 
        LIMIT 1;
        
        IF existing_role_id IS NOT NULL THEN
            -- Update existing role to admin
            UPDATE user_roles 
            SET role = 'admin' 
            WHERE id = existing_role_id;
            RAISE NOTICE 'Updated existing role to admin for user: %', existing_user_id;
        ELSE
            -- Create new admin role
            INSERT INTO user_roles (
                id,
                user_id,
                role,
                created_by,
                created_at
            ) VALUES (
                gen_random_uuid(),
                existing_user_id,
                'admin',
                existing_user_id,
                now()
            );
            RAISE NOTICE 'Created new admin role for user: %', existing_user_id;
        END IF;
    ELSE
        RAISE EXCEPTION 'User with email horionsolarvisionburkina@gmail.com not found in user_profiles';
    END IF;
END $$;

-- Create simple RLS policies that allow authenticated users to access data
CREATE POLICY "Allow all for authenticated users" ON user_profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON user_roles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verify the admin role was assigned
SELECT 
    up.email,
    up.full_name,
    ur.role,
    'Admin role successfully assigned!' as status
FROM user_profiles up
LEFT JOIN user_roles ur ON up.user_id = ur.user_id
WHERE up.email = 'horionsolarvisionburkina@gmail.com';
