-- Expand company/system settings for professional UK operations

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS trading_name TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS registered_address TEXT,
  ADD COLUMN IF NOT EXISTS company_number TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/London',
  ADD COLUMN IF NOT EXISTS support_email TEXT,
  ADD COLUMN IF NOT EXISTS invoice_footer TEXT;

UPDATE public.company_settings
SET
  trading_name = COALESCE(trading_name, company_name),
  support_email = COALESCE(support_email, email),
  website = COALESCE(website, 'https://roscacleaningsolutions.com'),
  currency = COALESCE(currency, 'GBP'),
  timezone = COALESCE(timezone, 'Europe/London')
WHERE TRUE;
