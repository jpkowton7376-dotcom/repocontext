-- Forge — shared community project board
-- Run once in the Supabase SQL editor. The curated/hardcoded showcase projects
-- in lib/forge-data.ts stay client-side; this table holds user submissions so
-- they are actually shared across visitors (localStorage-only would hide them).

create table if not exists public.forge_projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  author        text not null default 'anonymous',
  avatar_color  text not null default '#0f172a',
  cover         text not null default '/projects/plant-monitor.jpg',
  created_at    timestamptz not null default now(),
  tags          text[] not null default '{}',
  summary       text not null default '',
  parts         jsonb not null default '[]',
  wiring        text not null default '',
  mech          text,
  instructions  text[] not null default '{}',
  build         jsonb,
  stars         integer not null default 0,
  featured      boolean not null default false,
  user_id       uuid references auth.users(id) on delete set null
);

create index if not exists forge_projects_created_at_idx
  on public.forge_projects (created_at desc);

-- Per-user stars (deduped) so the count and "is this mine" stay accurate.
create table if not exists public.forge_stars (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.forge_projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (project_id, user_id)
);

alter table public.forge_projects enable row level security;
alter table public.forge_stars enable row level security;

-- Anyone (even logged-out) can read the board.
drop policy if exists forge_projects_public_read on public.forge_projects;
create policy forge_projects_public_read
  on public.forge_projects for select using (true);

-- Only signed-in users may submit a project.
drop policy if exists forge_projects_auth_insert on public.forge_projects;
create policy forge_projects_auth_insert
  on public.forge_projects for insert with check (auth.uid() is not null);

-- Authors may remove their own submission.
drop policy if exists forge_projects_owner_delete on public.forge_projects;
create policy forge_projects_owner_delete
  on public.forge_projects for delete using (auth.uid() = user_id);

-- Stars: public read; only the owner writes their own row.
drop policy if exists forge_stars_public_read on public.forge_stars;
create policy forge_stars_public_read
  on public.forge_stars for select using (true);

drop policy if exists forge_stars_self_write on public.forge_stars;
create policy forge_stars_self_write
  on public.forge_stars for insert with check (auth.uid() = user_id);

drop policy if exists forge_stars_self_delete on public.forge_stars;
create policy forge_stars_self_delete
  on public.forge_stars for delete using (auth.uid() = user_id);
