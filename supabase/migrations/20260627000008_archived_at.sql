-- Add archived_at column to categories, locations, and products
-- This allows soft-delete: regular users archive, only system admins hard-delete

alter table categories
  add column archived_at timestamptz;

alter table locations
  add column archived_at timestamptz;

alter table products
  add column archived_at timestamptz;

-- Update low_stock_products view to exclude archived products
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
  and p.archived_at is null
group by p.id, p.tenant_id, p.sku, p.name, p.min_stock, l.name
having coalesce(sum(ii.quantity), 0) <= p.min_stock;

-- Update inventory_summary view to exclude archived products
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
  where p.archived_at is null
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
