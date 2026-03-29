create table if not exists unified_audit_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  account_id text not null,
  cache_key text not null unique,
  planner jsonb not null default '{}'::jsonb,
  response jsonb not null,
  last_refreshed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists unified_audit_cache_account_id_idx
  on unified_audit_cache (account_id);

create index if not exists unified_audit_cache_expires_at_idx
  on unified_audit_cache (expires_at);

create table if not exists automation_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  operation_name text not null,
  request_key text not null,
  request_hash text not null,
  status text not null default 'pending',
  response_payload jsonb,
  error_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  unique (operation_name, request_key)
);

create index if not exists automation_idempotency_keys_expires_at_idx
  on automation_idempotency_keys (expires_at);

alter table unified_audit_cache enable row level security;
alter table automation_idempotency_keys enable row level security;

create policy "Service role full access on unified_audit_cache"
  on unified_audit_cache for all
  to service_role
  using (true)
  with check (true);

create policy "Users can view own cache entries"
  on unified_audit_cache for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role full access on automation_idempotency_keys"
  on automation_idempotency_keys for all
  to service_role
  using (true)
  with check (true);

create policy "Users can view own idempotency keys"
  on automation_idempotency_keys for select
  to authenticated
  using (auth.uid() = user_id);