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

// ── In-Memory L1 Cache (0ms response time directly from process RAM) ─────────
interface MemoryEntry {
  value: unknown;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryEntry>();
const MAX_MEMORY_ENTRIES = 500;

function getFromMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setToMemory(key: string, value: unknown, ttlSeconds: number) {
  // Prevent memory leaks by bounding cache size
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function invalidateMemory(pattern: string) {
  if (!pattern.includes('*')) {
    memoryCache.delete(pattern);
    return;
  }
  const prefix = pattern.replace(/\*.*$/, '');
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Fetch from cache, or compute + store the result.
 * Multi-tier: L1 Process Memory (0ms) -> L2 Upstash Redis -> Database
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
  const cacheKey = prefixed(key);

  // 1. Check L1 In-Memory Cache (Instant 0ms lookup)
  const memoryHit = getFromMemory<T>(cacheKey);
  if (memoryHit !== null && memoryHit !== undefined) {
    return memoryHit;
  }

  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  if (!hasRedis || !redis || isBuildTime) {
    // If Redis is unavailable, compute value and save in L1 memory
    const val = await fn();
    setToMemory(cacheKey, val, Math.min(ttl, 120));
    return val;
  }

  // 2. Check L2 Redis Cache
  try {
    const cached = await redis.get<T>(cacheKey);
    if (cached !== null && cached !== undefined) {
      setToMemory(cacheKey, cached, ttl);
      return cached;
    }
  } catch (err: unknown) {
    console.warn('[cache] GET failed for key:', cacheKey, err instanceof Error ? err.message : String(err));
  }

  // 3. Cache miss — compute real value
  const value = await fn();

  // Populate L1 Memory immediately
  setToMemory(cacheKey, value, ttl);

  // Populate L2 Redis asynchronously without blocking
  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(value));
  } catch (err: unknown) {
    console.warn('[cache] SETEX failed for key:', cacheKey, err instanceof Error ? err.message : String(err));
  }

  return value;
}

/**
 * Delete one or more cache keys from both L1 Memory and L2 Redis.
 *
 * Supports simple wildcards via SCAN: pass 'products:*' to delete all keys
 * that start with "cache:products:".
 *
 * @param patterns  One or more keys/patterns to invalidate
 */
export async function invalidateCache(...patterns: string[]): Promise<void> {
  for (const pattern of patterns) {
    const fullPattern = prefixed(pattern);
    invalidateMemory(fullPattern);

    if (!hasRedis || !redis) continue;

    if (!fullPattern.includes('*')) {
      try {
        await redis.del(fullPattern);
      } catch (err) {
        console.error(`[cache] DEL ${fullPattern} failed:`, err);
      }
      continue;
    }

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
