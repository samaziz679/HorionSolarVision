-- Get all table structures
SELECT 
    'TABLE' as object_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'sales', 'expenses', 'company_settings', 'banking', 'purchases', 'clients', 'suppliers')
ORDER BY table_name, ordinal_position;

-- Get view definitions
SELECT 
    'VIEW' as object_type,
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('current_stock', 'financial_summary', 'total_sales_per_product');

-- Get RLS status for tables
SELECT 
    'RLS_STATUS' as object_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('products', 'sales', 'expenses', 'company_settings', 'banking', 'purchases', 'clients', 'suppliers');
