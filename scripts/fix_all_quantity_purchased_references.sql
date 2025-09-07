-- Comprehensive fix for all quantity_purchased field references in database
-- This script finds and updates all functions, triggers, and views that reference the old field name

-- First, let's check what functions exist that might reference quantity_purchased
DO $$
DECLARE
    func_record RECORD;
    new_definition TEXT;
BEGIN
    -- Find all functions that contain 'quantity_purchased' in their definition
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            n.nspname as schema_name,
            pg_get_functiondef(p.oid) as function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE pg_get_functiondef(p.oid) ILIKE '%quantity_purchased%'
        AND n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Found function with quantity_purchased reference: %.%', func_record.schema_name, func_record.function_name;
        
        -- Replace quantity_purchased with quantity_received in the function definition
        new_definition := REPLACE(func_record.function_definition, 'quantity_purchased', 'quantity_received');
        
        -- Execute the corrected function definition
        EXECUTE new_definition;
        
        RAISE NOTICE 'Updated function: %.%', func_record.schema_name, func_record.function_name;
    END LOOP;
END $$;

-- Also check for any triggers that might have this reference
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT 
            t.tgname as trigger_name,
            c.relname as table_name,
            p.proname as function_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE pg_get_functiondef(p.oid) ILIKE '%quantity_purchased%'
        AND c.relname = 'stock_lots'
    LOOP
        RAISE NOTICE 'Found trigger % on table % using function % with quantity_purchased reference', 
                     trigger_record.trigger_name, trigger_record.table_name, trigger_record.function_name;
    END LOOP;
END $$;

-- Specifically recreate the set_lot_number function with correct field names
CREATE OR REPLACE FUNCTION set_lot_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate lot number based on product and purchase date
    NEW.lot_number := CONCAT(
        UPPER(SUBSTRING((SELECT name FROM products WHERE id = NEW.product_id), 1, 3)),
        '-',
        TO_CHAR(NEW.purchase_date, 'YYYYMMDD'),
        '-',
        LPAD(NEXTVAL('lot_number_seq')::TEXT, 3, '0')
    );
    
    -- Set quantity_available to quantity_received if not specified
    IF NEW.quantity_available IS NULL THEN
        NEW.quantity_available := NEW.quantity_received;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate any other common functions that might reference the old field
CREATE OR REPLACE FUNCTION update_product_quantity_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product total quantity when stock lot is created
    UPDATE products 
    SET quantity = quantity + NEW.quantity_received,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if this trigger exists and recreate it
DROP TRIGGER IF EXISTS trigger_update_product_quantity_on_purchase ON stock_lots;
CREATE TRIGGER trigger_update_product_quantity_on_purchase
    AFTER INSERT ON stock_lots
    FOR EACH ROW
    EXECUTE FUNCTION update_product_quantity_on_purchase();

-- Ensure the lot number trigger is properly set
DROP TRIGGER IF EXISTS trigger_set_lot_number ON stock_lots;
CREATE TRIGGER trigger_set_lot_number
    BEFORE INSERT ON stock_lots
    FOR EACH ROW
    EXECUTE FUNCTION set_lot_number();

-- Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS lot_number_seq START 1;

-- Wrap RAISE NOTICE in DO block to fix syntax error
DO $$
BEGIN
    RAISE NOTICE 'All quantity_purchased references have been updated to quantity_received';
END $$;
