-- ============================================================
-- INVENTOY - Database Schema (PostgreSQL + Supabase)
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1.1 Tenants (companies/organizations)
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  payment_provider text check (payment_provider in ('stripe', 'asaas', null)),
  payment_customer_id text,
  subscription_id text,
  subscription_status text check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete', null)),
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  locale text not null default 'pt-BR' check (locale in ('pt-BR', 'en', 'es'))
);

-- 1.2 Profiles (users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  name text not null,
  avatar_url text,
  role text not null default 'operator' check (role in ('admin', 'manager', 'operator')),
  created_at timestamptz not null default now()
);

-- 1.3 Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now(),
  unique(tenant_id, name)
);

-- 1.4 Locations (aisles, shelves, warehouses)
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  aisle text,
  shelf text,
  description text,
  created_at timestamptz not null default now(),
  unique(tenant_id, name)
);

-- 1.5 Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sku text not null,
  name text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  min_stock integer not null default 0,
  unit text not null default 'un' check (unit in ('un', 'kg', 'g', 'l', 'ml', 'cx', 'pc')),
  price decimal(10,2),
  cost decimal(10,2),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, sku)
);

-- 1.6 Inventory Items (stock per product per location)
create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  batch text,
  expiration_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, location_id)
);

-- 1.7 Movements (audit log)
create table if not exists movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  from_location_id uuid references locations(id) on delete set null,
  to_location_id uuid references locations(id) on delete set null,
  quantity integer not null,
  type text not null check (type in ('in', 'out', 'transfer', 'adjustment', 'count')),
  reference text,
  notes text,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index idx_profiles_tenant on profiles(tenant_id);
create index idx_products_tenant on products(tenant_id);
create index idx_products_sku on products(tenant_id, sku);
create index idx_categories_tenant on categories(tenant_id);
create index idx_locations_tenant on locations(tenant_id);
create index idx_inventory_product on inventory_items(product_id);
create index idx_inventory_location on inventory_items(location_id);
create index idx_movements_tenant on movements(tenant_id);
create index idx_movements_product on movements(product_id);
create index idx_movements_created on movements(created_at desc);
create index idx_movements_type on movements(type);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

alter table tenants enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table locations enable row level security;
alter table products enable row level security;
alter table inventory_items enable row level security;
alter table movements enable row level security;

-- Helper function to get current user's tenant_id
create or replace function get_user_tenant_id()
returns uuid
language sql
stable
as $$
  select tenant_id from profiles where id = auth.uid()
$$;

-- 3.1 Tenants policies
create policy "Users can view their own tenant"
  on tenants for select
  using (id = get_user_tenant_id());

create policy "Admins can update their tenant"
  on tenants for update
  using (id = get_user_tenant_id())
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and tenant_id = tenants.id
      and role = 'admin'
    )
  );

-- 3.2 Profiles policies
create policy "Users can view profiles in their tenant"
  on profiles for select
  using (tenant_id = get_user_tenant_id());

create policy "Users can update their own profile"
  on profiles for update
  using (id = auth.uid());

-- 3.3 Categories policies (tenant isolation)
create policy "Tenant isolation - select"
  on categories for select
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - insert"
  on categories for insert
  with check (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - update"
  on categories for update
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - delete"
  on categories for delete
  using (tenant_id = get_user_tenant_id());

-- 3.4 Locations policies
create policy "Tenant isolation - select"
  on locations for select
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - insert"
  on locations for insert
  with check (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - update"
  on locations for update
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - delete"
  on locations for delete
  using (tenant_id = get_user_tenant_id());

-- 3.5 Products policies
create policy "Tenant isolation - select"
  on products for select
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - insert"
  on products for insert
  with check (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - update"
  on products for update
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - delete"
  on products for delete
  using (tenant_id = get_user_tenant_id());

-- 3.6 Inventory Items policies
create policy "Tenant isolation - select"
  on inventory_items for select
  using (
    exists (
      select 1 from products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

create policy "Tenant isolation - insert"
  on inventory_items for insert
  with check (
    exists (
      select 1 from products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

create policy "Tenant isolation - update"
  on inventory_items for update
  using (
    exists (
      select 1 from products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

create policy "Tenant isolation - delete"
  on inventory_items for delete
  using (
    exists (
      select 1 from products
      where id = inventory_items.product_id
      and tenant_id = get_user_tenant_id()
    )
  );

-- 3.7 Movements policies
create policy "Tenant isolation - select"
  on movements for select
  using (tenant_id = get_user_tenant_id());

create policy "Tenant isolation - insert"
  on movements for insert
  with check (tenant_id = get_user_tenant_id());

-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================

-- 4.1 Auto-update updated_at
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger inventory_items_updated_at
  before update on inventory_items
  for each row execute function update_updated_at();

-- 4.2 Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  -- Create tenant for new users
  insert into tenants (name, slug)
  values (
    coalesce(new.raw_user_meta_data ->> 'tenant_name', 'My Company'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'tenant_name', 'my-company'), '[^a-zA-Z0-9]', '-', 'g'))
  )
  returning id into v_tenant_id;

  -- Create profile
  insert into profiles (id, tenant_id, email, name, role)
  values (
    new.id,
    v_tenant_id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'admin'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4.3 Log movement function
create or replace function log_movement(
  p_tenant_id uuid,
  p_product_id uuid,
  p_from_location_id uuid,
  p_to_location_id uuid,
  p_quantity integer,
  p_type text,
  p_notes text default null,
  p_reference text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_movement_id uuid;
begin
  insert into movements (tenant_id, product_id, from_location_id, to_location_id, quantity, type, notes, reference, user_id)
  values (p_tenant_id, p_product_id, p_from_location_id, p_to_location_id, p_quantity, p_type, p_notes, p_reference, auth.uid())
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

-- 4.4 Adjust inventory function (with movement logging)
create or replace function adjust_inventory(
  p_product_id uuid,
  p_location_id uuid,
  p_quantity integer,
  p_type text,
  p_notes text default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_current_quantity integer;
  v_old_quantity integer;
begin
  -- Get tenant_id from product
  select tenant_id into v_tenant_id from products where id = p_product_id;
  if v_tenant_id != get_user_tenant_id() then
    raise exception 'Unauthorized';
  end if;

  -- Get current quantity
  select quantity into v_current_quantity
  from inventory_items
  where product_id = p_product_id and location_id = p_location_id;

  if not found then
    -- Create inventory record if it doesn't exist
    insert into inventory_items (product_id, location_id, quantity)
    values (p_product_id, p_location_id, 0);
    v_current_quantity := 0;
  end if;

  v_old_quantity := v_current_quantity;

  if p_type = 'in' then
    update inventory_items
    set quantity = quantity + p_quantity
    where product_id = p_product_id and location_id = p_location_id;
  elsif p_type = 'out' then
    if v_current_quantity < p_quantity then
      raise exception 'Insufficient stock. Available: %, requested: %', v_current_quantity, p_quantity;
    end if;
    update inventory_items
    set quantity = quantity - p_quantity
    where product_id = p_product_id and location_id = p_location_id;
  elsif p_type = 'count' then
    update inventory_items
    set quantity = p_quantity
    where product_id = p_product_id and location_id = p_location_id;
  end if;

  -- Log movement
  perform log_movement(
    v_tenant_id,
    p_product_id,
    p_location_id,
    p_location_id,
    p_quantity,
    p_type,
    p_notes
  );
end;
$$;

-- ============================================================
-- 5. VIEWS (for analytics)
-- ============================================================

-- Low stock products
create or replace view low_stock_products as
select
  p.id as product_id,
  p.tenant_id,
  p.sku,
  p.name,
  p.min_stock,
  coalesce(sum(ii.quantity), 0) as current_quantity,
  l.name as location_name
from products p
left join inventory_items ii on ii.product_id = p.id
left join locations l on l.id = ii.location_id
where p.is_active = true
group by p.id, p.tenant_id, p.sku, p.name, p.min_stock, l.name
having coalesce(sum(ii.quantity), 0) <= p.min_stock;

-- Inventory summary
create or replace view inventory_summary as
with product_stock as (
  select
    p.id as product_id,
    p.tenant_id,
    p.name,
    p.cost,
    p.price,
    p.min_stock,
    coalesce(sum(ii.quantity), 0) as current_quantity
  from products p
  left join inventory_items ii on ii.product_id = p.id
  group by p.id, p.tenant_id, p.name, p.cost, p.price, p.min_stock
)
select
  tenant_id,
  count(distinct product_id) as total_products,
  count(distinct case when current_quantity > 0 then product_id end) as total_items,
  sum(current_quantity) as total_quantity,
  coalesce(sum(current_quantity * cost), 0) as total_cost_value,
  coalesce(sum(current_quantity * price), 0) as total_sale_value,
  count(distinct case when current_quantity <= min_stock then product_id end) as low_stock_count
from product_stock
group by tenant_id;
