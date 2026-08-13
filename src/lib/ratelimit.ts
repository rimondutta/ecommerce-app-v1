import { Ratelimit } from '@upstash/ratelimit';
import { redis, hasRedis } from '@/lib/redis';

// Initialize rate limiter if Redis is available.
// Uses sliding window: max 5 requests per 1 minute.
const ratelimit = (hasRedis && redis) ? new Ratelimit({
  redis,
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
