-- Sufloria Cleaners: service list, extra quote fields, brand settings, private photo bucket

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_service_interest_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_service_interest_check
  CHECK (
    service_interest IS NULL
    OR service_interest IN (
      'end_of_tenancy',
      'move_in',
      'after_builders',
      'sparkle_handover',
      'deep_cleaning',
      'commercial',
      'airbnb',
      'carpet',
      'oven_appliance',
      'decluttering',
      'other'
    )
  );

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_service_type_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_service_type_check
  CHECK (
    service_type IS NULL
    OR service_type IN (
      'end_of_tenancy',
      'move_in',
      'after_builders',
      'sparkle_handover',
      'deep_cleaning',
      'commercial',
      'airbnb',
      'carpet',
      'oven_appliance',
      'decluttering',
      'other'
    )
  );

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS photo_paths TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS enquiry_type TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS postcode TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferred_date DATE;

UPDATE public.company_settings
SET
  company_name = 'Sufloria Cleaners',
  trading_name = 'Sufloria Cleaning',
  email = 'contact@sufloriacleaners.com',
  phone = '07386 544703',
  website = 'https://sufloriacleaning.com',
  invoice_prefix = 'SUF',
  timezone = 'Europe/London'
WHERE true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-photos', 'quote-photos', false)
ON CONFLICT (id) DO NOTHING;
