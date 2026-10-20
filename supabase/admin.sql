-- RepoContext — DB-backed admin flag
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run (IF NOT EXISTS / CREATE OR REPLACE).
--
-- Adds an is_admin flag to profiles so admins can be added/removed from the
-- /admin panel at runtime — no redeploy needed. Authorization logic lives in
-- lib/admin-auth.ts: a user is an admin if profiles.is_admin = true OR their
-- email is listed in the ADMIN_EMAILS env var (kept as a bootstrap/override).

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ── Anti self-escalation guard ────────────────────────────────────────
-- profiles has an RLS policy "Users can update own profile", so without this
-- guard any signed-in user could flip their OWN is_admin to true via the
-- browser client and become an admin. This trigger only lets the service_role
-- (used by the admin API) or postgres (SQL editor) change the flag; ordinary
-- authenticated/anon updates that touch is_admin are rejected. Updates that
-- don't touch is_admin are unaffected.
create or replace function public.guard_profiles_is_admin()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'is_admin can only be changed by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_is_admin on public.profiles;
create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row execute function public.guard_profiles_is_admin();

-- ── Bootstrap the first admin ─────────────────────────────────────────
-- Pick ONE of these to grant your own account admin access the first time:
--
--   A) Env var (no SQL): set ADMIN_EMAILS=you@example.com in your host and
--      redeploy. Then open /admin and toggle others from the panel.
--
--   B) SQL: promote the account you log in with, then remove the env var.
--      update public.profiles set is_admin = true
--      where email = 'you@example.com';
--
-- List current admins:
--   select email, is_admin from public.profiles where is_admin;
