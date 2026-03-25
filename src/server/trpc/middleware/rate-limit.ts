import { TRPCError } from "@trpc/server";

/**
 * Simple in-memory rate limiter for AI endpoints.
 * In production, replace with Redis-based solution.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

/**
 * Check rate limit for a given key (usually userId or IP).
 * Throws TRPCError if limit exceeded.
 */
export function checkRateLimit(key: string, config: RateLimitConfig = DEFAULT_CONFIG): void {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
    });
  }
}

/**
 * Rate limit configs for different endpoint types.
 */
export const RATE_LIMITS = {
  ai: { windowMs: 60_000, maxRequests: 10 }, // AI endpoints: 10/min
  scoring: { windowMs: 60_000, maxRequests: 20 }, // Scoring: 20/min
  intake: { windowMs: 300_000, maxRequests: 5 }, // Quick Intake: 5/5min
  general: { windowMs: 60_000, maxRequests: 100 }, // General: 100/min
} as const;
