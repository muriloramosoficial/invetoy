-- ============================================================
-- INVENTOY - Plan Configurations (admin editable)
-- Permite que admins editem precos e itens dos planos
-- ============================================================

create table if not exists public.plan_configs (
  id text primary key, -- 'free', 'starter', 'pro', 'enterprise'
  name text not null,
  price text not null, -- 'R$ 0', 'R$ 49', etc.
  period text not null default '/mês',
  description text not null,
  features text[] not null default '{}',
  limits_products integer not null default 0,
  limits_users integer not null default 0,
  highlighted boolean not null default false,
  cta text not null default 'Assinar',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.plan_configs enable row level security;

-- System admins can manage plan configs
create policy "System admins can manage plan configs"
  on public.plan_configs for all
  using (public.is_system_admin());

-- Anyone can read plan configs (for landing page)
create policy "Anyone can read plan configs"
  on public.plan_configs for select
  using (true);

-- Insert default plan data
insert into public.plan_configs (id, name, price, period, description, features, limits_products, limits_users, highlighted, cta, sort_order) values
  ('free', 'Free', 'R$ 0', '/mês', 'Para pequenas equipes começando',
   '{Ate 30 itens,1 usuario,Dashboard basico,Movimentacoes manuais,Suporte por email}',
   30, 1, false, 'Comecar Gratis', 1),
  ('starter', 'Starter', 'R$ 49', '/mês', 'Para negocios em crescimento',
   '{Ate 500 itens,3 usuarios,Relatorios avancados,Leitor de codigos,Exportacao CSV,API REST,Suporte por email}',
   500, 3, true, 'Testar Gratis', 2),
  ('pro', 'Pro', 'R$ 149', '/mês', 'Para operacoes em escala',
   '{Ate 3.000 itens,10 usuarios,API REST,Leitor de codigos,Relatorios customizados,Exportacao CSV,Multiplas filiais,Suporte prioritario 24h}',
   3000, 10, false, 'Testar Gratis', 3),
  ('enterprise', 'Enterprise', 'Sob consulta', '', 'Para grandes operacoes',
   '{Itens ilimitados,Usuarios ilimitados,API REST,Leitor de codigos,Relatorios customizados,Multiplas filiais,Onboarding dedicado,SLA personalizado}',
   -1, -1, false, 'Falar com Vendas', 4)
on conflict (id) do nothing;
