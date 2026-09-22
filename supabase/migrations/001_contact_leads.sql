-- Contact form leads for ROSCA Cleaning Solutions
create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_interest text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_leads enable row level security;

-- Allow anonymous inserts from the website contact form
create policy "Allow public insert on contact_leads"
  on public.contact_leads
  for insert
  to anon, authenticated
  with check (true);

-- Restrict reads to service role / authenticated admins only
create policy "Deny public select on contact_leads"
  on public.contact_leads
  for select
  to anon
  using (false);
