create table if not exists public.org_operation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  scope text not null,
  scp_template text,
  account_count integer not null default 0,
  env_breakdown jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  blocked jsonb not null default '[]'::jsonb,
  rollback_plan text,
  status text not null default 'preview_only',
  preview_payload jsonb not null default '{}'::jsonb,
  execution_summary jsonb,
  created_at timestamptz not null default now()
);

alter table public.org_operation_history enable row level security;

create policy "Users can view own org operation history"
on public.org_operation_history
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own org operation history"
on public.org_operation_history
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own org operation history"
on public.org_operation_history
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Service role can manage org operation history"
on public.org_operation_history
for all
to service_role
using (true)
with check (true);

create index idx_org_operation_history_user_id
on public.org_operation_history(user_id);

create index idx_org_operation_history_created_at
on public.org_operation_history(created_at desc);
