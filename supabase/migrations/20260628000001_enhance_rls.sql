-- ============================================================
-- INVENTOY - Enhanced RLS Policies
-- Adds is_system_admin() bypass to all remaining tables
-- ============================================================

-- 1. INVENTORY ITEMS - System admins can see all
drop policy if exists "Tenant isolation - select" on public.inventory_items;
drop policy if exists "Tenant isolation - insert" on public.inventory_items;
drop policy if exists "Tenant isolation - update" on public.inventory_items;
drop policy if exists "Tenant isolation - delete" on public.inventory_items;

create policy "Tenant isolation - select"
  on public.inventory_items for select
  using (
    is_system_admin() OR exists (
      select 1 from public.products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

create policy "Tenant isolation - insert"
  on public.inventory_items for insert
  with check (
    is_system_admin() OR exists (
      select 1 from public.products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

create policy "Tenant isolation - update"
  on public.inventory_items for update
  using (
    is_system_admin() OR exists (
      select 1 from public.products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

create policy "Tenant isolation - delete"
  on public.inventory_items for delete
  using (
    is_system_admin() OR exists (
      select 1 from public.products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

-- 2. MOVEMENTS - System admins can see all
drop policy if exists "Tenant isolation - select" on public.movements;
drop policy if exists "Tenant isolation - insert" on public.movements;

create policy "Tenant isolation - select"
  on public.movements for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

create policy "Tenant isolation - insert"
  on public.movements for insert
  with check (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

-- 3. RATE_LIMITS - No public access (only service_role via RPC)
-- Already has "Only service role can manage rate_limits" policy

-- 4. Add RLS to api_keys if missing
alter table if exists public.api_keys enable row level security;
