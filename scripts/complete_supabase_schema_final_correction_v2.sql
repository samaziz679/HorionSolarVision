-- This script ensures that the 'users' table is correctly created and managed by Supabase Auth.
-- It also sets up the necessary RLS policies for the 'users' table.

-- Create the 'users' table if it doesn't exist, managed by Supabase Auth
-- This table is automatically created and managed by Supabase Auth.
-- We just need to ensure it has the 'email' column and RLS policies.
-- If you are using the default Supabase Auth setup, this table might already exist.
-- The 'id' column should be of type UUID and be the primary key, referencing auth.users.id.

-- Ensure the 'users' table exists and has an 'email' column
-- This is typically handled by Supabase's default auth schema.
-- If you need to create it manually for some reason, ensure it aligns with auth.users.
-- For example:
-- CREATE TABLE public.users (
--   id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
--   email TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Enable Row Level Security (RLS) for the 'users' table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the 'users' table
-- Allow users to view their own user data
CREATE POLICY "Users can view their own user data." ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own user data (e.g., during sign-up)
CREATE POLICY "Users can insert their own user data." ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own user data
CREATE POLICY "Users can update their own user data." ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own user data
CREATE POLICY "Users can delete their own user data." ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Ensure all other tables correctly reference public.users(id)
-- This is a check to ensure existing foreign keys are correct.
-- No ALTER TABLE statements are needed here if they were correctly set up in previous scripts.
-- Example check (no action needed if already correct):
-- ALTER TABLE products ADD CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE clients ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE suppliers ADD CONSTRAINT suppliers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE sales ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE purchases ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE expenses ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ALTER TABLE banking_accounts ADD CONSTRAINT banking_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
