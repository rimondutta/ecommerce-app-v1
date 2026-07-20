import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash Redis credentials exist
const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize the Redis client only if credentials exist
const redisClient = hasRedis ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
}) : null;

// Initialize rate limiter if Redis is available. 
// Uses sliding window: max 5 requests per 1 minute.
const ratelimit = redisClient ? new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
}) : null;

/**
 * Validates whether the given identifier (e.g. IP address) is rate-limited.
 * Gracefully falls back to allowing the request if Upstash Redis is not configured.
 * 
 * @param identifier The unique string to rate limit by (e.g., IP address).
 * @returns boolean True if the request should be blocked, False otherwise.
 */
export async function isRateLimited(identifier: string): Promise<boolean> {
  if (!ratelimit) {
    // Graceful fallback when Upstash is not configured.
    console.warn('[ratelimit] Upstash Redis credentials not found, bypassing rate limit.');
    return false;
  }

  try {
    const { success } = await ratelimit.limit(identifier);
    // If success is false, the user has exceeded the limit
    return !success;
  } catch (error) {
    console.error('[ratelimit] Error applying rate limit:', error);
    // In case of a Redis failure, fail open to prevent blocking legitimate checkouts
    return false;
  }
}
