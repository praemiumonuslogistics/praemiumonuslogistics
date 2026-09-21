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
alter table public.loads add column if not exists origin_street text;
alter table public.loads add column if not exists origin_state text;
alter table public.loads add column if not exists origin_zip text;
alter table public.loads add column if not exists destination_street text;
alter table public.loads add column if not exists destination_state text;
alter table public.loads add column if not exists destination_zip text;
alter table public.loads add column if not exists receiver_name text;
alter table public.loads add column if not exists receiver_email text;
alter table public.loads add column if not exists receiver_phone text;
alter table public.loads add column if not exists driver_email text;
alter table public.loads add column if not exists pickup_photo_urls text[] not null default '{}';
alter table public.loads add column if not exists pickup_confirmed_at timestamptz;
alter table public.loads add column if not exists delivered_at timestamptz;

-- Landstar TMS bulk posting fields (praemiumonuslogisticsbulklistings.xlsx)
alter table public.loads add column if not exists customer_id text;
alter table public.loads add column if not exists posting_callback_phone text;
alter table public.loads add column if not exists origin_country text;
alter table public.loads add column if not exists destination_country text;
alter table public.loads add column if not exists pickup_date_from date;
alter table public.loads add column if not exists pickup_date_thru date;
alter table public.loads add column if not exists delivery_date_from date;
alter table public.loads add column if not exists delivery_date_thru date;
alter table public.loads add column if not exists load_posting_code text;
alter table public.loads add column if not exists visibility_code text;
alter table public.loads add column if not exists bill_as_miles numeric;
alter table public.loads add column if not exists equipment_1 text;
alter table public.loads add column if not exists equipment_2 text;
alter table public.loads add column if not exists equipment_3 text;
alter table public.loads add column if not exists rate_type text;
alter table public.loads add column if not exists rate numeric;
alter table public.loads add column if not exists commodity text;
alter table public.loads add column if not exists brokerable boolean;
alter table public.loads add column if not exists carrier_amt numeric;
alter table public.loads add column if not exists carrier_load_alerts text;
alter table public.loads add column if not exists load_attributes text;
alter table public.loads add column if not exists load_comments text;
alter table public.loads add column if not exists fuel_surcharge_rate_type text;
alter table public.loads add column if not exists fuel_surcharge numeric;
alter table public.loads add column if not exists source text;
alter table public.loads add column if not exists shipper_id uuid;
alter table public.loads add column if not exists carrier_id uuid;
alter table public.loads add column if not exists yard_line integer not null default 0;
alter table public.loads add column if not exists length_ft numeric;
alter table public.loads add column if not exists width_ft numeric;
alter table public.loads add column if not exists height_ft numeric;
alter table public.loads add column if not exists tarp_size text;
alter table public.loads add column if not exists chains_required boolean;
alter table public.loads add column if not exists straps_required boolean;
alter table public.loads add column if not exists edge_protectors boolean;
alter table public.loads add column if not exists coil_racks boolean;
alter table public.loads add column if not exists levelers boolean;
alter table public.loads add column if not exists loading_access text;
alter table public.loads add column if not exists oversize_flag boolean;
alter table public.loads add column if not exists stepdeck_required_flag boolean;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  company_name text not null default '',
  role text not null check (role in ('SHIPPER', 'CARRIER', 'AGENT')),
  phone_number text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create index if not exists loads_status_idx on public.loads (status);
create index if not exists loads_created_at_idx on public.loads (created_at desc);
create index if not exists loads_origin_zip_idx on public.loads (origin_zip);
create index if not exists loads_pickup_date_from_idx on public.loads (pickup_date_from);
create index if not exists loads_source_idx on public.loads (source);

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
