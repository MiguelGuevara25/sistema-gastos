-- Store the destination account for transfers between accounts.
-- Safe to run more than once.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS to_account_id UUID
  REFERENCES public.accounts(id) ON DELETE SET NULL;

-- Refresh PostgREST's schema cache so the new column is available immediately.
NOTIFY pgrst, 'reload schema';
