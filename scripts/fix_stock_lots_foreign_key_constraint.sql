-- Fix the foreign key constraint issue for stock_lots.created_by
-- The issue is that stock_lots.created_by references user_profiles.id 
-- but other tables reference auth.users.id

-- First, ensure we have a user_profiles record for the current auth user
INSERT INTO public.user_profiles (user_id, email, full_name, status, created_by)
SELECT 
  au.id as user_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'active' as status,
  au.id as created_by
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (email) DO NOTHING;

-- Drop the existing foreign key constraint
ALTER TABLE public.stock_lots 
DROP CONSTRAINT IF EXISTS stock_lots_created_by_fkey;

-- Add the correct foreign key constraint to reference auth.users.id like other tables
ALTER TABLE public.stock_lots 
ADD CONSTRAINT stock_lots_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Also fix stock_movements table if it has the same issue
ALTER TABLE public.stock_movements 
DROP CONSTRAINT IF EXISTS stock_movements_created_by_fkey;

ALTER TABLE public.stock_movements 
ADD CONSTRAINT stock_movements_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Update any existing stock_lots records that might have user_profiles.id values
-- Convert them to auth.users.id values
UPDATE public.stock_lots 
SET created_by = (
  SELECT up.user_id 
  FROM public.user_profiles up 
  WHERE up.id = stock_lots.created_by
)
WHERE created_by IN (SELECT id FROM public.user_profiles);

-- Update any existing stock_movements records similarly
UPDATE public.stock_movements 
SET created_by = (
  SELECT up.user_id 
  FROM public.user_profiles up 
  WHERE up.id = stock_movements.created_by
)
WHERE created_by IN (SELECT id FROM public.user_profiles);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
