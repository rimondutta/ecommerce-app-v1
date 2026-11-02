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
  '/api/users',
  '/api/notifications',
  '/api/auth',
  '/invoice',
];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ─── Nonce generation for CSP Report-Only ────────────────────────────────────
// A per-request cryptographic nonce that feeds the Report-Only CSP header.
// The enforced CSP lives in next.config.ts headers() and is ISR-compatible
// (no nonce, so static/ISR pages are not forced dynamic).
// Once violation reports are clean in production, flip to enforced.
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
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
    const authResult = await (authMiddleware as any)(req, event);

    // If auth redirected, return that redirect
    if (authResult && authResult.status !== 200) {
      return authResult;
    }

    // Otherwise apply cache-poisoning protection headers
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store');
    // Vary: Cookie ensures even a misconfigured proxy keys responses per-session
    response.headers.set('Vary', 'Cookie');
    return response;
  }

  // ── CSP Report-Only nonce injection (HTML pages only) ────────────────────────
  // Injects a per-request nonce into a Report-Only CSP header for monitoring.
  // DO NOT apply to /api routes — the mobile app must not receive CSP headers.
  const isApiRoute = pathname.startsWith('/api/');
  if (!isApiRoute) {
    const nonce = generateNonce();
    // strict-dynamic lets trusted scripts load further scripts dynamically
    // without needing each chunk individually listed — required for next/script.
    const reportOnlyCSP = [
      `script-src 'nonce-${nonce}' 'strict-dynamic' https://connect.facebook.net`,
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    // Forward the nonce to server components via a request header
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set('Content-Security-Policy-Report-Only', reportOnlyCSP);
    return response;
  }

  // Pass to Auth Middleware for remaining routes (API routes)
  return (authMiddleware as any)(req, event);
}

export const config = {
  // Match both admin routes and ALL API routes, plus authenticated page routes.
  // Exclude static assets and Next.js internals to avoid unnecessary overhead.
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
    "/invoice/:path*",
    // All other HTML pages (for CSP Report-Only nonce injection)
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|\\.well-known).*)",
  ],
}
