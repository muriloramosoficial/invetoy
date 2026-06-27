-- ============================================================
-- INVENTOY - System Admin RLS Bypass
-- Permite que system admins vejam todos os registros
-- ============================================================

-- Helper function (security definer) to check if user is system admin
-- Usamos security definer para evitar recursion em RLS policies
create or replace function public.is_system_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (select is_system_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

-- Fix get_user_tenant_id to also be security definer to avoid recursion
-- with the updated RLS policies on profiles
create or replace function public.get_user_tenant_id()
returns uuid
language sql
stable
security definer
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- 1. PROFILES - System admins can see all
-- ============================================================

-- Drop existing policy
drop policy if exists "Users can view profiles in their tenant" on public.profiles;

create policy "Users can view profiles in their tenant"
  on public.profiles for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

-- ============================================================
-- 2. TENANTS - System admins can see all
-- ============================================================

drop policy if exists "Users can view their own tenant" on public.tenants;

create policy "Users can view their own tenant"
  on public.tenants for select
  using (
    is_system_admin() OR id = get_user_tenant_id()
  );

drop policy if exists "Admins can update their tenant" on public.tenants;

create policy "Admins can update their tenant"
  on public.tenants for update
  using (
    is_system_admin() OR id = get_user_tenant_id()
  )
  with check (
    is_system_admin() OR (
      exists (
        select 1 from public.profiles
        where id = auth.uid()
        and tenant_id = public.tenants.id
        and role = 'admin'
      )
    )
  );

-- ============================================================
-- 3. API KEYS - System admins can see all
-- ============================================================

drop policy if exists "Tenant isolation - select" on public.api_keys;

create policy "Tenant isolation - select"
  on public.api_keys for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

drop policy if exists "Tenant isolation - insert" on public.api_keys;

create policy "Tenant isolation - insert"
  on public.api_keys for insert
  with check (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

drop policy if exists "Tenant isolation - update" on public.api_keys;

create policy "Tenant isolation - update"
  on public.api_keys for update
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

drop policy if exists "Tenant isolation - delete" on public.api_keys;

create policy "Tenant isolation - delete"
  on public.api_keys for delete
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

-- ============================================================
-- 4. PRODUCTS - System admins can see all
-- ============================================================

drop policy if exists "Tenant isolation - select" on public.products;

create policy "Tenant isolation - select"
  on public.products for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

-- ============================================================
-- 5. CATEGORIES - System admins can see all
-- ============================================================

drop policy if exists "Tenant isolation - select" on public.categories;

create policy "Tenant isolation - select"
  on public.categories for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

-- ============================================================
-- 6. LOCATIONS - System admins can see all
-- ============================================================

drop policy if exists "Tenant isolation - select" on public.locations;

create policy "Tenant isolation - select"
  on public.locations for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

-- ============================================================
-- 7. MOVEMENTS - System admins can see all
-- ============================================================

drop policy if exists "Tenant isolation - select" on public.movements;

create policy "Tenant isolation - select"
  on public.movements for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );
