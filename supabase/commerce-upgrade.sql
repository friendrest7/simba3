-- Additive production commerce migration. Safe to run after schema.sql.
create type public.payment_provider as enum ('mtn_momo', 'airtel_money', 'cash');
create type public.payment_status as enum ('pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded');
create type public.subscription_frequency as enum ('weekly', 'biweekly', 'monthly');

alter table public.profiles
  add column if not exists preferred_language text not null default 'en',
  add column if not exists preferred_theme text not null default 'system';

alter table public.orders
  add column if not exists delivery_zone text,
  add column if not exists delivery_slot text,
  add column if not exists estimated_delivery_at timestamptz,
  add column if not exists payment_status public.payment_status not null default 'pending';

alter table public.order_items
  add column if not exists product_key text,
  add column if not exists product_image_url text,
  add column if not exists product_category text;

create table if not exists public.user_cart_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_key text not null,
  quantity integer not null check (quantity > 0 and quantity <= 999),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_key)
);

create table if not exists public.wishlist_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_key)
);

create table if not exists public.delivery_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  recipient_name text not null,
  phone text not null,
  district text not null,
  sector text,
  street_address text not null,
  landmark text,
  instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  provider public.payment_provider not null,
  status public.payment_status not null default 'pending',
  amount_rwf numeric(12,2) not null check (amount_rwf >= 0),
  phone text,
  provider_transaction_id text,
  provider_reference text,
  failure_reason text,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_key text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text,
  message text not null check (char_length(message) between 3 and 2000),
  verified_purchase boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_key, user_id, order_id)
);

create table if not exists public.stock_waitlist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_key text not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, product_key)
);

create table if not exists public.recurring_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_order_id uuid references public.orders(id) on delete set null,
  frequency public.subscription_frequency not null,
  next_delivery_date date not null,
  active boolean not null default true,
  delivery_address_id uuid references public.delivery_addresses(id) on delete set null,
  delivery_slot text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments(order_id, created_at desc);
create index if not exists order_status_events_order_idx on public.order_status_events(order_id, created_at);
create index if not exists delivery_addresses_user_idx on public.delivery_addresses(user_id, is_default desc);
create index if not exists product_reviews_product_idx on public.product_reviews(product_key, created_at desc);
create index if not exists recurring_orders_user_idx on public.recurring_orders(user_id, active, next_delivery_date);

alter table public.user_cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.delivery_addresses enable row level security;
alter table public.payments enable row level security;
alter table public.order_status_events enable row level security;
alter table public.product_reviews enable row level security;
alter table public.stock_waitlist enable row level security;
alter table public.recurring_orders enable row level security;

create policy "users manage synced cart" on public.user_cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage synced wishlist" on public.wishlist_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage delivery addresses" on public.delivery_addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users read own payments" on public.payments for select
  using (user_id = auth.uid());
create policy "users read own status events" on public.order_status_events for select
  using (exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid()));
create policy "public reads product reviews" on public.product_reviews for select using (true);
create policy "verified buyers create product reviews" on public.product_reviews for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.orders
      join public.order_items on order_items.order_id = orders.id
      where orders.id = product_reviews.order_id
        and orders.user_id = auth.uid()
        and orders.status = 'delivered'
        and order_items.product_key = product_reviews.product_key
    )
  );
create policy "users manage stock waitlist" on public.stock_waitlist for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage recurring orders" on public.recurring_orders for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "staff manage payments" on public.payments for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin')));
create policy "staff manage order status events" on public.order_status_events for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'driver')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'driver')));
create policy "staff update orders" on public.orders for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'driver')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'driver')));

alter table public.orders replica identity full;
alter table public.order_status_events replica identity full;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_status_events;
