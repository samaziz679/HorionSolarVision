-- Add missing columns to user_roles table to match user_profiles structure
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records with user data from auth.users
UPDATE user_roles 
SET 
  email = auth_users.email,
  full_name = COALESCE(auth_users.raw_user_meta_data->>'full_name', auth_users.email),
  updated_at = NOW()
FROM auth.users AS auth_users
WHERE user_roles.user_id = auth_users.id
AND user_roles.email IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);

-- Add constraint to ensure status is valid
ALTER TABLE user_roles 
ADD CONSTRAINT IF NOT EXISTS check_user_status 
CHECK (status IN ('active', 'suspended', 'pending'));

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_roles_updated_at ON user_roles;
CREATE TRIGGER trigger_update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_roles_updated_at();
