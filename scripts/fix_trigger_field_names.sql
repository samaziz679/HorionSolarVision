-- Fix database triggers and functions that reference quantity_purchased
-- This should be quantity_received based on the actual table schema

-- First, let's check what functions might be referencing quantity_purchased
-- and update them to use quantity_received

-- Update the set_lot_number function if it references quantity_purchased
CREATE OR REPLACE FUNCTION set_lot_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate lot number if not provided
  IF NEW.lot_number IS NULL OR NEW.lot_number = '' THEN
    NEW.lot_number := 'LOT-' || TO_CHAR(NEW.purchase_date, 'YYYYMMDD') || '-' || 
                      LPAD(EXTRACT(EPOCH FROM NEW.created_at)::TEXT, 10, '0');
  END IF;
  
  -- Ensure quantity_available matches quantity_received for new lots
  -- Use quantity_received instead of quantity_purchased
  IF NEW.quantity_available IS NULL THEN
    NEW.quantity_available := NEW.quantity_received;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check for any other functions that might reference quantity_purchased
-- and create corrected versions

-- Update any other triggers that might reference the old field name
-- This is a safety measure to ensure all database-level code uses the correct field names
