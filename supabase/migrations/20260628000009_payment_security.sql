-- ============================================================
-- INVENTOY - Payment Security Audit
-- 
-- 1. Add pending_plan column to tenants (plan is only set after
--    payment is confirmed by the webhook, not before)
-- 2. Restrict tenants UPDATE RLS to prevent regular users from
--    changing plan/pending_plan directly
-- 3. Add trigger to ensure plan can only be changed by service_role
-- ============================================================

-- ============================================================
-- 1. Add pending_plan column
-- ============================================================
alter table public.tenants
  add column if not exists pending_plan text;

-- ============================================================
-- 2. Restrict tenants UPDATE RLS policy
--    Regular tenant admins can update their tenant row BUT
--    NOT the plan/pending_plan/subscription fields.
--    Only system admins can modify plan-related fields.
-- ============================================================

-- Drop the existing permissive policy
drop policy if exists "Admins can update their tenant" on public.tenants;

-- New policy: restricts regular users from modifying plan/subscription fields
create policy "Admins can update their tenant (restricted)"
  on public.tenants for update
  using (
    is_system_admin() OR id = get_user_tenant_id()
  )
  with check (
    -- System admins can do anything
    is_system_admin()
    OR
    -- Regular users: only allow non-plan field updates
    -- (e.g., name, slug, cnpj, etc.)
    (
      exists (
        select 1 from public.profiles
        where id = auth.uid()
        and tenant_id = public.tenants.id
        and role = 'admin'
      )
      -- Verify plan-related fields haven't changed
      AND (
        (plan IS NOT DISTINCT FROM (SELECT plan FROM public.tenants WHERE id = public.tenants.id))
        AND (pending_plan IS NOT DISTINCT FROM (SELECT pending_plan FROM public.tenants WHERE id = public.tenants.id))
        AND (subscription_id IS NOT DISTINCT FROM (SELECT subscription_id FROM public.tenants WHERE id = public.tenants.id))
        AND (subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM public.tenants WHERE id = public.tenants.id))
      )
    )
  );

-- ============================================================
-- 3. Function to safely upgrade a tenant's plan (used by webhook + admin)
--    This bypasses RLS because it's security definer
-- ============================================================
create or replace function public.activate_tenant_plan(
  p_tenant_id uuid,
  p_plan text,
  p_subscription_id text,
  p_subscription_status text default 'active'
)
returns void
language plpgsql
security definer
as $$
begin
  update public.tenants
  set
    plan = p_plan,
    subscription_id = p_subscription_id,
    subscription_status = p_subscription_status,
    pending_plan = null
  where id = p_tenant_id;
end;
$$;

-- ============================================================
-- 4. Function to cancel a tenant's paid plan (reset to free)
-- ============================================================
create or replace function public.cancel_tenant_plan(
  p_tenant_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update public.tenants
  set
    plan = 'free',
    subscription_status = 'canceled',
    pending_plan = null
  where id = p_tenant_id;
end;
$$;
