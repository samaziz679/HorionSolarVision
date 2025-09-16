-- Activate pending user: horionsolarvente@outlook.com
-- This script adds the user to user_profiles and user_roles tables

-- Insert into user_profiles
INSERT INTO user_profiles (
  user_id,
  email,
  full_name,
  status,
  created_at,
  updated_at
) VALUES (
  '359e54a1-e9e8-4cb0-b53a-6e8def198112',
  'horionsolarvente@outlook.com',
  'Utilisateur Vente', -- You can change this name
  'active',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Insert into user_roles (assigning 'user' role, change to 'admin' if needed)
INSERT INTO user_roles (
  user_id,
  role,
  created_at,
  updated_at,
  created_by
) VALUES (
  '359e54a1-e9e8-4cb0-b53a-6e8def198112',
  'user', -- Change to 'admin' if you want admin privileges
  NOW(),
  NOW(),
  'd90e6fce-5b76-4f54-adee-66176543e87a' -- Created by the existing admin
) ON CONFLICT (user_id) DO NOTHING;
