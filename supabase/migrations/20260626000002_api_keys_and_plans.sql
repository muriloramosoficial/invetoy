-- ============================================================
-- INVENTOY - API Keys & Plan Enforcement
-- ============================================================

-- 1. API Keys table
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  key_hash text not null,
  key_prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz
);

create index idx_api_keys_tenant on api_keys(tenant_id);
create index idx_api_keys_prefix on api_keys(key_prefix);

alter table api_keys enable row level security;

-- Tenant isolation for api_keys
create policy "Tenant isolation - select"
  on api_keys for select
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - insert"
  on api_keys for insert
  with check (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - update"
  on api_keys for update
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - delete"
  on api_keys for delete
  using (tenant_id = get_user_tenant_id());

-- 2. Plan enforcement helper
create or replace function check_plan_feature(p_tenant_id uuid, p_feature text)
returns boolean
language plpgsql
stable
as $$
declare
  v_plan text;
  v_subscription_status text;
  v_feature_plans text[];
begin
  select plan, subscription_status into v_plan, v_subscription_status
  from tenants where id = p_tenant_id;

  if v_subscription_status in ('canceled', 'incomplete', 'past_due') then
    return false;
  end if;

  v_feature_plans := case p_feature
    when 'api' then array['starter', 'pro', 'enterprise']
    when 'api_key' then array['starter', 'pro', 'enterprise']
    when 'scanner' then array['starter', 'pro', 'enterprise']
    when 'csv_export' then array['starter', 'pro', 'enterprise']
    when 'analytics' then array['starter', 'pro', 'enterprise']
    when 'multiple_locations' then array['pro', 'enterprise']
    when 'custom_reports' then array['pro', 'enterprise']
    when 'priority_support' then array['pro', 'enterprise']
    when 'unlimited_products' then array['enterprise']
    when 'unlimited_users' then array['enterprise']
    else array[v_plan]
  end;

  return v_plan = any(v_feature_plans);
end;
$$;

-- 3. Product limit check
create or replace function get_plan_product_limit(p_tenant_id uuid)
returns integer
language plpgsql
stable
as $$
declare
  v_plan text;
begin
  select plan into v_plan from tenants where id = p_tenant_id;
  return case v_plan
    when 'free' then 30
    when 'starter' then 500
    when 'pro' then 3000
    when 'enterprise' then -1
    else 0
  end;
end;
$$;

-- 4. User limit check
create or replace function get_plan_user_limit(p_tenant_id uuid)
returns integer
language plpgsql
stable
as $$
declare
  v_plan text;
begin
  select plan into v_plan from tenants where id = p_tenant_id;
  return case v_plan
    when 'free' then 1
    when 'starter' then 3
    when 'pro' then 10
    when 'enterprise' then -1
    else 0
  end;
end;
$$;

-- 5. Create invite_codes table for team member invitations
create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  role text not null default 'operator' check (role in ('admin', 'manager', 'operator')),
  code text not null unique,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz
);

create index idx_invite_codes_tenant on invite_codes(tenant_id);
create index idx_invite_codes_code on invite_codes(code);

alter table invite_codes enable row level security;

create policy "Tenant isolation - select"
  on invite_codes for select
  using (tenant_id = get_user_tenant_id());

create policy "Admin insert invite"
  on invite_codes for insert
  with check (
    tenant_id = get_user_tenant_id()
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );
