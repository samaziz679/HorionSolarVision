-- Migration script to convert existing direct inventory entries to stock lots
-- This handles inventory that was entered directly without purchase records

-- Create stock lots for existing inventory from current_stock view
INSERT INTO stock_lots (
  product_id,
  purchase_id,
  lot_number,
  quantity_received,
  quantity_available,
  unit_cost,
  purchase_date,
  expiry_date,
  notes,
  created_by
)
SELECT 
  cs.id as product_id,
  NULL as purchase_id, -- No purchase record for direct entries
  'INIT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY cs.name)::TEXT, 3, '0') as lot_number,
  cs.quantity as quantity_received,
  cs.quantity as quantity_available,
  COALESCE(cs.prix_achat, 0) as unit_cost,
  NOW() as purchase_date, -- Use current date as initial stock date
  NULL as expiry_date,
  'Initial inventory - migrated from direct entry' as notes,
  (SELECT id FROM auth.users LIMIT 1) as created_by -- Use first available user
FROM current_stock cs
WHERE cs.quantity > 0 -- Only migrate products with positive stock
  AND NOT EXISTS (
    -- Don't create lots for products that already have stock lots
    SELECT 1 FROM stock_lots sl WHERE sl.product_id = cs.id
  );

-- Create stock movements for the initial inventory
INSERT INTO stock_movements (
  stock_lot_id,
  movement_type,
  quantity,
  reference_type,
  reference_id,
  notes,
  created_by
)
SELECT 
  sl.id as stock_lot_id,
  'IN' as movement_type,
  sl.quantity_received as quantity,
  'ADJUSTMENT' as reference_type, -- Changed from 'INITIAL' to 'ADJUSTMENT' to match database constraint
  NULL as reference_id,
  'Initial inventory stock movement - migrated from direct entry' as notes,
  sl.created_by
FROM stock_lots sl
WHERE sl.notes = 'Initial inventory - migrated from direct entry';

-- Verify the migration
SELECT 
  p.name as product_name,
  sl.lot_number,
  sl.quantity_received,
  sl.quantity_available,
  sl.unit_cost,
  sl.purchase_date,
  sl.notes
FROM stock_lots sl
JOIN products p ON sl.product_id = p.id
WHERE sl.notes = 'Initial inventory - migrated from direct entry'
ORDER BY sl.lot_number;
