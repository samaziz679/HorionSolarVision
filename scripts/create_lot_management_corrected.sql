-- Create lot management system without duplicate constraints
-- Creating lot management tables with proper foreign key references

-- Create stock_lots table for batch/lot tracking
CREATE TABLE IF NOT EXISTS stock_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    quantity_remaining INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    expiry_date DATE,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id UUID REFERENCES suppliers(id),
    purchase_id UUID REFERENCES purchases(id),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, lot_number)
);

-- Create stock_movements table for detailed tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES stock_lots(id) ON DELETE SET NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    reference_type VARCHAR(20) CHECK (reference_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER')),
    reference_id UUID,
    notes TEXT,
    movement_date TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create view for lot status with expiry alerts
CREATE OR REPLACE VIEW lot_status_view AS
SELECT 
    sl.id,
    sl.lot_number,
    p.name as product_name,
    sl.quantity_remaining,
    sl.expiry_date,
    sl.received_date,
    s.name as supplier_name,
    CASE 
        WHEN sl.expiry_date IS NOT NULL AND sl.expiry_date <= CURRENT_DATE THEN 'EXPIRED'
        WHEN sl.expiry_date IS NOT NULL AND sl.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING_SOON'
        WHEN sl.quantity_remaining <= 0 THEN 'EMPTY'
        ELSE 'ACTIVE'
    END as status,
    CASE 
        WHEN sl.expiry_date IS NOT NULL THEN sl.expiry_date - CURRENT_DATE
        ELSE NULL
    END as days_to_expiry
FROM stock_lots sl
JOIN products p ON sl.product_id = p.id
LEFT JOIN suppliers s ON sl.supplier_id = s.id
WHERE sl.quantity_remaining > 0 OR sl.expiry_date > CURRENT_DATE - INTERVAL '90 days';

-- Create function for FIFO stock allocation
CREATE OR REPLACE FUNCTION allocate_stock_fifo(
    p_product_id UUID,
    p_quantity_needed INTEGER,
    p_created_by UUID DEFAULT NULL
) RETURNS TABLE(lot_id UUID, allocated_quantity INTEGER) AS $$
DECLARE
    lot_record RECORD;
    remaining_needed INTEGER := p_quantity_needed;
    allocated_qty INTEGER;
BEGIN
    -- Get lots ordered by FIFO (oldest first, expiring first)
    FOR lot_record IN 
        SELECT id, quantity_remaining, expiry_date
        FROM stock_lots 
        WHERE product_id = p_product_id 
        AND quantity_remaining > 0
        ORDER BY 
            CASE WHEN expiry_date IS NOT NULL THEN expiry_date ELSE '2099-12-31'::DATE END ASC,
            received_date ASC
    LOOP
        IF remaining_needed <= 0 THEN
            EXIT;
        END IF;
        
        -- Calculate how much to allocate from this lot
        allocated_qty := LEAST(lot_record.quantity_remaining, remaining_needed);
        
        -- Update lot quantity
        UPDATE stock_lots 
        SET quantity_remaining = quantity_remaining - allocated_qty,
            updated_at = NOW()
        WHERE id = lot_record.id;
        
        -- Record the movement
        INSERT INTO stock_movements (
            product_id, lot_id, movement_type, quantity, 
            reference_type, created_by
        ) VALUES (
            p_product_id, lot_record.id, 'OUT', allocated_qty,
            'SALE', p_created_by
        );
        
        -- Return allocation details
        lot_id := lot_record.id;
        allocated_quantity := allocated_qty;
        RETURN NEXT;
        
        remaining_needed := remaining_needed - allocated_qty;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create function to add stock with lot tracking
CREATE OR REPLACE FUNCTION add_stock_with_lot(
    p_product_id UUID,
    p_quantity INTEGER,
    p_unit_cost DECIMAL DEFAULT 0,
    p_lot_number VARCHAR DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL,
    p_supplier_id UUID DEFAULT NULL,
    p_purchase_id UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    lot_id UUID;
    generated_lot_number VARCHAR(100);
BEGIN
    -- Generate lot number if not provided
    IF p_lot_number IS NULL THEN
        generated_lot_number := 'LOT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    ELSE
        generated_lot_number := p_lot_number;
    END IF;
    
    -- Create or update lot
    INSERT INTO stock_lots (
        product_id, lot_number, quantity_received, quantity_remaining,
        unit_cost, expiry_date, supplier_id, purchase_id, created_by
    ) VALUES (
        p_product_id, generated_lot_number, p_quantity, p_quantity,
        p_unit_cost, p_expiry_date, p_supplier_id, p_purchase_id, p_created_by
    ) 
    ON CONFLICT (product_id, lot_number) 
    DO UPDATE SET 
        quantity_received = stock_lots.quantity_received + p_quantity,
        quantity_remaining = stock_lots.quantity_remaining + p_quantity,
        updated_at = NOW()
    RETURNING id INTO lot_id;
    
    -- Record stock movement
    INSERT INTO stock_movements (
        product_id, lot_id, movement_type, quantity, unit_price,
        reference_type, reference_id, created_by
    ) VALUES (
        p_product_id, lot_id, 'IN', p_quantity, p_unit_cost,
        'PURCHASE', p_purchase_id, p_created_by
    );
    
    RETURN lot_id;
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
