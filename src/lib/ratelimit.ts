import { Ratelimit } from '@upstash/ratelimit';
import { redis, hasRedis } from '@/lib/redis';

export type RateLimitTier = 'auth' | 'order' | 'ai' | 'upload' | 'global' | 'strict';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number; // in seconds
  source: 'redis' | 'emergency-memory' | 'fail-open';
}

// ── Multi-Tier Distributed Limiters ──────────────────────────────────────────

const authRatelimit = (hasRedis && redis)
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

const orderRatelimit = (hasRedis && redis)
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:order',
    })
  : null;

const aiRatelimit = (hasRedis && redis)
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: 'ratelimit:ai',
    })
  : null;

const uploadRatelimit = (hasRedis && redis)
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:upload',
    })
  : null;

const globalRatelimit = (hasRedis && redis)
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'ratelimit:global',
    })
  : null;

// ── In-Memory Emergency Fallback (when Redis is unavailable or unconfigured) ───
// Ensures high-risk endpoints (e.g. login brute-force) cannot be hit unbounded
// even during Redis outages. Bounded to 2,000 entries with automatic expiration.
interface MemoryBucket {
  count: number;
  resetAt: number;
}
const emergencyMemoryStore = new Map<string, MemoryBucket>();
const MAX_MEMORY_BUCKETS = 2000;

function checkEmergencyMemoryLimit(key: string, limit: number, windowMs = 60000): RateLimitResult {
  const now = Date.now();

  // Prune expired buckets if store grows large
  if (emergencyMemoryStore.size >= MAX_MEMORY_BUCKETS) {
    for (const [k, b] of emergencyMemoryStore.entries()) {
      if (now > b.resetAt) emergencyMemoryStore.delete(k);
    }
  }

  let bucket = emergencyMemoryStore.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    emergencyMemoryStore.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const success = bucket.count <= limit;
  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    success,
    limit,
    remaining,
    reset: bucket.resetAt,
    retryAfter,
    source: 'emergency-memory',
  };
}

/**
 * Standardized Rate Limit Checker.
 * Inspects endpoint risk, applies distributed Upstash Redis limiter,
 * and handles failures safely according to an explicit security policy.
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'global'
): Promise<RateLimitResult> {
  const normalizedTier = tier === 'strict' ? 'auth' : tier;

  let limiter: Ratelimit | null = null;
  let fallbackLimit = 60;

  switch (normalizedTier) {
    case 'auth':
      limiter = authRatelimit;
      fallbackLimit = 5;
      break;
    case 'order':
      limiter = orderRatelimit;
      fallbackLimit = 5;
      break;
    case 'ai':
      limiter = aiRatelimit;
      fallbackLimit = 20;
      break;
    case 'upload':
      limiter = uploadRatelimit;
      fallbackLimit = 10;
      break;
    case 'global':
    default:
      limiter = globalRatelimit;
      fallbackLimit = 60;
      break;
  }

  // 1. If Redis is configured, execute distributed rate limiting
  if (limiter) {
    try {
      const res = await limiter.limit(identifier);
      const retryAfter = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));

      if (!res.success) {
        console.warn(`[RATELIMIT_EXCEEDED] Tier: ${normalizedTier} | IP: ${identifier} | Remaining: ${res.remaining} | Reset in: ${retryAfter}s`);
      }

      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
        retryAfter,
        source: 'redis',
      };
    } catch (redisError) {
      console.error(`[RATELIMIT_REDIS_ERROR] Error contacting Redis for tier '${normalizedTier}':`, redisError);
      // Fall through to emergency policy
    }
  }

  // 2. Policy when Redis is unavailable or unconfigured:
  // - High-risk tiers ('auth', 'order'): Enforce emergency in-memory limiter to prevent brute force
  if (normalizedTier === 'auth' || normalizedTier === 'order' || normalizedTier === 'ai') {
    const memoryRes = checkEmergencyMemoryLimit(`${normalizedTier}:${identifier}`, fallbackLimit, 60000);
    if (!memoryRes.success) {
      console.warn(`[RATELIMIT_EMERGENCY_BLOCKED] Tier: ${normalizedTier} | IP: ${identifier} | RetryAfter: ${memoryRes.retryAfter}s`);
    }
    return memoryRes;
  }

  // - Low-risk tier ('global'): Fail-open to avoid dropping browsing customers
  return {
    success: true,
    limit: fallbackLimit,
    remaining: fallbackLimit,
    reset: Date.now() + 60000,
    retryAfter: 0,
    source: 'fail-open',
  };
}

/**
 * Backwards-compatible helper returning boolean (true = blocked, false = allowed).
 */
export async function isRateLimited(
  identifier: string,
  type: RateLimitTier = 'strict'
): Promise<boolean> {
  const result = await checkRateLimit(identifier, type);
  return !result.success;
}

/**
 * Generates standard HTTP 429 response headers and JSON body.
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: `Too many requests. Please wait ${result.retryAfter} seconds before trying again.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
      },
    }
  );
}
