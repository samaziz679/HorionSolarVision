-- Script to inspect actual column names in database tables
-- This will help identify the correct column names for security fixes

-- Check products table columns
SELECT 'PRODUCTS TABLE' as table_info, '' as column_name, '' as data_type, '' as is_nullable
UNION ALL
SELECT '', column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY table_info DESC, column_name;

-- Check sales table columns  
SELECT 'SALES TABLE' as table_info, '' as column_name, '' as data_type, '' as is_nullable
UNION ALL
SELECT '', column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sales' 
AND table_schema = 'public'
ORDER BY table_info DESC, column_name;

-- Check company_settings table columns
SELECT 'COMPANY_SETTINGS TABLE' as table_info, '' as column_name, '' as data_type, '' as is_nullable
UNION ALL
SELECT '', column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
AND table_schema = 'public'
ORDER BY table_info DESC, column_name;

-- Check all existing views that might need security fixes
SELECT 'EXISTING VIEWS' as view_info, '' as view_name
UNION ALL
SELECT '', table_name
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('current_stock', 'financial_summary', 'total_sales_per_product')
ORDER BY view_info DESC, view_name;
