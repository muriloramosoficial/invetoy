-- ============================================================
-- INVENTOY - Staff Role for SaaS Employees
-- Funcionarios (comercial, suporte) com acesso limitado ao admin
-- ============================================================

-- Add is_staff column to profiles
alter table public.profiles
  add column if not exists is_staff boolean not null default false;

-- Staff helper function (security definer to avoid RLS recursion)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (select is_staff from public.profiles where id = auth.uid()),
    false
  )
$$;

-- System admin OR staff bypass
create or replace function public.is_admin_or_staff()
returns boolean
language sql
stable
security definer
as $$
  select public.is_system_admin() OR public.is_staff()
$$;

-- ============================================================
-- Update RLS policies to include staff
-- Staff can read tenants, profiles, and plan_configs
-- ============================================================

-- Profiles: staff can see all profiles (for customer lookup)
drop policy if exists "Users can view profiles in their tenant" on public.profiles;

create policy "Users can view profiles in their tenant"
  on public.profiles for select
  using (
    is_admin_or_staff() OR tenant_id = get_user_tenant_id()
  );

-- Tenants: staff can see all tenants
drop policy if exists "Users can view their own tenant" on public.tenants;

create policy "Users can view their own tenant"
  on public.tenants for select
  using (
    is_admin_or_staff() OR id = get_user_tenant_id()
  );

-- Staff can update tenants (to assign custom plans)
drop policy if exists "Admins can update their tenant" on public.tenants;

create policy "Admins can update their tenant"
  on public.tenants for update
  using (
    is_admin_or_staff() OR id = get_user_tenant_id()
  )
  with check (
    is_admin_or_staff() OR (
      exists (
        select 1 from public.profiles
        where id = auth.uid()
        and tenant_id = public.tenants.id
        and role = 'admin'
      )
    )
  );

-- Products: staff can see all (for customer demos)
drop policy if exists "Tenant isolation - select" on public.products;

create policy "Tenant isolation - select"
  on public.products for select
  using (
    is_admin_or_staff() OR tenant_id = get_user_tenant_id()
  );

-- Categories: staff can see all
drop policy if exists "Tenant isolation - select" on public.categories;

create policy "Tenant isolation - select"
  on public.categories for select
  using (
    is_admin_or_staff() OR tenant_id = get_user_tenant_id()
  );

-- Locations: staff can see all
drop policy if exists "Tenant isolation - select" on public.locations;

create policy "Tenant isolation - select"
  on public.locations for select
  using (
    is_admin_or_staff() OR tenant_id = get_user_tenant_id()
  );

-- Movements: staff can see all
drop policy if exists "Tenant isolation - select" on public.movements;

create policy "Tenant isolation - select"
  on public.movements for select
  using (
    is_admin_or_staff() OR tenant_id = get_user_tenant_id()
  );

-- API Keys: staff can also see (but not manage)
drop policy if exists "Tenant isolation - select" on public.api_keys;

create policy "Tenant isolation - select"
  on public.api_keys for select
  using (
    is_admin_or_staff() OR tenant_id = get_user_tenant_id()
  );
