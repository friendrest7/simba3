create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'manager', 'admin', 'driver', 'ceo');
create type public.order_status as enum ('pending', 'confirmed', 'packed', 'on_the_way', 'delivered', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  role public.user_role not null default 'customer',
  branch_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  category text not null,
  brand text,
  image_url text,
  price_rwf numeric(12,2) not null check (price_rwf >= 0),
  unit text not null default 'item',
  stock integer not null default 0 check (stock >= 0),
  branch_id text,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('SMB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references public.profiles(id) on delete restrict,
  branch_id text,
  status public.order_status not null default 'pending',
  subtotal_rwf numeric(12,2) not null default 0,
  delivery_fee_rwf numeric(12,2) not null default 0,
  total_rwf numeric(12,2) not null default 0,
  delivery_address jsonb not null default '{}'::jsonb,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_rwf numeric(12,2) not null check (unit_price_rwf >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.favourites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.delivery_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  note text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index products_search_idx on public.products using gin (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
);
create index orders_user_idx on public.orders(user_id, created_at desc);
create index tracking_order_idx on public.delivery_tracking(order_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.phone,
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.favourites enable row level security;
alter table public.delivery_tracking enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
revoke update on public.profiles from authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;
create policy "products public read" on public.products for select using (active);
create policy "staff manage products" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin'))
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin'))
);
create policy "customers read own orders" on public.orders for select using (user_id = auth.uid());
create policy "customers create own orders" on public.orders for insert with check (user_id = auth.uid());
create policy "staff read orders" on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin'))
);
create policy "customers read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "customers create own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "users manage own cart" on public.cart_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own favourites" on public.favourites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "customers read own tracking" on public.delivery_tracking for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "staff manage tracking" on public.delivery_tracking for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'driver'))
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'driver'))
);

insert into storage.buckets (id, name, public)
values ('simba-assets', 'simba-assets', true)
on conflict (id) do update set public = excluded.public;

create policy "public read simba assets"
on storage.objects for select
using (bucket_id = 'simba-assets');

create policy "staff upload simba assets"
on storage.objects for insert
with check (
  bucket_id = 'simba-assets'
  and exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin'))
);
