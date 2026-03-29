create table if not exists public.event_response_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_id text not null unique,
  name text not null,
  trigger_event text not null,
  trigger_conditions jsonb not null default '{}'::jsonb,
  risk_threshold text not null default 'MEDIUM',
  response_type text not null default 'notify',
  response_action text not null,
  response_params jsonb not null default '{}'::jsonb,
  notify_channels jsonb not null default '[]'::jsonb,
  raw_query text not null,
  created_by text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.event_response_policies enable row level security;

create policy "Users can view own event response policies"
on public.event_response_policies
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own event response policies"
on public.event_response_policies
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own event response policies"
on public.event_response_policies
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own event response policies"
on public.event_response_policies
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Service role can manage event response policies"
on public.event_response_policies
for all
to service_role
using (true)
with check (true);

create index idx_event_response_policies_user_id
on public.event_response_policies(user_id);

create index idx_event_response_policies_trigger_event
on public.event_response_policies(trigger_event);
