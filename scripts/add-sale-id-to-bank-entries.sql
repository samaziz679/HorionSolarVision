-- Add sale_id column to bank_entries table for reconciliation
ALTER TABLE public.bank_entries
ADD COLUMN sale_id uuid NULL,
ADD CONSTRAINT bank_entries_sale_id_fkey 
  FOREIGN KEY (sale_id) 
  REFERENCES public.sales (id) 
  ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_bank_entries_sale_id ON public.bank_entries(sale_id);

-- Add comment to explain the column
COMMENT ON COLUMN public.bank_entries.sale_id IS 'Links bank entry to a sale for reconciliation purposes';
