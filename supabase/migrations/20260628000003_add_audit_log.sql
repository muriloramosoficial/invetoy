-- ============================================================
-- INVENTOY - Audit Log Table
-- Rastreia ações importantes no sistema
-- ============================================================

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for fast queries
create index if not exists idx_audit_log_tenant
  on public.audit_log(tenant_id, created_at desc);

create index if not exists idx_audit_log_user
  on public.audit_log(user_id, created_at desc);

create index if not exists idx_audit_log_action
  on public.audit_log(action, created_at desc);

-- Enable RLS
alter table public.audit_log enable row level security;

-- Admins can view audit logs of their tenant
create policy "Users can view audit logs of their tenant"
  on public.audit_log for select
  using (
    is_system_admin() OR tenant_id = get_user_tenant_id()
  );

-- Only service_role can insert audit logs (via trigger or RPC)
create policy "Only service role can insert audit logs"
  on public.audit_log for insert
  with check (true);

-- Auto-log function for movements
create or replace function public.log_audit_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (tenant_id, user_id, action, entity_type, entity_id, metadata)
  values (
    new.tenant_id,
    new.user_id,
    'movement.' || new.type,
    'movement',
    new.id,
    jsonb_build_object(
      'product_id', new.product_id,
      'quantity', new.quantity,
      'from_location_id', new.from_location_id,
      'to_location_id', new.to_location_id
    )
  );
  return new;
end;
$$;

create trigger trg_audit_movement
  after insert on public.movements
  for each row execute function public.log_audit_movement();
