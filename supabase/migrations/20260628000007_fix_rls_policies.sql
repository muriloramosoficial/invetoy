-- ============================================================
-- INVENTOY - Fix RLS Policies (Overly Permissive)
-- 
-- Problema identificado:
-- 1. rate_limits: policy "Only service role can manage rate_limits"
--    usava `using (true)` — qualquer usuario autenticado podia ler/escrever.
--    Correcao: `using (false)` — bloqueia acesso direto.
--    O acesso continua funcionando via RPC check_rate_limit() (security definer).
--
-- 2. audit_log: policy "Only service role can insert audit logs"
--    usava `with check (true)` — qualquer usuario autenticado podia inserir.
--    Correcao: `with check (false)` — bloqueia insert direto.
--    O insert continua funcionando via trigger log_audit_movement() (security definer).
-- ============================================================

-- 1. Fix rate_limits RLS
drop policy if exists "Only service role can manage rate_limits" on public.rate_limits;

create policy "Block all direct access — use check_rate_limit RPC"
  on public.rate_limits
  for all
  using (false);

-- 2. Fix audit_log insert policy
drop policy if exists "Only service role can insert audit logs" on public.audit_log;

create policy "Block direct insert — use audit trigger"
  on public.audit_log
  for insert
  with check (false);

-- 3. Garantir que audit_log select ainda funciona via RLS existente
-- A policy "Users can view audit logs of their tenant" permanece intacta.
