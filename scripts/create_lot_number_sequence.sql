-- Create the missing lot_number_seq sequence
-- This sequence is used by the set_lot_number() function to generate unique lot numbers

-- Drop sequence if it exists to avoid conflicts
DROP SEQUENCE IF EXISTS lot_number_seq;

-- Create the sequence starting from 1
CREATE SEQUENCE lot_number_seq START 1;

-- Grant usage permissions to ensure the function can access it
GRANT USAGE, SELECT ON SEQUENCE lot_number_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE lot_number_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE lot_number_seq TO authenticated;

-- Verify the sequence was created
SELECT 
    schemaname,
    sequencename,
    start_value,
    min_value,
    max_value,
    increment_by
FROM pg_sequences 
WHERE sequencename = 'lot_number_seq';
