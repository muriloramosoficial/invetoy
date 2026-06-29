// ─── Rate Limiter — Fail-Closed (v2) ───
// ✅ Usa RPC function check_rate_limit() no banco
// ✅ Fail-closed: se o banco falha, retorna 429

import { getAdminClient } from "@infra/database/supabase/client";

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  "POST:/api/auth/login": { limit: 5, windowSeconds: 60 },
  "POST:/api/auth/register": { limit: 3, windowSeconds: 300 },
  "POST:/api/v1/products": { limit: 60, windowSeconds: 60 },
  "default": { limit: 30, windowSeconds: 60 },
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

export async function checkRateLimit(
  request: Request,
  endpoint?: string
): Promise<RateLimitResult> {
  const method = request.method;
  const path = endpoint || new URL(request.url).pathname;
  const key = `${method}:${path}`;
  const config = DEFAULT_CONFIGS[key] || DEFAULT_CONFIGS["default"];
  const ip = getClientIp(request);

  const supabase = getAdminClient();

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_ip_address: ip,
    p_endpoint: key,
    p_max_requests: config.limit,
    p_window_seconds: config.windowSeconds,
  });

  if (error || !data) {
    return { allowed: false, remaining: 0, resetIn: config.windowSeconds };
  }

  const result = data as { allowed: boolean; remaining: number; reset_in: number };
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetIn: result.reset_in,
  };
}
