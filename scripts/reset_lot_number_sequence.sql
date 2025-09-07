-- Reset lot number sequence to avoid conflicts with existing data
-- This ensures new lot numbers don't conflict with existing ones

-- Find the highest existing lot number and set sequence accordingly
DO $$
DECLARE
    max_lot_num INTEGER;
BEGIN
    -- Extract the highest numeric part from existing lot numbers
    SELECT COALESCE(MAX(CAST(SUBSTRING(lot_number FROM '\d+$') AS INTEGER)), 0) + 1
    INTO max_lot_num
    FROM stock_lots 
    WHERE lot_number ~ 'LOT-\d{8}-\d+$';
    
    -- Reset the sequence to start from a safe number
    PERFORM setval('lot_number_seq', GREATEST(max_lot_num, 1000), false);
    
    RAISE NOTICE 'Lot number sequence reset to start from %', GREATEST(max_lot_num, 1000);
END $$;
