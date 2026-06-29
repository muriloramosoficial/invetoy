-- Adiciona campo is_system_admin na tabela profiles
-- System admin = administrador master do SaaS (nao de um tenant)

alter table public.profiles
  add column if not exists is_system_admin boolean default false;

-- View para metricas do admin (contagens por tenant)
create or replace view public.v_admin_metrics as
select
  t.id as tenant_id,
  t.name as tenant_name,
  t.slug as tenant_slug,
  t.plan,
  t.subscription_status,
  t.created_at as tenant_created_at,
  (select count(*) from profiles p where p.tenant_id = t.id) as user_count,
  (select count(*) from products pr where pr.tenant_id = t.id) as product_count,
  (select count(*) from categories c where c.tenant_id = t.id) as category_count,
  (select count(*) from locations l where l.tenant_id = t.id) as location_count,
  (select count(*) from movements m where m.tenant_id = t.id) as movement_count,
  (select count(*) from inventory_items i
   join products pr2 on pr2.id = i.product_id
   where pr2.tenant_id = t.id) as inventory_count
from public.tenants t
order by t.created_at desc;

-- RLS: apenas system admins podem acessar v_admin_metrics
-- (a funcao get_user_tenant_id ja faz bypass com security definer)
-- A tabela profiles ja tem RLS, entao protegemos por app-level check

-- View de atividade recente do sistema
create or replace view public.v_admin_activity as
select
  m.id,
  m.tenant_id,
  t.name as tenant_name,
  p.name as user_name,
  pr.name as product_name,
  m.type as movement_type,
  m.quantity,
  m.notes,
  m.created_at
from public.movements m
left join public.tenants t on t.id = m.tenant_id
left join public.profiles p on p.id = m.user_id
left join public.products pr on pr.id = m.product_id
order by m.created_at desc;
