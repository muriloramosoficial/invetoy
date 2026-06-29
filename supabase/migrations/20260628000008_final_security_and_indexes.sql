-- ============================================================
-- INVENTOY - Final Security & Indexes
-- Completa os ultimos ajustes para 10/10
-- ============================================================

-- 1. Garantir security_invoker em v_assets (ja deve estar, mas idempotente)
alter view if exists public.v_assets set (security_invoker = true);

-- 2. Indices para batch e expiration_date (criam as colunas primeiro se nao existirem)
alter table public.products add column if not exists expiration_date date;
alter table public.products add column if not exists batch text;

create index if not exists idx_products_expiration
  on public.products(tenant_id, expiration_date);

create index if not exists idx_products_batch
  on public.products(tenant_id, batch);

-- 3. Indice para busca textual em produtos
create index if not exists idx_products_name_trgm
  on public.products using gin (name gin_trgm_ops);

-- 4. Indice para busca em sku
create index if not exists idx_products_sku_trgm
  on public.products using gin (sku gin_trgm_ops);

-- 5. Adicionar updated_at na tabela audit_log
alter table public.audit_log add column if not exists updated_at timestamptz not null default now();

-- 6. Notify DBA sobre email_confirm
do $$
begin
  raise log '[INVENTOY] Lembrete: ativar email_confirm em Supabase Auth > Settings';
end;
$$;
