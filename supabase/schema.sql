-- Praemium Onus Logistics — public schema for mhhsnsarlrvbhjoybuvg
-- Quote requests stay QUOTE_REQUESTED. Dispatch books into loads.

create extension if not exists pgcrypto;

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  landstar_pro_number text,
  shipper_name text,
  origin_city text,
  destination_city text,
  driver_name text,
  driver_phone text,
  status text not null default 'QUOTE_REQUESTED',
  tracking_hash text unique,
  current_lat double precision,
  current_lng double precision,
  last_location_update timestamptz,
  freight_type text,
  weight text,
  contact_email text,
  contact_phone text,
  notes text,
  bol_url text,
  pod_url text,
  bol_uploaded_at timestamptz,
  pod_uploaded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.loads add column if not exists bol_url text;
alter table public.loads add column if not exists pod_url text;
alter table public.loads add column if not exists bol_uploaded_at timestamptz;
alter table public.loads add column if not exists pod_uploaded_at timestamptz;

create index if not exists loads_status_idx on public.loads (status);
create index if not exists loads_created_at_idx on public.loads (created_at desc);

alter table public.loads enable row level security;

drop policy if exists "anon_insert_quote" on public.loads;
create policy "anon_insert_quote"
  on public.loads for insert
  to anon
  with check (status in ('QUOTE_REQUESTED', 'BOOKED'));

drop policy if exists "anon_select_loads" on public.loads;
create policy "anon_select_loads"
  on public.loads for select
  to anon
  using (true);

drop policy if exists "anon_update_tracking" on public.loads;
create policy "anon_update_tracking"
  on public.loads for update
  to anon
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.loads to anon, authenticated;

create or replace function public.ensure_tracking_hash()
returns trigger
language plpgsql
as $$
begin
  if (new.tracking_hash is null or btrim(new.tracking_hash) = '')
     and new.status is distinct from 'QUOTE_REQUESTED' then
    new.tracking_hash := encode(gen_random_bytes(12), 'hex');
  end if;
  return new;
end;
$$;

drop trigger if exists loads_ensure_tracking_hash on public.loads;
create trigger loads_ensure_tracking_hash
before insert on public.loads
for each row
execute function public.ensure_tracking_hash();

insert into storage.buckets (id, name, public)
values ('load-docs', 'load-docs', true)
on conflict (id) do nothing;

drop policy if exists "anon_select_load_docs" on storage.objects;
create policy "anon_select_load_docs"
  on storage.objects for select
  to anon
  using (bucket_id = 'load-docs');

drop policy if exists "anon_insert_load_docs" on storage.objects;
create policy "anon_insert_load_docs"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'load-docs');

drop policy if exists "anon_update_load_docs" on storage.objects;
create policy "anon_update_load_docs"
  on storage.objects for update
  to anon
  using (bucket_id = 'load-docs')
  with check (bucket_id = 'load-docs');
