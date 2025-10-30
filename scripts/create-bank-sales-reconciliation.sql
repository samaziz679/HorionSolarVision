-- Drop the old sale_id column from bank_entries if it exists
ALTER TABLE public.bank_entries DROP COLUMN IF EXISTS sale_id;

-- Create junction table for many-to-many relationship between bank entries and sales
CREATE TABLE IF NOT EXISTS public.bank_sales_reconciliation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_entry_id uuid NOT NULL,
  sale_id uuid NOT NULL,
  reconciled_amount numeric(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid NULL,
  notes text NULL,
  CONSTRAINT bank_sales_reconciliation_pkey PRIMARY KEY (id),
  CONSTRAINT bank_sales_reconciliation_bank_entry_fkey 
    FOREIGN KEY (bank_entry_id) 
    REFERENCES public.bank_entries (id) 
    ON DELETE CASCADE,
  CONSTRAINT bank_sales_reconciliation_sale_fkey 
    FOREIGN KEY (sale_id) 
    REFERENCES public.sales (id) 
    ON DELETE CASCADE,
  CONSTRAINT bank_sales_reconciliation_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users (id)
);

-- Create indexes for better query performance
CREATE INDEX idx_bank_sales_reconciliation_bank_entry ON public.bank_sales_reconciliation(bank_entry_id);
CREATE INDEX idx_bank_sales_reconciliation_sale ON public.bank_sales_reconciliation(sale_id);

-- Add unique constraint to prevent duplicate links
CREATE UNIQUE INDEX idx_bank_sales_reconciliation_unique 
  ON public.bank_sales_reconciliation(bank_entry_id, sale_id);

-- Add comments
COMMENT ON TABLE public.bank_sales_reconciliation IS 'Junction table linking bank entries to sales for reconciliation';
COMMENT ON COLUMN public.bank_sales_reconciliation.reconciled_amount IS 'The amount from this sale that was included in the bank deposit';
