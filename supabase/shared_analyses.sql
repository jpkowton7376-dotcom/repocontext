-- RepoContext — public share links for analysis results
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.shared_analyses (
  id             text primary key,
  repo_full_name text        not null,
  payload        jsonb       not null,
  created_at     timestamptz not null default now()
);

-- Index for listing / cleanup by recency
create index if not exists shared_analyses_created_at_idx
  on public.shared_analyses (created_at desc);

-- Row Level Security: shares are public by design (anyone with the link can view).
-- Writes happen only through the service-role key, so no insert/update policy is needed.
alter table public.shared_analyses enable row level security;

drop policy if exists "public read shares" on public.shared_analyses;
create policy "public read shares"
  on public.shared_analyses
  for select
  using (true);

-- Optional: auto-delete shares older than 90 days to keep the table small.
-- Requires pg_cron, which is enabled by default on hosted Supabase projects.
--
-- select cron.schedule(
--   'delete-old-shares',
--   '0 3 * * *',
--   $$ delete from public.shared_analyses where created_at < now() - interval '90 days' $$
-- );
