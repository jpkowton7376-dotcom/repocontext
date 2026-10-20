-- RepoContext — lightweight page-view tracking for the internal admin panel.
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Writes happen only through /api/track (service role); reads happen only in
-- the admin panel. RLS stays on with NO policies so the anon key can never
-- read or write these rows directly.
--
-- Without this table the tracker no-ops silently (see /api/track), so the site
-- keeps working until you run this migration.

create table if not exists public.page_views (
  id         uuid primary key default gen_random_uuid(),
  path       text        not null,
  referrer   text,
  locale     text,
  user_id    uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx
  on public.page_views (created_at desc);
create index if not exists page_views_path_idx
  on public.page_views (path);

alter table public.page_views enable row level security;

-- Optional: keep the table small by pruning rows older than 180 days.
-- Requires pg_cron (enabled by default on hosted Supabase projects).
--
-- select cron.schedule(
--   'prune-page-views',
--   '0 4 * * *',
--   $$ delete from public.page_views where created_at < now() - interval '180 days' $$
-- );
