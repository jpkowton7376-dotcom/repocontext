-- RepoContext — base schema (run FIRST, before add_creem_columns.sql)
-- Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT).

-- ── User profiles ───────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'team')),
  analyses_today integer not null default 0,
  total_analyses integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ── Analysis history ────────────────────────────────────────────
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  repo_url text not null,
  repo_name text,
  quality_score integer,
  agents_md text,
  created_at timestamptz not null default timezone('utc', now())
);

-- ── Row Level Security ──────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can view own analyses" on public.analyses;
create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own analyses" on public.analyses;
create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- ── Auto-create a profile on signup ────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
