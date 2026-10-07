-- Add the column expected by the application when persisting transfers.
-- Safe to run more than once.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_transfer BOOLEAN NOT NULL DEFAULT FALSE;

-- Refresh PostgREST's schema cache so the new column is available immediately.
NOTIFY pgrst, 'reload schema';
