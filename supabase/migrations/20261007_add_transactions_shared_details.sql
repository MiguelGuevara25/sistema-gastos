-- Store participant and reimbursement data for shared expenses.
-- Safe to run more than once.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS shared_details JSONB;

-- Refresh PostgREST's schema cache so the new column is available immediately.
NOTIFY pgrst, 'reload schema';
