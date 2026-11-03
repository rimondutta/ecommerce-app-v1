import { withAuth } from "next-auth/middleware";
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// General API limiter: 30 requests per 10 seconds
const generalRatelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: true,
      prefix: "ratelimit:general",
    })
  : null;

// Strict limiter for sensitive authentication endpoints (5 requests per 1 minute)
const authRatelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

// Sensitive auth endpoints that must be strictly rate-limited against brute force
const SENSITIVE_AUTH_PREFIXES = [
  '/api/auth/mobile/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/verify-reset-otp',
  '/api/auth/reset-password',
];

// ─── Routes whose responses must never be served from a shared cache ──────────
// These paths carry user-specific content (cart, account, orders, admin panel,
// authenticated API responses). Cache-Control: private, no-store ensures the
// Vercel Edge Cache (and any CDN in front) never stores or reuses responses
// across users — directly mitigating the shared cache-poisoning CVE class.
const PRIVATE_ROUTE_PREFIXES = [
  '/account',
  '/checkout',
  '/wishlist',
  '/admin',
  '/api/admin',
  '/api/store/orders',
  '/api/orders',
  '/api/v1/orders',
  '/api/users',
  '/api/notifications',
  '/api/auth',
  '/invoice',
];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      // Protect both admin dashboard pages AND admin API routes
      const isAdminRoute =
        (path.startsWith('/admin') && !path.startsWith('/admin/login')) ||
        path.startsWith('/api/admin');

      if (isAdminRoute) {
        return token?.role === "admin" || token?.role === "manager";
      }
      return true;
    },
  },
  pages: {
    signIn: "/admin/login",
  }
});

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // ── 1. Strict rate limiting on sensitive authentication routes ───────────────
  const isSensitiveAuth = SENSITIVE_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isSensitiveAuth && authRatelimit) {
    const { success, limit, reset, remaining } = await authRatelimit.limit(ip);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Too many authentication attempts. Please try again later." },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  // ── 2. General rate limiting on other /api/ routes (excluding NextAuth internals) ──
  const isNextAuthInternal = pathname.startsWith('/api/auth/') && !isSensitiveAuth;
  if (!isNextAuthInternal && pathname.startsWith('/api/') && generalRatelimit) {
    const { success, limit, reset, remaining } = await generalRatelimit.limit(ip);

    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  // ── 3. Cache poisoning protection ───────────────────────────────────────────
  // For private/authenticated routes, force Cache-Control: private, no-store so
  // the Vercel Edge Cache and any upstream CDN never stores or reuses responses
  // across users.
  if (isPrivateRoute(pathname)) {
    // Run auth checks first for these protected routes
    const authResult = await (authMiddleware as (req: NextRequest, event: NextFetchEvent) => Promise<NextResponse | Response | undefined>)(req, event);

    // If auth redirected, return that redirect
    if (authResult && authResult.status !== 200) {
      return authResult;
    }

    // Otherwise apply cache-poisoning protection headers
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store');
    // Vary: Cookie, Authorization ensures proxies and edge cache key responses per session/token
    response.headers.set('Vary', 'Cookie, Authorization');
    return response;
  }

  // Pass to Auth Middleware for remaining routes
  return (authMiddleware as (req: NextRequest, event: NextFetchEvent) => Promise<NextResponse | Response | undefined>)(req, event);
}

export const config = {
  // Match admin routes, API routes, and private/authenticated routes for auth & cache-poisoning protection.
  // Static pages and public ISR routes are excluded so they are served directly from the edge cache.
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
    "/invoice/:path*",
  ],
};
