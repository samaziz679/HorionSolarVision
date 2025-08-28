-- Migration script to create stock lots for existing purchases
-- This will create stock lot entries for all existing purchases

-- First, let's see what existing purchases we have
SELECT 
    p.id as purchase_id,
    p.product_id,
    pr.name as product_name,
    p.quantity,
    p.unit_price,
    p.purchase_date,
    p.created_at
FROM purchases p
JOIN products pr ON p.product_id = pr.id
ORDER BY p.purchase_date ASC;

-- Create stock lots for existing purchases
INSERT INTO stock_lots (
    product_id,
    purchase_id,
    lot_number,
    quantity_received,
    quantity_available,
    unit_cost,
    purchase_date,
    created_by
)
SELECT 
    p.product_id,
    p.id as purchase_id,
    'LOT-' || TO_CHAR(p.purchase_date, 'YYYY') || '-' || 
    LPAD(ROW_NUMBER() OVER (ORDER BY p.purchase_date, p.created_at)::TEXT, 3, '0') as lot_number,
    p.quantity as quantity_received,
    p.quantity as quantity_available, -- Initially all quantity is available
    p.unit_price as unit_cost,
    p.purchase_date,
    p.created_by
FROM purchases p
WHERE NOT EXISTS (
    SELECT 1 FROM stock_lots sl WHERE sl.purchase_id = p.id
);

-- Create stock movements for the initial stock lots
INSERT INTO stock_movements (
    stock_lot_id,
    movement_type,
    quantity,
    reference_type,
    reference_id,
    movement_date,
    notes,
    created_by
)
SELECT 
    sl.id as stock_lot_id,
    'IN' as movement_type,
    sl.quantity_received as quantity,
    'purchase' as reference_type,
    sl.purchase_id as reference_id,
    sl.purchase_date as movement_date,
    'Initial stock from purchase migration' as notes,
    sl.created_by
FROM stock_lots sl
WHERE NOT EXISTS (
    SELECT 1 FROM stock_movements sm 
    WHERE sm.stock_lot_id = sl.id AND sm.reference_type = 'purchase'
);

-- Show summary of created stock lots
SELECT 
    pr.name as product_name,
    COUNT(sl.id) as total_lots,
    SUM(sl.quantity_available) as total_available_quantity,
    MIN(sl.purchase_date) as oldest_batch,
    MAX(sl.purchase_date) as newest_batch
FROM stock_lots sl
JOIN products pr ON sl.product_id = pr.id
GROUP BY pr.id, pr.name
ORDER BY pr.name;
