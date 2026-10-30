-- Kuttarmare Agro Farm: public catalogue + one authorized administrator.
-- Run in Supabase SQL Editor after creating the products table and admin Auth user.
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('fruits','poultry','vegetables')),
  emoji text,
  image_url text,
  wholesale numeric(12,2) not null default 0,
  retail numeric(12,2) not null default 0,
  unit text not null default 'kg',
  available boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Ensure columns exist if the table was created earlier from an older schema.
alter table public.products add column if not exists emoji text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists wholesale numeric(12,2) not null default 0;
alter table public.products add column if not exists retail numeric(12,2) not null default 0;
alter table public.products add column if not exists unit text not null default 'kg';
alter table public.products add column if not exists available boolean not null default true;
alter table public.products add column if not exists updated_at timestamptz not null default now();

alter table public.products enable row level security;

-- Remove earlier policies with these names so this script can safely be rerun.
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Only KAF admin can insert products" on public.products;
drop policy if exists "Only KAF admin can update products" on public.products;
drop policy if exists "Only KAF admin can delete products" on public.products;

-- Anyone can read the catalogue; only this exact Auth UID can write.
create policy "Public can read products" on public.products
for select to anon, authenticated using (true);

create policy "Only KAF admin can insert products" on public.products
for insert to authenticated
with check (auth.uid() = 'c4ddbb57-8899-4962-82fe-c8cb574046cb'::uuid);

create policy "Only KAF admin can update products" on public.products
for update to authenticated
using (auth.uid() = 'c4ddbb57-8899-4962-82fe-c8cb574046cb'::uuid)
with check (auth.uid() = 'c4ddbb57-8899-4962-82fe-c8cb574046cb'::uuid);

create policy "Only KAF admin can delete products" on public.products
for delete to authenticated
using (auth.uid() = 'c4ddbb57-8899-4962-82fe-c8cb574046cb'::uuid);

-- Table privileges are still restricted by the RLS policies above.
grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;
