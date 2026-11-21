import { withAuth } from "next-auth/middleware";
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { checkRateLimit, createRateLimitResponse } from "@/lib/ratelimit";
import { handleCorsPreflight, getCorsHeaders } from "@/lib/cors";

// Sensitive auth endpoints that must be strictly rate-limited against brute force
const SENSITIVE_AUTH_PREFIXES = [
  '/api/auth/mobile/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/verify-reset-otp',
  '/api/auth/reset-password',
];

// ─── Routes whose responses must never be served from a shared cache ──────────
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

  // ── 0. Handle CORS preflight on API routes ──────────────────────────────────
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return handleCorsPreflight(req);
  }

  // ── 1. Strict rate limiting on sensitive authentication routes ───────────────
  const isSensitiveAuth = SENSITIVE_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isSensitiveAuth) {
    const rateLimit = await checkRateLimit(ip, 'auth');
    if (!rateLimit.success) {
      const resp = createRateLimitResponse(rateLimit);
      const corsHeaders = getCorsHeaders(req);
      for (const [k, v] of Object.entries(corsHeaders)) {
        resp.headers.set(k, v);
      }
      return resp;
    }
  }

  // ── 2. General rate limiting on other /api/ routes (excluding NextAuth internals) ──
  const isNextAuthInternal = pathname.startsWith('/api/auth/') && !isSensitiveAuth;
  if (!isNextAuthInternal && pathname.startsWith('/api/')) {
    const tier = pathname.startsWith('/api/store/orders') || pathname.startsWith('/api/v1/orders')
      ? 'order'
      : pathname.startsWith('/api/chat') || pathname.startsWith('/api/ai')
      ? 'ai'
      : 'global';

    const rateLimit = await checkRateLimit(ip, tier);
    if (!rateLimit.success) {
      const resp = createRateLimitResponse(rateLimit);
      const corsHeaders = getCorsHeaders(req);
      for (const [k, v] of Object.entries(corsHeaders)) {
        resp.headers.set(k, v);
      }
      return resp;
    }
  }

  // ── 3. Cache poisoning protection & private routes ──────────────────────────
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
    response.headers.set('Vary', 'Cookie, Authorization, Origin');

    // Attach dynamic CORS headers to API responses
    if (pathname.startsWith('/api/')) {
      const corsHeaders = getCorsHeaders(req);
      for (const [k, v] of Object.entries(corsHeaders)) {
        response.headers.set(k, v);
      }
    }

    return response;
  }

  // Pass to Auth Middleware for remaining routes
  const finalResponse = await (authMiddleware as (req: NextRequest, event: NextFetchEvent) => Promise<NextResponse | Response | undefined>)(req, event);
  if (finalResponse && pathname.startsWith('/api/')) {
    const corsHeaders = getCorsHeaders(req);
    for (const [k, v] of Object.entries(corsHeaders)) {
      finalResponse.headers.set(k, v);
    }
  }

  return finalResponse;
}

export const config = {
  // Match admin routes, API routes, and private/authenticated routes for auth & cache-poisoning protection.
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
    "/invoice/:path*",
  ],
};
