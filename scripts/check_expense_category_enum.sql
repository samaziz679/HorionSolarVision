-- Check the expense_category enum values
SELECT unnest(enum_range(NULL::expense_category)) as enum_value;

-- Also check existing expense categories in the table
SELECT name_fr, name_en FROM expense_categories ORDER BY name_fr;
