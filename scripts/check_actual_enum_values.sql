-- Check what enum values actually exist in the database
SELECT 
    enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'expense_category'
);

-- Also check the enum type definition
SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'expense_category'
GROUP BY t.typname;
