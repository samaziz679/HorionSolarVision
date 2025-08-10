-- This script inserts initial stock data into the 'inventory' table.
-- It's intended for seeding your database with some sample products.
-- Ensure that the 'inventory' table and its RLS policies are already set up
-- by running the 'complete_supabase_schema.sql' script first.

-- IMPORTANT: Replace 'YOUR_USER_ID' with the actual user_id (UUID)
-- that these products should be associated with.
-- You can find your user_id in the 'auth.users' table after a user signs up.

INSERT INTO public.products (name, description, price, stock_quantity, sku, user_id)
VALUES
('Solar Panel 300W', 'High-efficiency monocrystalline solar panel', 250.00, 100, 'SP300W', 'YOUR_USER_ID'),
('Inverter 5kW', 'Hybrid solar inverter with battery support', 1200.00, 50, 'INV5KW', 'YOUR_USER_ID'),
('Solar Battery 100Ah', 'Deep cycle gel battery for solar systems', 300.00, 200, 'BAT100AH', 'YOUR_USER_ID'),
('Mounting Kit - Roof', 'Universal roof mounting kit for solar panels', 80.00, 150, 'MK-ROOF', 'YOUR_USER_ID'),
('Charge Controller 60A', 'MPPT solar charge controller', 150.00, 75, 'CC60A', 'YOUR_USER_ID');

-- Replace 'YOUR_USER_ID' with the actual user ID from your auth.users table.
-- You can find your user ID in the Supabase Auth dashboard or by querying the auth.users table.
-- Example: SELECT id FROM auth.users WHERE email = 'your_email@example.com';
