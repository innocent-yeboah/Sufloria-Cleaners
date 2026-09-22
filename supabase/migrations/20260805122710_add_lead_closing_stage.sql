ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'quoted', 'closing', 'booked', 'lost'));

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS closing_at TIMESTAMPTZ;
