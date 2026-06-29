import { cache } from "./simple-cache";

export interface RateLimitState {
  remaining: number;
  resetIn: number;
}

export function checkKeyRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitState {
  const now = Date.now();
  const cacheKey = `ratelimit:${key}`;
  const entry = cache.get<{ count: number; resetAt: number }>(cacheKey);

  if (!entry) {
    cache.set(cacheKey, { count: 1, resetAt: now + windowMs }, windowMs);
    return { remaining: maxRequests - 1, resetIn: Math.ceil(windowMs / 1000) };
  }

  if (now > entry.resetAt) {
    cache.set(cacheKey, { count: 1, resetAt: now + windowMs }, windowMs);
    return { remaining: maxRequests - 1, resetIn: Math.ceil(windowMs / 1000) };
  }

  entry.count += 1;
  cache.set(cacheKey, entry, Math.max(0, entry.resetAt - now));

  return {
    remaining: Math.max(0, maxRequests - entry.count),
    resetIn: Math.ceil(Math.max(0, entry.resetAt - now) / 1000),
  };
}
