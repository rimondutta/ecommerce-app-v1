/**
 * Shared Upstash Redis client.
 *
 * Exported as a singleton so every API route, cache helper, and rate-limiter
 * reuses the same connection pool instead of creating a new HTTP client per
 * request. Import `redis` (the client) or `hasRedis` (the availability flag)
 * anywhere you need them.
 *
 * Falls back gracefully when credentials are absent (e.g. local dev without
 * a Redis instance) — callers should always check `hasRedis` before using.
 */
import { Redis } from '@upstash/redis';

export const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis: Redis | null = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      // Next.js static prerender and ISR routes throw DynamicServerError when fetch uses 'no-store'.
      // By setting cache: 'default', requests avoid triggering dynamic server bailout during static rendering.
      cache: 'default',
    })
  : null;
