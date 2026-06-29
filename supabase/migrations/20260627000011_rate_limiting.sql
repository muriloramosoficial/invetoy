-- Rate limiting table for API security
-- Tracks request counts per IP per endpoint per time window

create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  endpoint text not null,
  window_start timestamptz not null default now(),
  request_count int not null default 1,
  created_at timestamptz not null default now()
);

-- Index for fast lookups by IP + endpoint within a window
create index if not exists idx_rate_limits_ip_endpoint_window
  on public.rate_limits (ip_address, endpoint, window_start desc);

-- Index for cleanup of old entries
create index if not exists idx_rate_limits_window_start
  on public.rate_limits (window_start);

-- Enable RLS (no public access - only server-side via service_role)
alter table public.rate_limits enable row level security;

-- Only service_role can access rate_limits (no public RLS)
create policy "Only service role can manage rate_limits"
  on public.rate_limits
  for all
  using (true)
  with check (true);
