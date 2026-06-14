create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  rating smallint not null check (rating between 1 and 5),
  message text not null check (char_length(message) between 1 and 2000),
  order_id uuid references public.orders(id) on delete set null,
  order_reference text check (order_reference is null or char_length(order_reference) <= 100),
  branch_id text,
  branch_name text,
  fulfilment_method text check (fulfilment_method is null or fulfilment_method in ('delivery', 'pickup')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_user_idx on public.reviews(user_id, created_at desc);
create index if not exists reviews_created_idx on public.reviews(created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "customers create own reviews" on public.reviews;
create policy "customers create own reviews"
on public.reviews for insert
with check (user_id = auth.uid());

drop policy if exists "customers read own reviews" on public.reviews;
create policy "customers read own reviews"
on public.reviews for select
using (user_id = auth.uid());

drop policy if exists "staff read reviews" on public.reviews;
create policy "staff read reviews"
on public.reviews for select
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('manager', 'admin', 'ceo')
  )
);
