-- Staff IDs + richer individual profiles for ROSCA admin OS

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS staff_prefix TEXT NOT NULL DEFAULT 'RCS-S',
  ADD COLUMN IF NOT EXISTS staff_next_number INTEGER NOT NULL DEFAULT 1001;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS staff_id TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_staff_id_uidx
  ON public.profiles (staff_id)
  WHERE staff_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.allocate_staff_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  next_num INTEGER;
  generated TEXT;
  settings_id UUID;
BEGIN
  SELECT id, staff_prefix, staff_next_number
  INTO settings_id, prefix, next_num
  FROM public.company_settings
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
  FOR UPDATE;

  IF settings_id IS NULL THEN
    prefix := 'RCS-S';
    next_num := 1001;
    INSERT INTO public.company_settings (staff_prefix, staff_next_number)
    VALUES (prefix, next_num + 1);
  ELSE
    UPDATE public.company_settings
    SET staff_next_number = next_num + 1,
        updated_at = NOW()
    WHERE id = settings_id;
  END IF;

  generated := prefix || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN generated;
END;
$$;

REVOKE ALL ON FUNCTION public.allocate_staff_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.allocate_staff_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.allocate_staff_id() TO authenticated;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM public.profiles
    WHERE staff_id IS NULL
    ORDER BY created_at ASC
  LOOP
    UPDATE public.profiles
    SET staff_id = public.allocate_staff_id(),
        updated_at = NOW()
    WHERE id = r.id;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, staff_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    COALESCE(NEW.raw_app_meta_data->>'role', 'cleaner'),
    public.allocate_staff_id()
  )
  ON CONFLICT (id) DO UPDATE
    SET staff_id = COALESCE(public.profiles.staff_id, EXCLUDED.staff_id),
        full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        role = COALESCE(NULLIF(EXCLUDED.role, ''), public.profiles.role),
        updated_at = NOW();
  RETURN NEW;
END;
$$;
