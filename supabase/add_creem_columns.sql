-- RepoContext — store Creem customer / subscription ids on profiles
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query → Run).

alter table public.profiles
  add column if not exists creem_customer_id text,
  add column if not exists creem_subscription_id text;

-- Optional: speed up lookups by customer id (handy for refunds / reconciliation).
create index if not exists profiles_creem_customer_id_idx
  on public.profiles (creem_customer_id);
