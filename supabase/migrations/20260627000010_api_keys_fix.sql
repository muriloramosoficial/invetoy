-- ============================================================
-- INVENTOY - API Keys Security Fix
-- Corrige: armazenamento seguro com hash, tenant isolation
-- ============================================================

-- Add tenant_id to api_keys (required for isolation)
alter table public.api_keys
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

-- Add index for fast key lookup
create index if not exists idx_api_keys_tenant on public.api_keys(tenant_id);
create index if not exists idx_api_keys_hash on public.api_keys(key_hash);

-- Ensure RLS is enabled
alter table public.api_keys enable row level security;

-- Drop old policies if they exist
drop policy if exists "Tenant isolation - select" on public.api_keys;
drop policy if exists "Tenant isolation - insert" on public.api_keys;
drop policy if exists "Tenant isolation - update" on public.api_keys;
drop policy if exists "Tenant isolation - delete" on public.api_keys;
drop policy if exists "Admins can manage API keys" on public.api_keys;

-- System admins and staff can see all API keys
create policy "API Keys - select"
  on public.api_keys for select
  using (public.is_admin_or_staff() OR tenant_id = get_user_tenant_id());

-- Only system admins can insert/update/delete API keys
create policy "API Keys - insert"
  on public.api_keys for insert
  with check (public.is_system_admin());

create policy "API Keys - update"
  on public.api_keys for update
  using (public.is_system_admin());

create policy "API Keys - delete"
  on public.api_keys for delete
  using (public.is_system_admin());
