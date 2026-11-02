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

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: true,
    })
  : null;

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

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // ── Rate limiting on all /api/ routes EXCEPT NextAuth internals ─────────────
  const isAuthRoute = pathname.startsWith('/api/auth/');
  if (!isAuthRoute && pathname.startsWith('/api/') && ratelimit) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }
  }

  // ── Cache poisoning protection ───────────────────────────────────────────────
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
}
