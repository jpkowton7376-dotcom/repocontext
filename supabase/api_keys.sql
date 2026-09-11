-- RepoContext — public API key storage
-- Run in Supabase SQL editor. Safe to re-run.

-- ── API keys ───────────────────────────────────────────────────────────────
-- Each user can create up to a handful of API keys (we don't expect more
-- than a few per account). The plaintext key is only ever shown to the
-- user at creation time — after that only the SHA-256 hash stays in the
-- database, and we keep the first 8 chars of the plaintext as a
-- human-readable prefix for the dashboard list.
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- SHA-256 of the full plaintext key, hex-encoded. Used for verification.
  key_hash text not null unique,
  -- First 8 chars of the plaintext, for display in the dashboard
  -- ("rc_live_abcd…"). Never enough to reconstruct the key on its own.
  key_prefix text not null,
  -- Optional label the user picks ("My CI bot", "Local laptop").
  name text not null default 'API key',
  -- Soft delete: revoking sets revoked_at rather than DELETE so we can
  -- keep audit trail and surface the right error if someone replays an
  -- old key in logs.
  revoked_at timestamptz,
  last_used_at timestamptz,
  -- Per-minute rate limit. Most users get the default; paid users get
  -- higher limits after we ship tiered quotas.
  rate_limit_per_minute integer not null default 30,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists api_keys_user_id_idx
  on public.api_keys (user_id);
create index if not exists api_keys_key_hash_idx
  on public.api_keys (key_hash);

alter table public.api_keys enable row level security;

drop policy if exists "Users can view own api keys" on public.api_keys;
create policy "Users can view own api keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own api keys" on public.api_keys;
create policy "Users can insert own api keys"
  on public.api_keys for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own api keys" on public.api_keys;
create policy "Users can update own api keys"
  on public.api_keys for update
  using (auth.uid() = user_id);

-- Hard cap: at most 5 active keys per user. Done in trigger rather than
-- a unique index so revoked keys don't count.
create or replace function public.enforce_api_key_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  active_count integer;
begin
  select count(*) into active_count
    from public.api_keys
    where user_id = new.user_id
      and revoked_at is null;
  if active_count >= 5 then
    raise exception 'You can have at most 5 active API keys. Revoke an existing key first.';
  end if;
  return new;
end;
$$;

drop trigger if exists api_keys_enforce_limit on public.api_keys;
create trigger api_keys_enforce_limit
  before insert on public.api_keys
  for each row execute function public.enforce_api_key_limit();