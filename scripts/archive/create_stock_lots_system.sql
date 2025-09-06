-- Creating comprehensive stock lots/batch tracking system
-- This enables tracking different batches of the same product from different purchases

-- Create stock_lots table to track individual batches
CREATE TABLE IF NOT EXISTS stock_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  lot_number VARCHAR(50) NOT NULL, -- Auto-generated lot number (e.g., LOT-2025-001)
  quantity_received INTEGER NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL DEFAULT 0, -- Remaining quantity after sales
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ, -- Optional expiry date for products
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure lot numbers are unique
  CONSTRAINT unique_lot_number UNIQUE (lot_number),
  -- Ensure available quantity doesn't exceed received quantity
  CONSTRAINT valid_available_quantity CHECK (quantity_available <= quantity_received AND quantity_available >= 0)
);

-- Create stock_movements table to track all stock changes
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_lot_id UUID NOT NULL REFERENCES stock_lots(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(20) CHECK (reference_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT')),
  reference_id UUID, -- ID of the purchase, sale, or adjustment
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_lots_product_id ON stock_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_purchase_id ON stock_lots(purchase_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_purchase_date ON stock_lots(purchase_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_stock_lot_id ON stock_movements(stock_lot_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- Create function to generate lot numbers
CREATE OR REPLACE FUNCTION generate_lot_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  lot_number TEXT;
BEGIN
  -- Get current year
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN lot_number ~ ('^LOT-' || year_part || '-[0-9]+$') 
      THEN CAST(SUBSTRING(lot_number FROM '^LOT-' || year_part || '-([0-9]+)$') AS INTEGER)
      ELSE 0 
    END
  ), 0) + 1
  INTO sequence_num
  FROM stock_lots;
  
  -- Format lot number as LOT-YYYY-NNN
  lot_number := 'LOT-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN lot_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate lot numbers
CREATE OR REPLACE FUNCTION set_lot_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lot_number IS NULL OR NEW.lot_number = '' THEN
    NEW.lot_number := generate_lot_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lot_number
  BEFORE INSERT ON stock_lots
  FOR EACH ROW
  EXECUTE FUNCTION set_lot_number();

-- Create trigger to update stock_lots.updated_at
CREATE OR REPLACE FUNCTION update_stock_lot_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_lot_timestamp
  BEFORE UPDATE ON stock_lots
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_lot_timestamp();

-- Create function to get current stock with batch details
CREATE OR REPLACE VIEW current_stock_with_batches AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.type as product_type,
  p.unit,
  SUM(sl.quantity_available) as total_quantity,
  COUNT(sl.id) as batch_count,
  MIN(sl.purchase_date) as oldest_batch_date,
  MAX(sl.purchase_date) as newest_batch_date,
  AVG(sl.unit_cost) as average_cost,
  p.prix_vente_detail_1,
  p.prix_vente_detail_2,
  p.prix_vente_gros,
  CASE 
    WHEN SUM(sl.quantity_available) <= 5 THEN 'Critical'
    WHEN SUM(sl.quantity_available) <= 10 THEN 'Low'
    ELSE 'Normal'
  END as stock_status
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_available > 0
GROUP BY p.id, p.name, p.type, p.unit, p.prix_vente_detail_1, p.prix_vente_detail_2, p.prix_vente_gros
ORDER BY p.name;

-- Enable RLS on new tables
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stock_lots
CREATE POLICY "Users can view stock_lots" ON stock_lots FOR SELECT USING (true);
CREATE POLICY "Users can insert stock_lots" ON stock_lots FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update stock_lots" ON stock_lots FOR UPDATE USING (true);
CREATE POLICY "Users can delete stock_lots" ON stock_lots FOR DELETE USING (true);

-- Create RLS policies for stock_movements
CREATE POLICY "Users can view stock_movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Users can insert stock_movements" ON stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update stock_movements" ON stock_movements FOR UPDATE USING (true);
CREATE POLICY "Users can delete stock_movements" ON stock_movements FOR DELETE USING (true);

-- Insert sample data to demonstrate the system (optional)
-- This will be populated when purchases are made through the application

COMMENT ON TABLE stock_lots IS 'Tracks individual batches/lots of products from different purchases';
COMMENT ON TABLE stock_movements IS 'Records all stock movements (in/out/adjustments) for audit trail';
COMMENT ON VIEW current_stock_with_batches IS 'Current stock levels with batch information for inventory management';
