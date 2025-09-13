-- Fix user_profiles table constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);

-- Add unique constraint on email if not exists
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Now create the lot management system with proper references
CREATE TABLE IF NOT EXISTS stock_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    quantity_remaining INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    supplier_id UUID REFERENCES suppliers(id),
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(user_id),
    UNIQUE(product_id, lot_number)
);

-- Create stock movements table for lot tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES stock_lots(id) ON DELETE SET NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(20) CHECK (reference_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER')),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(user_id)
);

-- Create lot allocation view
CREATE OR REPLACE VIEW lot_allocations AS
SELECT 
    sl.id as lot_id,
    sl.product_id,
    p.name as product_name,
    sl.lot_number,
    sl.quantity_remaining,
    sl.unit_cost,
    sl.received_date,
    sl.expiry_date,
    CASE 
        WHEN sl.expiry_date IS NOT NULL AND sl.expiry_date <= CURRENT_DATE + INTERVAL '30 days' 
        THEN 'EXPIRING_SOON'
        WHEN sl.expiry_date IS NOT NULL AND sl.expiry_date <= CURRENT_DATE 
        THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status
FROM stock_lots sl
JOIN products p ON sl.product_id = p.id
WHERE sl.quantity_remaining > 0
ORDER BY sl.expiry_date ASC NULLS LAST, sl.received_date ASC;

-- Function to allocate stock using FIFO
CREATE OR REPLACE FUNCTION allocate_stock_fifo(
    p_product_id UUID,
    p_quantity INTEGER,
    p_reference_type VARCHAR(20),
    p_reference_id UUID,
    p_user_id UUID
) RETURNS JSON AS $$
DECLARE
    remaining_qty INTEGER := p_quantity;
    lot_record RECORD;
    allocated_qty INTEGER;
    result JSON := '[]'::JSON;
BEGIN
    -- Get lots ordered by FIFO (oldest first, expiring first)
    FOR lot_record IN 
        SELECT * FROM stock_lots 
        WHERE product_id = p_product_id 
        AND quantity_remaining > 0
        ORDER BY expiry_date ASC NULLS LAST, received_date ASC
    LOOP
        IF remaining_qty <= 0 THEN EXIT; END IF;
        
        allocated_qty := LEAST(remaining_qty, lot_record.quantity_remaining);
        
        -- Update lot quantity
        UPDATE stock_lots 
        SET quantity_remaining = quantity_remaining - allocated_qty
        WHERE id = lot_record.id;
        
        -- Record movement
        INSERT INTO stock_movements (
            product_id, lot_id, movement_type, quantity, 
            reference_type, reference_id, created_by
        ) VALUES (
            p_product_id, lot_record.id, 'OUT', allocated_qty,
            p_reference_type, p_reference_id, p_user_id
        );
        
        remaining_qty := remaining_qty - allocated_qty;
        
        -- Add to result
        result := result || json_build_object(
            'lot_id', lot_record.id,
            'lot_number', lot_record.lot_number,
            'allocated_quantity', allocated_qty,
            'unit_cost', lot_record.unit_cost
        );
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all lots" ON stock_lots FOR SELECT USING (true);
CREATE POLICY "Users can insert lots" ON stock_lots FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update lots" ON stock_lots FOR UPDATE USING (true);

CREATE POLICY "Users can view all movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Users can insert movements" ON stock_movements FOR INSERT WITH CHECK (true);
