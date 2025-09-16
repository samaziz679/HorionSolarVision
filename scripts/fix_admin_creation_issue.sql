-- Fix admin creation issue by temporarily disabling RLS and creating first admin
-- This resolves the circular dependency in user creation

-- Temporarily disable RLS to allow initial admin creation
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies that cause recursion
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

-- Get the current authenticated user ID (this should be the user trying to create admin account)
DO $$
DECLARE
    current_user_id uuid;
    existing_profile_id uuid;
    existing_role_id uuid;
BEGIN
    -- Try to get the current user from auth.users
    SELECT id INTO current_user_id FROM auth.users WHERE email = 'horionsolarvisionburkina@gmail.com' LIMIT 1;
    
    -- If user doesn't exist in auth.users, we'll use a default UUID
    IF current_user_id IS NULL THEN
        current_user_id := 'd90e6fce-5b76-4f54-adee-66176543e87a';
    END IF;
    
    -- Check if profile already exists and update or insert accordingly
    SELECT id INTO existing_profile_id FROM user_profiles WHERE user_id = current_user_id LIMIT 1;
    
    IF existing_profile_id IS NOT NULL THEN
        -- Update existing profile
        UPDATE user_profiles SET
            email = 'horionsolarvisionburkina@gmail.com',
            full_name = 'Azize',
            status = 'active',
            updated_at = now()
        WHERE id = existing_profile_id;
    ELSE
        -- Create new profile
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
            current_user_id,
            'horionsolarvisionburkina@gmail.com',
            'Azize',
            'active',
            current_user_id,
            now(),
            now()
        );
    END IF;
    
    -- Check if role already exists and update or insert accordingly
    SELECT id INTO existing_role_id FROM user_roles WHERE user_id = current_user_id LIMIT 1;
    
    IF existing_role_id IS NOT NULL THEN
        -- Update existing role
        UPDATE user_roles SET
            role = 'admin'
        WHERE id = existing_role_id;
    ELSE
        -- Create new role
        INSERT INTO user_roles (
            id,
            user_id,
            role,
            created_by,
            created_at
        ) VALUES (
            gen_random_uuid(),
            current_user_id,
            'admin',
            current_user_id,
            now()
        );
    END IF;
    
    RAISE NOTICE 'Admin user created/updated with ID: %', current_user_id;
END $$;

-- Create simple, non-recursive RLS policies
-- User profiles policies
CREATE POLICY "Enable read for authenticated users" ON user_profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON user_profiles
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- User roles policies  
CREATE POLICY "Enable read for authenticated users" ON user_roles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_roles
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON user_roles
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS with the new non-recursive policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verify the admin user was created
SELECT 
    up.email,
    up.full_name,
    up.status,
    ur.role,
    'Admin user successfully created/updated' as message
FROM user_profiles up
JOIN user_roles ur ON up.user_id = ur.user_id
WHERE up.email = 'horionsolarvisionburkina@gmail.com';
