-- RepoContext — per-API-key rate limiting (fixed 1-minute windows)
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Until this file is run, /api/v1/analyze fails OPEN (requests are allowed and
-- only logged), so creating a key keeps working even on a fresh database.

create table if not exists public.api_key_rate_buckets (
  key_id       uuid references public.api_keys (id) on delete cascade,
  window_start timestamptz not null,
  count        int         not null default 0,
  primary key (key_id, window_start)
);

create index if not exists api_key_rate_buckets_window_idx
  on public.api_key_rate_buckets (window_start);

alter table public.api_key_rate_buckets enable row level security;

-- Atomic read-modify-write. Doing this as a SELECT-then-UPDATE from the edge
-- would let two concurrent requests both read the same count and both pass the
-- limit check, so the increment has to happen inside Postgres.
create or replace function public.increment_api_key_usage(
  p_key_id       uuid,
  p_window_start timestamptz,
  p_max          int
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.api_key_rate_buckets (key_id, window_start, count)
  values (p_key_id, p_window_start, 1)
  on conflict (key_id, window_start)
  do update set count = public.api_key_rate_buckets.count + 1
  returning public.api_key_rate_buckets.count into v_count;

  return json_build_object(
    'count',    v_count,
    'limit',    p_max,
    'allowed',  v_count <= p_max,
    'remaining', greatest(p_max - v_count, 0)
  );
end;
$$;

-- Optional: keep the table from growing forever.
-- Requires pg_cron (enabled by default on hosted Supabase projects).
--
-- select cron.schedule(
--   'purge-rate-buckets',
--   '10 * * * *',
--   $$ delete from public.api_key_rate_buckets where window_start < now() - interval '2 hours' $$
-- );
