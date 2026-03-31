create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source text not null,
  mode text not null,
  status text not null default 'success',
  account_id text,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists automation_runs_user_id_created_at_idx
  on automation_runs (user_id, created_at desc);

create table if not exists guardian_event_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  event_id text not null,
  event_name text not null,
  risk_level text not null,
  actor_arn text,
  actor_type text,
  actor_is_guardian boolean not null default false,
  resource_id text,
  resource_type text,
  region text,
  source_ip text,
  matched_policies jsonb not null default '[]'::jsonb,
  auto_fixes jsonb not null default '[]'::jsonb,
  notifications jsonb not null default '[]'::jsonb,
  runbooks jsonb not null default '[]'::jsonb,
  raw_event jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists guardian_event_activity_user_id_created_at_idx
  on guardian_event_activity (user_id, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_publication_rel pr
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_publication p on p.oid = pr.prpubid
    where p.pubname = 'supabase_realtime'
      and n.nspname = 'public'
      and c.relname = 'automation_runs'
  ) then
    alter publication supabase_realtime add table public.automation_runs;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_rel pr
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_publication p on p.oid = pr.prpubid
    where p.pubname = 'supabase_realtime'
      and n.nspname = 'public'
      and c.relname = 'guardian_event_activity'
  ) then
    alter publication supabase_realtime add table public.guardian_event_activity;
  end if;
end $$;
