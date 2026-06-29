-- Adiciona campos de patrimonio (asset management) na tabela products
-- Placa de patrimonio, marca, modelo, numero de serie, etc.

alter table public.products
  add column if not exists asset_tag text unique,
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists serial_number text,
  add column if not exists acquisition_date date,
  add column if not exists warranty_expiry date,
  add column if not exists responsible_user text,
  add column if not exists condition text default 'bom' check (condition in ('excelente', 'bom', 'regular', 'ruim', 'danificado'));

-- View para patrimonio com localizacao atual
create or replace view public.v_assets as
select
  p.*,
  c.name as category_name,
  il.location_id as current_location_id,
  l.name as current_location_name,
  il.quantity
from public.products p
left join public.categories c on c.id = p.category_id
left join public.inventory_items il on il.product_id = p.id
left join public.locations l on l.id = il.location_id
where p.asset_tag is not null;
