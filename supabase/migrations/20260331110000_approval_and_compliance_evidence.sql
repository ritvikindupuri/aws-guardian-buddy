create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  request_key text not null unique,
  request_hash text not null,
  operation_name text not null,
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null,
  risk_level text not null default 'MEDIUM',
  required_approvals integer not null default 1,
  current_approvals integer not null default 0,
  dual_approval_required boolean not null default false,
  status text not null default 'pending_approval',
  request_payload jsonb not null default '{}'::jsonb,
  preview_payload jsonb not null default '{}'::jsonb,
  execution_payload jsonb,
  evidence_payload jsonb not null default '{}'::jsonb,
  last_approved_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists approval_requests_requester_created_at_idx
  on public.approval_requests (requester_user_id, created_at desc);

create table if not exists public.approval_actions (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references public.approval_requests(id) on delete cascade,
  approver_user_id uuid not null references auth.users(id) on delete cascade,
  decision text not null default 'approve',
  comment text,
  created_at timestamptz not null default now(),
  unique (approval_request_id, approver_user_id)
);

create index if not exists approval_actions_request_created_at_idx
  on public.approval_actions (approval_request_id, created_at desc);

create table if not exists public.compliance_evidence_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  export_type text not null default 'audit_timeline',
  status text not null default 'generated',
  filters jsonb not null default '{}'::jsonb,
  evidence_hash text not null,
  evidence_bundle jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  generated_at timestamptz not null default now()
);

create index if not exists compliance_evidence_exports_user_created_at_idx
  on public.compliance_evidence_exports (user_id, created_at desc);

alter table public.approval_requests enable row level security;
alter table public.approval_actions enable row level security;
alter table public.compliance_evidence_exports enable row level security;

create policy "Requesters and approvers can view approval requests"
on public.approval_requests
for select
to authenticated
using (
  auth.uid() = requester_user_id
  or exists (
    select 1
    from public.approval_actions aa
    where aa.approval_request_id = approval_requests.id
      and aa.approver_user_id = auth.uid()
  )
  or (dual_approval_required = true and status in ('pending_approval', 'approved'))
);

create policy "Service role can manage approval requests"
on public.approval_requests
for all
to service_role
using (true)
with check (true);

create policy "Requesters and approvers can view approval actions"
on public.approval_actions
for select
to authenticated
using (
  approver_user_id = auth.uid()
  or exists (
    select 1
    from public.approval_requests ar
    where ar.id = approval_actions.approval_request_id
      and ar.requester_user_id = auth.uid()
  )
);

create policy "Authenticated users can add their own approval actions"
on public.approval_actions
for insert
to authenticated
with check (approver_user_id = auth.uid());

create policy "Service role can manage approval actions"
on public.approval_actions
for all
to service_role
using (true)
with check (true);

create policy "Users can view own compliance evidence exports"
on public.compliance_evidence_exports
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own compliance evidence exports"
on public.compliance_evidence_exports
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Service role can manage compliance evidence exports"
on public.compliance_evidence_exports
for all
to service_role
using (true)
with check (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'approval_requests'
  ) then
    alter publication supabase_realtime add table public.approval_requests;
  end if;
exception
  when undefined_object then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'approval_actions'
  ) then
    alter publication supabase_realtime add table public.approval_actions;
  end if;
exception
  when undefined_object then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'compliance_evidence_exports'
  ) then
    alter publication supabase_realtime add table public.compliance_evidence_exports;
  end if;
exception
  when undefined_object then null;
end $$;
