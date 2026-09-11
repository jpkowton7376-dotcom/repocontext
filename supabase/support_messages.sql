-- RepoContext — inbound customer-service messages
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Without this table the support widget still works (messages are emailed to
-- the support inbox), you just don't get a queryable history.

create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  email       text,
  message     text        not null,
  page        text,
  user_agent  text,
  locale      text,
  status      text        not null default 'new',
  created_at  timestamptz not null default now()
);

create index if not exists support_messages_created_at_idx
  on public.support_messages (created_at desc);

create index if not exists support_messages_status_idx
  on public.support_messages (status);

-- Nobody reads these through the browser client: the widget POSTs to
-- /api/support (service role) and support staff query them in the dashboard.
-- RLS stays on with no policies so the anon key can never read them.
alter table public.support_messages enable row level security;
