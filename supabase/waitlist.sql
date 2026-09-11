-- RepoContext — feature waitlist
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Tracks who wants early access to monorepo support, custom AI agents,
-- GitLab/Bitbucket and team collaboration, plus which feature they asked for.

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text        not null,
  source      text        not null default 'homepage',
  locale      text,
  user_id     uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),

  -- One signup per address. Emails are stored lowercased so the constraint
  -- actually catches "Foo@x.com" vs "foo@x.com".
  constraint waitlist_email_key unique (email)
);

create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

-- Same posture as support_messages: writes only via /api/waitlist (service
-- role), no anon read.
alter table public.waitlist enable row level security;
