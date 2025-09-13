-- Create lot management tables and functions
-- Adding comprehensive lot/batch tracking system

-- Stock lots table for batch tracking
CREATE TABLE IF NOT EXISTS stock_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) NOT NULL,
    batch_number VARCHAR(100),
    supplier_id UUID REFERENCES suppliers(id),
    purchase_id UUID REFERENCES purchases(id),
    manufacture_date DATE,
    expiry_date DATE,
    initial_quantity INTEGER NOT NULL DEFAULT 0,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'recalled', 'sold_out')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, lot_number)
);

-- Stock movements with lot tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES stock_lots(id) ON DELETE SET NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(20) CHECK (reference_type IN ('purchase', 'sale', 'adjustment', 'transfer', 'return')),
    reference_id UUID,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reason TEXT,
    performed_by UUID REFERENCES user_profiles(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lot allocations for sales (FIFO/LIFO tracking)
CREATE TABLE IF NOT EXISTS lot_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    lot_id UUID NOT NULL REFERENCES stock_lots(id),
    quantity_allocated INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all operations for authenticated users" ON stock_lots FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON stock_movements FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON lot_allocations FOR ALL TO authenticated USING (true);

-- Function to get available lots for a product (FIFO order)
CREATE OR REPLACE FUNCTION get_available_lots(p_product_id UUID)
RETURNS TABLE (
    lot_id UUID,
    lot_number VARCHAR,
    current_quantity INTEGER,
    unit_cost DECIMAL,
    expiry_date DATE,
    days_to_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.id,
        sl.lot_number,
        sl.current_quantity,
        sl.unit_cost,
        sl.expiry_date,
        CASE 
            WHEN sl.expiry_date IS NOT NULL 
            THEN (sl.expiry_date - CURRENT_DATE)::INTEGER
            ELSE NULL
        END as days_to_expiry
    FROM stock_lots sl
    WHERE sl.product_id = p_product_id
        AND sl.current_quantity > 0
        AND sl.status = 'active'
    ORDER BY 
        CASE WHEN sl.expiry_date IS NOT NULL THEN sl.expiry_date END ASC NULLS LAST,
        sl.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to allocate stock from lots (FIFO)
CREATE OR REPLACE FUNCTION allocate_stock_fifo(
    p_product_id UUID,
    p_quantity INTEGER,
    p_sale_id UUID DEFAULT NULL
) RETURNS TABLE (
    lot_id UUID,
    lot_number VARCHAR,
    allocated_quantity INTEGER,
    unit_cost DECIMAL
) AS $$
DECLARE
    remaining_qty INTEGER := p_quantity;
    lot_record RECORD;
    allocated_qty INTEGER;
BEGIN
    -- Get available lots in FIFO order
    FOR lot_record IN 
        SELECT * FROM get_available_lots(p_product_id)
        WHERE current_quantity > 0
    LOOP
        -- Calculate how much to allocate from this lot
        allocated_qty := LEAST(remaining_qty, lot_record.current_quantity);
        
        -- Update lot quantity
        UPDATE stock_lots 
        SET current_quantity = current_quantity - allocated_qty,
            updated_at = NOW()
        WHERE id = lot_record.lot_id;
        
        -- Record allocation if sale_id provided
        IF p_sale_id IS NOT NULL THEN
            INSERT INTO lot_allocations (sale_id, product_id, lot_id, quantity_allocated, unit_price)
            VALUES (p_sale_id, p_product_id, lot_record.lot_id, allocated_qty, lot_record.unit_cost);
        END IF;
        
        -- Return allocation details
        RETURN QUERY SELECT 
            lot_record.lot_id,
            lot_record.lot_number,
            allocated_qty,
            lot_record.unit_cost;
        
        remaining_qty := remaining_qty - allocated_qty;
        
        -- Exit if we've allocated enough
        EXIT WHEN remaining_qty <= 0;
    END LOOP;
    
    -- Check if we couldn't allocate enough
    IF remaining_qty > 0 THEN
        RAISE EXCEPTION 'Insufficient stock: could not allocate % units, % remaining', p_quantity, remaining_qty;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to add stock to lot
CREATE OR REPLACE FUNCTION add_stock_to_lot(
    p_product_id UUID,
    p_lot_number VARCHAR,
    p_quantity INTEGER,
    p_unit_cost DECIMAL DEFAULT NULL,
    p_supplier_id UUID DEFAULT NULL,
    p_purchase_id UUID DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL,
    p_batch_number VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    lot_id UUID;
BEGIN
    -- Insert or update lot
    INSERT INTO stock_lots (
        product_id, lot_number, batch_number, supplier_id, purchase_id,
        initial_quantity, current_quantity, unit_cost, expiry_date
    ) VALUES (
        p_product_id, p_lot_number, p_batch_number, p_supplier_id, p_purchase_id,
        p_quantity, p_quantity, p_unit_cost, p_expiry_date
    )
    ON CONFLICT (product_id, lot_number) 
    DO UPDATE SET
        current_quantity = stock_lots.current_quantity + p_quantity,
        initial_quantity = stock_lots.initial_quantity + p_quantity,
        updated_at = NOW()
    RETURNING id INTO lot_id;
    
    -- Record stock movement
    INSERT INTO stock_movements (
        product_id, lot_id, movement_type, quantity, 
        reference_type, reference_id, unit_cost, total_cost
    ) VALUES (
        p_product_id, lot_id, 'in', p_quantity,
        'purchase', p_purchase_id, p_unit_cost, p_unit_cost * p_quantity
    );
    
    RETURN lot_id;
END;
$$ LANGUAGE plpgsql;

-- View for lot summary with expiry alerts
CREATE OR REPLACE VIEW lot_summary AS
SELECT 
    sl.id,
    sl.lot_number,
    sl.batch_number,
    p.name as product_name,
    p.sku as product_sku,
    sl.current_quantity,
    sl.initial_quantity,
    sl.unit_cost,
    sl.expiry_date,
    CASE 
        WHEN sl.expiry_date IS NOT NULL THEN (sl.expiry_date - CURRENT_DATE)::INTEGER
        ELSE NULL
    END as days_to_expiry,
    CASE 
        WHEN sl.expiry_date IS NOT NULL AND sl.expiry_date <= CURRENT_DATE THEN 'expired'
        WHEN sl.expiry_date IS NOT NULL AND sl.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        WHEN sl.current_quantity = 0 THEN 'sold_out'
        ELSE 'active'
    END as alert_status,
    sl.location,
    s.name as supplier_name,
    sl.created_at
FROM stock_lots sl
JOIN products p ON sl.product_id = p.id
LEFT JOIN suppliers s ON sl.supplier_id = s.id
WHERE sl.status = 'active'
ORDER BY 
    CASE WHEN sl.expiry_date IS NOT NULL THEN sl.expiry_date END ASC NULLS LAST,
    sl.created_at DESC;

-- View for stock movements with lot details
CREATE OR REPLACE VIEW stock_movements_detailed AS
SELECT 
    sm.id,
    sm.movement_type,
    sm.quantity,
    sm.reference_type,
    sm.reference_id,
    sm.unit_cost,
    sm.total_cost,
    sm.reason,
    p.name as product_name,
    p.sku as product_sku,
    sl.lot_number,
    sl.batch_number,
    up.full_name as performed_by_name,
    sm.created_at
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
LEFT JOIN stock_lots sl ON sm.lot_id = sl.id
LEFT JOIN user_profiles up ON sm.performed_by = up.user_id
ORDER BY sm.created_at DESC;

-- Trigger to update stock_lots status
CREATE OR REPLACE FUNCTION update_lot_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on quantity and expiry
    UPDATE stock_lots 
    SET status = CASE 
        WHEN current_quantity = 0 THEN 'sold_out'
        WHEN expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE THEN 'expired'
        ELSE 'active'
    END,
    updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_lot_status
    AFTER UPDATE OF current_quantity ON stock_lots
    FOR EACH ROW
    EXECUTE FUNCTION update_lot_status();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_lots_product_id ON stock_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_status ON stock_lots(status);
CREATE INDEX IF NOT EXISTS idx_stock_lots_expiry ON stock_lots(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_lot_id ON stock_movements(lot_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_lot_allocations_sale_id ON lot_allocations(sale_id);
