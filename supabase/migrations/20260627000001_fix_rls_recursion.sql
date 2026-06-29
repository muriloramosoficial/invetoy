-- Fix infinite recursion in get_user_tenant_id()
-- The function queries `profiles`, but `profiles` has RLS policy
-- that calls this same function → infinite loop → stack depth exceeded
-- Adding SECURITY DEFINER makes the function bypass RLS

create or replace function get_user_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from profiles where id = auth.uid()
$$;
