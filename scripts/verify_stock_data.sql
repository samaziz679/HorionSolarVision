-- Verify current stock data and view
SELECT 
  p.name,
  p.seuil_stock_bas,
  COALESCE(SUM(sl.quantity_remaining), 0) as actual_stock,
  csv.total_stock as view_stock
FROM products p
LEFT JOIN stock_lots sl ON p.id = sl.product_id AND sl.quantity_remaining > 0
LEFT JOIN current_stock_with_batches csv ON p.id = csv.id
GROUP BY p.id, p.name, p.seuil_stock_bas, csv.total_stock
ORDER BY p.name;

-- Check if view exists and is working
SELECT * FROM current_stock_with_batches LIMIT 5;

-- Check stock lots data
SELECT 
  sl.product_id,
  p.name,
  sl.lot_number,
  sl.quantity_remaining,
  sl.purchase_date
FROM stock_lots sl
JOIN products p ON sl.product_id = p.id
WHERE sl.quantity_remaining > 0
ORDER BY p.name, sl.purchase_date;
