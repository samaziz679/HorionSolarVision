-- Update all database functions to use quantity_received instead of quantity_purchased
-- This fixes the remaining references causing the bulk import errors

-- 1. Fix adjust_product_quantity_on_purchase_update function
CREATE OR REPLACE FUNCTION adjust_product_quantity_on_purchase_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only adjust if product_id is the same, otherwise it's a transfer
    IF OLD.product_id = NEW.product_id THEN
        UPDATE products 
        SET quantity = quantity - OLD.quantity + NEW.quantity
        WHERE id = NEW.product_id;
    ELSE
        -- If product_id changes, revert old product and add to new product
        UPDATE products 
        SET quantity = quantity - OLD.quantity
        WHERE id = OLD.product_id;
        
        UPDATE products 
        SET quantity = quantity + NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Fix revert_product_quantity_on_purchase_delete function
CREATE OR REPLACE FUNCTION revert_product_quantity_on_purchase_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET quantity = quantity - OLD.quantity
    WHERE id = OLD.product_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. Fix update_product_quantity_on_purchase function
CREATE OR REPLACE FUNCTION update_product_quantity_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Ensure set_lot_number function is correct (this should already be fixed)
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

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'All database functions have been updated to use quantity_received instead of quantity_purchased';
END $$;
