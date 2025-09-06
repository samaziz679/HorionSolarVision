-- Migration script to add user profile fields to existing user_roles table
-- This unifies user information in the user_roles table for RBAC system

-- Add missing columns to user_roles table
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Populate email and full_name from auth.users for existing records
UPDATE user_roles 
SET 
    email = auth_users.email,
    full_name = COALESCE(auth_users.raw_user_meta_data->>'full_name', auth_users.email),
    status = CASE 
        WHEN user_roles.status IS NULL THEN 'active'
        ELSE user_roles.status
    END,
    updated_at = NOW()
FROM auth.users AS auth_users
WHERE user_roles.user_id = auth_users.id
AND (user_roles.email IS NULL OR user_roles.full_name IS NULL);

-- Add check constraint for status (using DO block to handle if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_user_status' 
        AND conrelid = 'user_roles'::regclass
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT check_user_status 
        CHECK (status IN ('active', 'suspended', 'pending'));
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_status ON user_roles(status);

-- Update RLS policies to work with new structure
DROP POLICY IF EXISTS "Users can view their own profile" ON user_roles;
CREATE POLICY "Users can view their own profile" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_roles;
CREATE POLICY "Admins can view all profiles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
            AND ur.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Admins can update all profiles" ON user_roles;
CREATE POLICY "Admins can update all profiles" ON user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
            AND ur.status = 'active'
        )
    );

-- Enable RLS if not already enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions (conditionally grant sequence usage if it exists)
GRANT SELECT, INSERT, UPDATE ON user_roles TO authenticated;

-- Conditionally grant sequence usage only if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_roles_id_seq' AND relkind = 'S') THEN
        GRANT USAGE ON SEQUENCE user_roles_id_seq TO authenticated;
    END IF;
END $$;

COMMENT ON TABLE user_roles IS 'Unified user profiles with roles and status for RBAC system';
