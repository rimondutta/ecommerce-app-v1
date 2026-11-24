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

const rawUrl = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/^["']|["']$/g, '');
const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim().replace(/^["']|["']$/g, '');

export const hasRedis = !!rawUrl && !!rawToken;

export const redis: Redis | null = hasRedis
  ? new Redis({
      url: rawUrl!,
      token: rawToken!,
      // Next.js static prerender and ISR routes throw DynamicServerError when fetch uses 'no-store'.
      // By setting cache: 'default', requests avoid triggering dynamic server bailout during static rendering.
      cache: 'default',
    })
  : null;
