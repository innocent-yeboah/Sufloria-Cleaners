-- ROSCA Cleaning Solutions — Admin Operating System schema
-- UK GDPR-minded: RLS on all tables, role-gated access via profiles

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cleaner'
    CHECK (role IN ('admin', 'manager', 'scheduler', 'cleaner', 'finance')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_active_idx ON public.profiles (is_active);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Role helpers (SECURITY INVOKER — never DEFINER for auth decisions)
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT role FROM public.profiles
  WHERE id = (SELECT auth.uid()) AND is_active = TRUE
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.has_ops_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin', 'manager', 'scheduler'), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.has_finance_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin', 'manager', 'finance'), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() = 'admin', FALSE);
$$;

CREATE OR REPLACE FUNCTION public.has_manager_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin', 'manager'), FALSE);
$$;

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    COALESCE(NEW.raw_app_meta_data->>'role', 'cleaner')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Core business tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT CHECK (service_interest IN (
    'commercial', 'end_of_tenancy', 'university', 'new_build', 'airbnb', 'stadium', 'other'
  )),
  property_size TEXT,
  property_type TEXT,
  message TEXT,
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'referral', 'call', 'email', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'booked', 'lost')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  quoted_at TIMESTAMPTZ,
  quote_amount NUMERIC(10, 2),
  booked_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);
CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON public.leads (assigned_to);

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  postcode TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'United Kingdom',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients (email);
CREATE INDEX IF NOT EXISTS clients_status_idx ON public.clients (status);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  service_type TEXT CHECK (service_type IN (
    'commercial', 'end_of_tenancy', 'university', 'new_build', 'airbnb', 'stadium', 'other'
  )),
  service_description TEXT,
  property_address TEXT,
  property_postcode TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  crew_size INTEGER NOT NULL DEFAULT 1,
  estimated_duration NUMERIC(4, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'
  )),
  price_quote NUMERIC(10, 2),
  final_price NUMERIC(10, 2),
  deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_amount NUMERIC(10, 2),
  paid_in_full BOOLEAN NOT NULL DEFAULT FALSE,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'deposit', 'partial', 'paid'
  )),
  notes TEXT,
  assigned_team UUID[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS bookings_date_idx ON public.bookings (booking_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
CREATE INDEX IF NOT EXISTS bookings_client_id_idx ON public.bookings (client_id);

CREATE TABLE IF NOT EXISTS public.job_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  task_description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'blocked'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_tasks_booking_id_idx ON public.job_tasks (booking_id);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_number TEXT UNIQUE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  vat_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'paid', 'overdue', 'cancelled'
  )),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method TEXT CHECK (payment_method IN (
    'bank_transfer', 'card', 'cash', 'cheque'
  )),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices (status);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON public.invoices (due_date);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expense_date DATE NOT NULL,
  category TEXT CHECK (category IN (
    'equipment', 'supplies', 'transport', 'salaries', 'utilities',
    'rent', 'marketing', 'insurance', 'training', 'other'
  )),
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  vendor TEXT,
  receipt_url TEXT,
  project_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  item_name TEXT NOT NULL,
  category TEXT CHECK (category IN (
    'cleaning_equipment', 'chemicals', 'ppe', 'vehicles', 'office_supplies', 'other'
  )),
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  available INTEGER NOT NULL DEFAULT 1,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')),
  supplier TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(10, 2),
  location TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS equipment_set_updated_at ON public.equipment;
CREATE TRIGGER equipment_set_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.staff_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift TEXT CHECK (shift IN ('morning', 'afternoon', 'evening', 'full_day')),
  hours NUMERIC(4, 2),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS staff_schedule_date_idx ON public.staff_schedule (date);
CREATE INDEX IF NOT EXISTS staff_schedule_user_id_idx ON public.staff_schedule (user_id);

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  complaint_text TEXT NOT NULL,
  photos_url TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'acknowledged', 'investigating', 'resolved', 'closed'
  )),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS complaints_status_idx ON public.complaints (status);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('lead', 'booking', 'invoice', 'complaint', 'task', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id, read);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'ROSCA CLEANING SOLUTIONS LTD',
  email TEXT NOT NULL DEFAULT 'enquiries@roscacleaningsolutions.com',
  phone TEXT NOT NULL DEFAULT '+447898780373',
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  invoice_prefix TEXT NOT NULL DEFAULT 'ROSCA',
  invoice_next_number INTEGER NOT NULL DEFAULT 1001,
  data_retention_days INTEGER NOT NULL DEFAULT 2555,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.company_settings (company_name)
SELECT 'ROSCA CLEANING SOLUTIONS LTD'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

-- Invoice number helper
CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  next_n INTEGER;
BEGIN
  UPDATE public.company_settings
  SET invoice_next_number = invoice_next_number + 1,
      updated_at = NOW()
  WHERE id = (SELECT id FROM public.company_settings LIMIT 1)
  RETURNING invoice_prefix, invoice_next_number - 1
  INTO prefix, next_n;

  RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_n::TEXT, 5, '0');
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_staff"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "profiles_update_self_or_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR public.has_admin_role())
  WITH CHECK (id = (SELECT auth.uid()) OR public.has_admin_role());

CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role() OR id = (SELECT auth.uid()));

-- Leads
CREATE POLICY "leads_select_staff"
  ON public.leads FOR SELECT TO authenticated
  USING (
    public.has_ops_role()
    OR public.has_manager_role()
    OR assigned_to = (SELECT auth.uid())
  );

CREATE POLICY "leads_write_ops"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (public.has_ops_role() OR public.has_manager_role());

CREATE POLICY "leads_update_ops"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role())
  WITH CHECK (public.has_ops_role() OR public.has_manager_role());

CREATE POLICY "leads_delete_manager"
  ON public.leads FOR DELETE TO authenticated
  USING (public.has_manager_role());

-- Clients
CREATE POLICY "clients_select_staff"
  ON public.clients FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "clients_write_ops"
  ON public.clients FOR ALL TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role() OR public.has_finance_role())
  WITH CHECK (public.has_ops_role() OR public.has_manager_role() OR public.has_finance_role());

-- Bookings
CREATE POLICY "bookings_select_staff"
  ON public.bookings FOR SELECT TO authenticated
  USING (
    public.has_ops_role()
    OR public.has_manager_role()
    OR public.has_finance_role()
    OR (SELECT auth.uid()) = ANY (assigned_team)
  );

CREATE POLICY "bookings_write_ops"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (public.has_ops_role() OR public.has_manager_role());

CREATE POLICY "bookings_update_ops"
  ON public.bookings FOR UPDATE TO authenticated
  USING (
    public.has_ops_role()
    OR public.has_manager_role()
    OR (SELECT auth.uid()) = ANY (assigned_team)
  )
  WITH CHECK (
    public.has_ops_role()
    OR public.has_manager_role()
    OR (SELECT auth.uid()) = ANY (assigned_team)
  );

CREATE POLICY "bookings_delete_manager"
  ON public.bookings FOR DELETE TO authenticated
  USING (public.has_manager_role());

-- Job tasks
CREATE POLICY "job_tasks_select"
  ON public.job_tasks FOR SELECT TO authenticated
  USING (
    public.has_ops_role()
    OR public.has_manager_role()
    OR assigned_to = (SELECT auth.uid())
  );

CREATE POLICY "job_tasks_write"
  ON public.job_tasks FOR ALL TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role() OR assigned_to = (SELECT auth.uid()))
  WITH CHECK (public.has_ops_role() OR public.has_manager_role() OR assigned_to = (SELECT auth.uid()));

-- Invoices / expenses (finance)
CREATE POLICY "invoices_select_finance"
  ON public.invoices FOR SELECT TO authenticated
  USING (public.has_finance_role() OR public.has_ops_role());

CREATE POLICY "invoices_write_finance"
  ON public.invoices FOR ALL TO authenticated
  USING (public.has_finance_role())
  WITH CHECK (public.has_finance_role());

CREATE POLICY "invoice_items_select"
  ON public.invoice_items FOR SELECT TO authenticated
  USING (public.has_finance_role() OR public.has_ops_role());

CREATE POLICY "invoice_items_write"
  ON public.invoice_items FOR ALL TO authenticated
  USING (public.has_finance_role())
  WITH CHECK (public.has_finance_role());

CREATE POLICY "expenses_finance"
  ON public.expenses FOR ALL TO authenticated
  USING (public.has_finance_role())
  WITH CHECK (public.has_finance_role());

-- Equipment
CREATE POLICY "equipment_staff"
  ON public.equipment FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "equipment_write_ops"
  ON public.equipment FOR ALL TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role())
  WITH CHECK (public.has_ops_role() OR public.has_manager_role());

CREATE POLICY "equipment_assignments_staff"
  ON public.equipment_assignments FOR ALL TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role())
  WITH CHECK (public.has_ops_role() OR public.has_manager_role());

-- Staff schedule
CREATE POLICY "staff_schedule_select"
  ON public.staff_schedule FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "staff_schedule_write"
  ON public.staff_schedule FOR ALL TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role() OR user_id = (SELECT auth.uid()))
  WITH CHECK (public.has_ops_role() OR public.has_manager_role() OR user_id = (SELECT auth.uid()));

-- Complaints
CREATE POLICY "complaints_select"
  ON public.complaints FOR SELECT TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role() OR assigned_to = (SELECT auth.uid()));

CREATE POLICY "complaints_write"
  ON public.complaints FOR ALL TO authenticated
  USING (public.has_ops_role() OR public.has_manager_role())
  WITH CHECK (public.has_ops_role() OR public.has_manager_role());

-- Notifications: own rows only
CREATE POLICY "notifications_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "notifications_insert_staff"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- Audit log: managers read; staff insert
CREATE POLICY "audit_select_manager"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_manager_role());

CREATE POLICY "audit_insert_staff"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- Settings
CREATE POLICY "settings_select_staff"
  ON public.company_settings FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "settings_update_admin"
  ON public.company_settings FOR UPDATE TO authenticated
  USING (public.has_admin_role())
  WITH CHECK (public.has_admin_role());

-- Grants for Data API
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Public website can insert leads (contact form) via anon
GRANT INSERT ON public.leads TO anon;
CREATE POLICY "leads_public_insert"
  ON public.leads FOR INSERT TO anon
  WITH CHECK (source = 'website' AND status = 'new');
