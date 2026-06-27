-- ============================================================
-- INVENTOY - Fix Supabase Security Lint Warnings
-- 1. Views: set security_invoker = true (respect RLS of caller)
-- 2. Functions: add explicit search_path = public
-- ============================================================

-- ─── Views: Change SECURITY DEFINER to SECURITY INVOKER ───
-- These views should respect the calling user's RLS policies

alter view public.low_stock_products set (security_invoker = true);
alter view public.inventory_summary set (security_invoker = true);
alter view public.v_assets set (security_invoker = true);
alter view public.v_admin_metrics set (security_invoker = true);
alter view public.v_admin_activity set (security_invoker = true);

-- ─── Functions: Add explicit search_path ───
-- The original functions that already have search_path set:
--   - get_user_tenant_id (20260627000001_fix_rls_recursion.sql) ✅ already has `set search_path = public`

-- Functions missing search_path (need to be recreated):

create or replace function public.is_system_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_system_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.get_user_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_staff from public.profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.is_admin_or_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_system_admin() OR public.is_staff()
$$;

-- ─── Trigger functions (used by migration functions below) ───

create or replace function public.update_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.log_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.movements (tenant_id, product_id, from_location_id, to_location_id, quantity, type, user_id)
  values (
    (select tenant_id from public.products where id = new.product_id),
    new.product_id,
    null,
    new.location_id,
    new.quantity,
    'adjustment',
    auth.uid()
  );
  return new;
end;
$$;

create or replace function public.adjust_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_qty integer;
  v_difference integer;
begin
  if tg_op = 'UPDATE' then
    v_current_qty := old.quantity;
    v_difference := new.quantity - v_current_qty;
    
    if v_difference != 0 then
      insert into public.movements (tenant_id, product_id, from_location_id, to_location_id, quantity, type, user_id)
      values (
        (select tenant_id from public.products where id = new.product_id),
        new.product_id,
        case when v_difference < 0 then new.location_id else null end,
        case when v_difference > 0 then new.location_id else null end,
        abs(v_difference),
        'adjustment',
        auth.uid()
      );
    end if;
  end if;
  return new;
end;
$$;
