/**
 * Lightweight Redis-backed cache layer.
 *
 * API
 * ───
 * withCache(key, ttlSeconds, fn)  — Returns cached value or runs fn(), caches
 *                                   the result, then returns it.
 * invalidateCache(...patterns)    — Deletes one or more exact keys. Supports
 *                                   wildcard patterns via SCAN (e.g. 'products:*').
 *
 * Graceful Degradation
 * ────────────────────
 * If Redis is not configured (no env vars) or a Redis operation fails, both
 * helpers fall back transparently — withCache runs fn() directly, and
 * invalidateCache is a no-op. The application keeps working; caching is purely
 * additive.
 *
 * Key Convention
 * ──────────────
 * All keys are automatically prefixed with "cache:" to avoid collisions with
 * rate-limiter keys and other Redis namespaces.
 *
 *   withCache('products:list', 60, fn)  →  Redis key: "cache:products:list"
 */
import { redis, hasRedis } from '@/lib/redis';

const PREFIX = 'cache:';

function prefixed(key: string) {
  return key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;
}

/**
 * Fetch from cache, or compute + store the result.
 *
 * @param key        Cache key (will be prefixed with "cache:")
 * @param ttl        Time-to-live in seconds
 * @param fn         Async factory — called only on cache miss
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  if (!hasRedis || !redis || isBuildTime) {
    // During build time or when Redis is absent, fetch directly from DB without triggering dynamic fetch bailout
    return fn();
  }

  const cacheKey = prefixed(key);

  try {
    const cached = await redis.get<T>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err: unknown) {
    // Redis read failure — fall through to live data gracefully
    console.warn('[cache] GET failed for key:', cacheKey, err instanceof Error ? err.message : String(err));
  }

  // Cache miss — compute the real value
  const value = await fn();

  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(value));
  } catch (err: unknown) {
    // Redis write failure — value is still returned, just not cached
    console.warn('[cache] SETEX failed for key:', cacheKey, err instanceof Error ? err.message : String(err));
  }

  return value;
}

/**
 * Delete one or more cache keys.
 *
 * Supports simple wildcards via SCAN: pass 'products:*' to delete all keys
 * that start with "cache:products:".
 *
 * @param patterns  One or more keys/patterns to invalidate
 */
export async function invalidateCache(...patterns: string[]): Promise<void> {
  if (!hasRedis || !redis) return;

  for (const pattern of patterns) {
    const fullPattern = prefixed(pattern);

    if (!fullPattern.includes('*')) {
      // Exact key — single DEL
      try {
        await redis.del(fullPattern);
      } catch (err) {
        console.error(`[cache] DEL ${fullPattern} failed:`, err);
      }
      continue;
    }

    // Wildcard — SCAN + DEL in batches to avoid blocking Redis
    try {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          match: fullPattern,
          count: 100,
        });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== 0);
    } catch (err) {
      console.error(`[cache] SCAN/DEL ${fullPattern} failed:`, err);
    }
  }
}
