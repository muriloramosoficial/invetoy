import { createAdminClient } from "@/lib/supabase/admin";

export interface RateLimitConfig {
  /** Max requests allowed within the window (in seconds) */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  "POST:/api/auth/login": { limit: 5, windowSeconds: 60 },       // 5 attempts/min
  "POST:/api/auth/register": { limit: 3, windowSeconds: 300 },   // 3 registrations/5min
  "POST:/api/v1/products": { limit: 60, windowSeconds: 60 },     // 60 creations/min
  "default": { limit: 30, windowSeconds: 60 },                    // 30 requests/min default
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback for local development
  return "127.0.0.1";
}

export async function checkRateLimit(
  request: Request,
  endpoint?: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const method = request.method;
  const path = endpoint || new URL(request.url).pathname;
  const key = `${method}:${path}`;

  const config = DEFAULT_CONFIGS[key] || DEFAULT_CONFIGS["default"];
  const ip = getClientIp(request);

  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

  try {
    const supabase = createAdminClient();

    // Clean up old entries (every request)
    const cleanupThreshold = new Date(now.getTime() - 3600 * 1000); // 1 hour
    await supabase
      .from("rate_limits")
      .delete()
      .lt("window_start", cleanupThreshold.toISOString());

    // Get current count for this IP + endpoint in the current window
    const { data: currentEntry } = await supabase
      .from("rate_limits")
      .select("request_count, window_start")
      .eq("ip_address", ip)
      .eq("endpoint", key)
      .gte("window_start", windowStart.toISOString())
      .order("window_start", { ascending: false })
      .limit(1)
      .single();

    if (!currentEntry) {
      // First request in this window
      await supabase.from("rate_limits").insert({
        ip_address: ip,
        endpoint: key,
        window_start: now.toISOString(),
        request_count: 1,
      });

      return {
        allowed: true,
        remaining: config.limit - 1,
        resetIn: config.windowSeconds,
      };
    }

    const count = currentEntry.request_count + 1;
    const elapsed = (now.getTime() - new Date(currentEntry.window_start).getTime()) / 1000;
    const resetIn = Math.max(0, Math.ceil(config.windowSeconds - elapsed));

    if (count > config.limit) {
      return { allowed: false, remaining: 0, resetIn };
    }

    // Increment counter
    await supabase
      .from("rate_limits")
      .update({ request_count: count })
      .eq("ip_address", ip)
      .eq("endpoint", key)
      .gte("window_start", windowStart.toISOString());

    return {
      allowed: true,
      remaining: config.limit - count,
      resetIn,
    };
  } catch (err) {
    // Rate limiting failure should NOT block the request
    // Log and allow through
    console.error("[rate-limiter] Error:", err);
    return { allowed: true, remaining: -1, resetIn: 0 };
  }
}
