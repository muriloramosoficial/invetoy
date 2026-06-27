import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis from environment variables
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in .env.local
const redis = Redis.fromEnv();

// Rate limiter for login - 5 attempts per minute
export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "ratelimit:login",
});

// Rate limiter for register - 3 attempts per 5 minutes
export const registerRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "300 s"),
  analytics: true,
  prefix: "ratelimit:register",
});

// Rate limiter for V1 API - 60 requests per minute per tenant
export const v1ApiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  prefix: "ratelimit:v1",
});

// Rate limiter for V1 API write operations - 30 requests per minute
export const v1ApiWriteRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "ratelimit:v1:write",
});


