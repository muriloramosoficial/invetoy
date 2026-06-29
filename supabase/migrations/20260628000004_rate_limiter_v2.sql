-- ============================================================
-- INVENTOY - Rate Limiter RPC Function (v2)
-- Substitui a lógica inline do rate-limiter.ts por uma RPC function
-- Fail-closed: se algo falhar, retorna block (não allow)
-- ============================================================

create or replace function public.check_rate_limit(
  p_ip_address text,
  p_endpoint text,
  p_max_requests integer default 30,
  p_window_seconds integer default 60
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_current_count integer;
  v_cleanup_threshold timestamptz;
  v_reset_in integer;
begin
  v_window_start := v_now - (p_window_seconds * interval '1 second');
  v_cleanup_threshold := v_now - interval '1 hour';

  -- Cleanup old entries (every call)
  delete from public.rate_limits
  where window_start < v_cleanup_threshold;

  -- Get current count for this IP + endpoint
  select request_count into v_current_count
  from public.rate_limits
  where ip_address = p_ip_address
    and endpoint = p_endpoint
    and window_start >= v_window_start
  order by window_start desc
  limit 1;

  if not found then
    -- First request in this window
    insert into public.rate_limits (ip_address, endpoint, window_start, request_count)
    values (p_ip_address, p_endpoint, v_now, 1);

    return jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'reset_in', p_window_seconds
    );
  end if;

  if v_current_count >= p_max_requests then
    v_reset_in := greatest(0, ceil(extract(epoch from (v_window_start + p_window_seconds * interval '1 second' - v_now)))::int);
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_in', v_reset_in
    );
  end if;

  -- Increment counter
  update public.rate_limits
  set request_count = request_count + 1
  where ip_address = p_ip_address
    and endpoint = p_endpoint
    and window_start >= v_window_start;

  v_reset_in := greatest(0, ceil(extract(epoch from (v_window_start + p_window_seconds * interval '1 second' - v_now)))::int);

  return jsonb_build_object(
    'allowed', true,
    'remaining', p_max_requests - v_current_count - 1,
    'reset_in', v_reset_in
  );
end;
$$;
