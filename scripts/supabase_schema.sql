-- Enable the "uuid-ossp" extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table for users (if not already managed by Supabase Auth)
-- Supabase Auth typically manages the 'auth.users' table.
-- This 'public.users' table is for additional public user data if needed,
-- and should reference 'auth.users'.
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for the public.users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own user data
CREATE POLICY "Users can view their own user data." ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to insert their own user data
CREATE POLICY "Users can insert their own user data." ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own user data
CREATE POLICY "Users can update their own user data." ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow users to delete their own user data
CREATE POLICY "Users can delete their own user data." ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Create a trigger to automatically insert a new row into public.users
-- when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to avoid conflicts during re-creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
