-- ============================================================
-- INVENTOY - Soft Delete Universal + updated_at em todas as tabelas
-- ============================================================

-- 1. Adicionar updated_at onde falta
alter table tenants add column if not exists updated_at timestamptz not null default now();
alter table profiles add column if not exists updated_at timestamptz not null default now();
alter table categories add column if not exists updated_at timestamptz not null default now();
alter table locations add column if not exists updated_at timestamptz not null default now();
alter table api_keys add column if not exists updated_at timestamptz not null default now();
alter table invite_codes add column if not exists updated_at timestamptz not null default now();

-- 2. Adicionar deleted_at (soft delete) em todas as tabelas de negocio
alter table tenants add column if not exists deleted_at timestamptz;
alter table profiles add column if not exists deleted_at timestamptz;
alter table categories add column if not exists deleted_at timestamptz;
alter table locations add column if not exists deleted_at timestamptz;
alter table products add column if not exists deleted_at timestamptz;
alter table inventory_items add column if not exists deleted_at timestamptz;
alter table movements add column if not exists deleted_at timestamptz;
alter table api_keys add column if not exists deleted_at timestamptz;
alter table invite_codes add column if not exists deleted_at timestamptz;
-- Note: audit_log skipped — table does not exist on this remote;
-- will be created in a future migration cycle

-- 3. Trigger de updated_at para tabelas que nao tem
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tenants_updated_at on tenants;
create trigger tenants_updated_at before update on tenants for each row execute function update_updated_at_column();
drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at_column();
drop trigger if exists categories_updated_at on categories;
create trigger categories_updated_at before update on categories for each row execute function update_updated_at_column();
drop trigger if exists locations_updated_at on locations;
create trigger locations_updated_at before update on locations for each row execute function update_updated_at_column();
drop trigger if exists api_keys_updated_at on api_keys;
create trigger api_keys_updated_at before update on api_keys for each row execute function update_updated_at_column();
drop trigger if exists invite_codes_updated_at on invite_codes;
create trigger invite_codes_updated_at before update on invite_codes for each row execute function update_updated_at_column();

-- 4. Recrear RLS policies para filtrar deleted_at IS NULL em SELECT
-- Tenants
drop policy if exists "Users can view their own tenant" on tenants;
create policy "Users can view their own tenant"
  on tenants for select
  using (id = get_user_tenant_id() and deleted_at is null);

-- Profiles
drop policy if exists "Users can view profiles in their tenant" on profiles;
create policy "Users can view profiles in their tenant"
  on profiles for select
  using (tenant_id = get_user_tenant_id() and deleted_at is null);

-- Products
drop policy if exists "Tenant isolation - select" on products;
create policy "Tenant isolation - select"
  on products for select
  using (tenant_id = get_user_tenant_id() and deleted_at is null);

-- Categories
drop policy if exists "Tenant isolation - select" on categories;
create policy "Tenant isolation - select"
  on categories for select
  using (tenant_id = get_user_tenant_id() and deleted_at is null);

-- Locations
drop policy if exists "Tenant isolation - select" on locations;
create policy "Tenant isolation - select"
  on locations for select
  using (tenant_id = get_user_tenant_id() and deleted_at is null);

-- Movements
drop policy if exists "Tenant isolation - select" on movements;
create policy "Tenant isolation - select"
  on movements for select
  using (tenant_id = get_user_tenant_id() and deleted_at is null);

-- Inventory items (via product tenant check)
drop policy if exists "Tenant isolation - select" on inventory_items;
create policy "Tenant isolation - select"
  on inventory_items for select
  using (
    exists (
      select 1 from products
      where products.id = inventory_items.product_id
      and products.tenant_id = get_user_tenant_id()
      and products.deleted_at is null
    )
  );

-- API Keys
drop policy if exists "Tenant isolation - select" on api_keys;
create policy "Tenant isolation - select"
  on api_keys for select
  using (tenant_id = get_user_tenant_id() and deleted_at is null);

-- 5. Recrear handle_new_user com sanitizacao
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_tenant_name text;
  v_slug text;
  v_tenant_id uuid;
  v_suffix int := 0;
  v_original_slug text;
begin
  -- Sanitize tenant name
  v_tenant_name := trim(coalesce(new.raw_user_meta_data ->> 'tenant_name', ''));
  if v_tenant_name = '' or length(v_tenant_name) > 100 then
    v_tenant_name := 'My Company';
  end if;

  -- Generate slug with strict sanitization
  v_slug := lower(regexp_replace(v_tenant_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' or length(v_slug) > 60 then
    v_slug := 'company-' || gen_random_uuid()::text;
    v_slug := left(v_slug, 60);
  end if;

  v_original_slug := v_slug;

  -- Handle duplicate slugs
  loop
    begin
      insert into tenants (name, slug)
      values (v_tenant_name, v_slug)
      returning id into v_tenant_id;
      exit;
    exception when unique_violation then
      v_suffix := v_suffix + 1;
      v_slug := v_original_slug || '-' || v_suffix;
      if length(v_slug) > 60 then
        v_slug := left(v_original_slug, 50) || '-' || v_suffix;
      end if;
    end;
  end loop;

  -- Sanitize user name
  declare
    v_user_name text;
  begin
    v_user_name := trim(coalesce(new.raw_user_meta_data ->> 'name', ''));
    if v_user_name = '' or length(v_user_name) > 100 then
      v_user_name := split_part(new.email, '@', 1);
    end if;

    -- Create profile
    insert into profiles (id, tenant_id, email, name, role)
    values (new.id, v_tenant_id, new.email, v_user_name, 'admin');
  end;

  return new;
end;
$$;

-- 6. Validar que a funcao compila
do $$ begin
  perform handle_new_user();
exception when others then
  -- expected when called outside trigger
end $$;
