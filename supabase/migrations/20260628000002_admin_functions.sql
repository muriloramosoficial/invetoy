-- ============================================================
-- INVENTOY - Security Definer Functions for API Operations
-- Substitui o uso de SERVICE_ROLE nas rotas de API
-- ============================================================

-- Helper to validate tenant access
create or replace function public.validate_tenant_access(p_tenant_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow if user is system admin or belongs to the tenant
  if is_system_admin() then
    return true;
  end if;
  if get_user_tenant_id() = p_tenant_id then
    return true;
  end if;
  return false;
end;
$$;

-- 1. api_create_product - Create product with tenant validation
create or replace function public.api_create_product(
  p_tenant_id uuid,
  p_sku text,
  p_name text,
  p_description text default null,
  p_category_id uuid default null,
  p_min_stock integer default 0,
  p_unit text default 'un',
  p_price decimal default null,
  p_cost decimal default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product products;
begin
  if not validate_tenant_access(p_tenant_id) then
    raise exception 'Unauthorized';
  end if;

  insert into products (tenant_id, sku, name, description, category_id, min_stock, unit, price, cost)
  values (p_tenant_id, p_sku, p_name, p_description, p_category_id, p_min_stock, p_unit, p_price, p_cost)
  returning * into v_product;

  return row_to_json(v_product)::jsonb;
end;
$$;

-- 2. api_adjust_inventory - Adjust stock with tenant validation
create or replace function public.api_adjust_inventory(
  p_tenant_id uuid,
  p_product_id uuid,
  p_location_id uuid,
  p_type text,
  p_quantity integer,
  p_notes text default null,
  p_user_id uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not validate_tenant_access(p_tenant_id) then
    raise exception 'Unauthorized';
  end if;

  perform adjust_inventory(p_product_id, p_location_id, p_quantity, p_type, p_notes);
  return jsonb_build_object('success', true);
end;
$$;

-- 3. api_list_products - Paginated product listing with tenant filter
create or replace function public.api_list_products(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 50,
  p_search text default null,
  p_category_id uuid default null,
  p_include_archived boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offset integer;
  v_limit integer;
  v_total integer;
  v_results jsonb;
begin
  if not validate_tenant_access(p_tenant_id) then
    raise exception 'Unauthorized';
  end if;

  v_offset := (p_page - 1) * p_page_size;
  v_limit := p_page_size;

  -- Count total
  select count(*) into v_total
  from products
  where tenant_id = p_tenant_id
  and (p_include_archived or archived_at is null)
  and (p_search is null or name ilike '%' || p_search || '%' or sku ilike '%' || p_search || '%')
  and (p_category_id is null or category_id = p_category_id);

  -- Fetch results
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_results
  from (
    select *
    from products
    where tenant_id = p_tenant_id
    and (p_include_archived or archived_at is null)
    and (p_search is null or name ilike '%' || p_search || '%' or sku ilike '%' || p_search || '%')
    and (p_category_id is null or category_id = p_category_id)
    order by created_at desc
    limit v_limit offset v_offset
  ) t;

  return jsonb_build_object(
    'data', v_results,
    'total', v_total,
    'page', p_page,
    'pageSize', p_page_size,
    'totalPages', ceiling(v_total::numeric / p_page_size)
  );
end;
$$;

-- 4. api_get_tenant - Get tenant config
create or replace function public.api_get_tenant(p_tenant_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not validate_tenant_access(p_tenant_id) then
    raise exception 'Unauthorized';
  end if;

  select row_to_json(t)::jsonb into v_result
  from tenants t
  where id = p_tenant_id;

  return v_result;
end;
$$;
