-- Expand lead/booking service types for Deep Cleaning, Retail, and Post-Construction.

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_service_interest_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_service_interest_check
  CHECK (
    service_interest IS NULL
    OR service_interest IN (
      'commercial',
      'retail',
      'deep_cleaning',
      'end_of_tenancy',
      'university',
      'new_build',
      'post_construction',
      'airbnb',
      'stadium',
      'other'
    )
  );

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_service_type_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_service_type_check
  CHECK (
    service_type IS NULL
    OR service_type IN (
      'commercial',
      'retail',
      'deep_cleaning',
      'end_of_tenancy',
      'university',
      'new_build',
      'post_construction',
      'airbnb',
      'stadium',
      'other'
    )
  );
