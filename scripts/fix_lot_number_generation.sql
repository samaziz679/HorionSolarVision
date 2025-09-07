-- Fix lot number generation to prevent duplicates during bulk imports
-- Use sequence to ensure unique lot numbers

CREATE OR REPLACE FUNCTION set_lot_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate unique lot number using sequence
    IF NEW.lot_number IS NULL OR NEW.lot_number = '' THEN
        NEW.lot_number := 'LOT-' || TO_CHAR(NEW.purchase_date, 'YYYYMMDD') || '-' || 
                         LPAD(nextval('lot_number_seq')::TEXT, 6, '0');
    END IF;
    
    -- Ensure quantity_available matches quantity_received for new lots
    IF NEW.quantity_available IS NULL THEN
        NEW.quantity_available := NEW.quantity_received;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Lot number generation fixed to use sequence for uniqueness';
END $$;
