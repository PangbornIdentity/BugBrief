create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'UTC',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, profile_id)
);

create table if not exists public.terminology_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  term_key text not null,
  display_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, term_key)
);

create table if not exists public.sla_policies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  priority text not null check (priority in ('P0', 'P1', 'P2', 'P3', 'P4')),
  label text not null,
  warning_after_days numeric,
  breach_after_days numeric not null,
  calendar_mode text not null default 'calendar_days' check (calendar_mode in ('calendar_days', 'business_days', 'same_local_day')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, priority)
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  external_key text,
  title text not null,
  description text,
  issue_kind text not null check (issue_kind in ('escaped_bug', 'defect')),
  priority text not null check (priority in ('P0', 'P1', 'P2', 'P3', 'P4')),
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  status text not null check (status in ('new', 'triaged', 'diagnosing', 'in_progress', 'fixed', 'verified', 'closed')),
  product_area text,
  team_name text,
  source text,
  missed_requirement text,
  reporter_id uuid references public.profiles(id),
  assignee_id uuid references public.profiles(id),
  detected_at timestamptz,
  first_triaged_at timestamptz,
  diagnosis_started_at timestamptz,
  fixed_at timestamptz,
  verified_at timestamptz,
  closed_at timestamptz,
  sla_due_at timestamptz,
  sla_warning_at timestamptz,
  sla_breached_at timestamptz,
  fix_approach text check (fix_approach is null or fix_approach in ('quick_patch', 'patch_plus_follow_up', 'root_cause_fix')),
  diagnosis_quality text check (diagnosis_quality is null or diagnosis_quality in ('clear', 'partial', 'late')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issue_activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  issue_id uuid not null references public.issues(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  field_name text,
  old_value text,
  new_value text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  key_hash text not null,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.api_audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  api_key_id uuid references public.api_keys(id) on delete set null,
  actor_id uuid references public.profiles(id),
  method text not null,
  path text not null,
  status_code integer,
  duration_ms integer,
  request_body_hash text,
  created_at timestamptz not null default now()
);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.terminology_settings enable row level security;
alter table public.sla_policies enable row level security;
alter table public.issues enable row level security;
alter table public.issue_activity enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_audit_log enable row level security;
grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
grant select on public.workspaces to authenticated;
grant select on public.workspace_members to authenticated;
grant select on public.terminology_settings to authenticated;
grant select, insert, update, delete on public.sla_policies to authenticated;
grant select, insert, update on public.issues to authenticated;
grant select, insert on public.issue_activity to authenticated;
grant select, insert, update, delete on public.api_keys to authenticated;
grant select on public.api_audit_log to authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all routines in schema public to service_role;

create policy "profiles can read themselves" on public.profiles
for select to authenticated using (id = auth.uid());

create policy "members can read workspaces" on public.workspaces
for select to authenticated using (public.is_workspace_member(id));

create policy "members can read membership" on public.workspace_members
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can read terminology" on public.terminology_settings
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can read sla policies" on public.sla_policies
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can manage sla policies" on public.sla_policies
for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "members can read issues" on public.issues
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can create issues" on public.issues
for insert to authenticated with check (public.is_workspace_member(workspace_id));

create policy "members can update issues" on public.issues
for update to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "members can read issue activity" on public.issue_activity
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can create issue activity" on public.issue_activity
for insert to authenticated with check (public.is_workspace_member(workspace_id));

create policy "members can read api keys" on public.api_keys
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can manage api keys" on public.api_keys
for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "members can read api audit log" on public.api_audit_log
for select to authenticated using (workspace_id is null or public.is_workspace_member(workspace_id));
