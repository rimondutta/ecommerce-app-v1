import { NextRequest, NextResponse } from "next/server";

/**
 * Enterprise CORS Handler for Toy Hourse API & Mobile Endpoints.
 *
 * Security Controls:
 * 1. Never falls back to wildcard '*' in production for authenticated or data-returning endpoints.
 * 2. Validates incoming browser Origin against an allowlist configured via MOBILE_ALLOWED_ORIGINS.
 * 3. In development (NODE_ENV === 'development'), permits localhost and loopback interfaces on any port.
 * 4. Permits native mobile app requests and server-to-server calls that do not emit a browser Origin header.
 * 5. Handles OPTIONS preflight requests with 204 No Content and appropriate caching headers.
 * 6. Always attaches 'Vary: Origin' to prevent CDN edge cache pollution across different origins.
 */

// Default trusted origins if MOBILE_ALLOWED_ORIGINS is not explicitly configured
const DEFAULT_ALLOWED_ORIGINS = [
  "https://toyhourse.com",
  "https://www.toyhourse.com",
  "https://app.toyhourse.com",
];

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.MOBILE_ALLOWED_ORIGINS || process.env.MOBILE_ORIGIN;
  if (!envOrigins) {
    return process.env.NODE_ENV === "production" ? DEFAULT_ALLOWED_ORIGINS : [];
  }
  return envOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    // Non-browser requests (native iOS/Android Expo apps, backend curl, webhooks)
    return true;
  }

  // Development mode: permit local frontend and mobile dev servers
  if (process.env.NODE_ENV === "development") {
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin === "http://localhost" ||
      origin === "http://127.0.0.1"
    ) {
      return true;
    }
  }

  const allowedList = getAllowedOrigins();
  return allowedList.includes(origin);
}

export function getCorsHeaders(
  req?: Request | NextRequest | null,
  allowedMethods = "GET, POST, PUT, DELETE, OPTIONS"
): Record<string, string> {
  const origin = req ? req.headers.get("origin") : null;
  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": allowedMethods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key, X-Requested-With",
    "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
  };

  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else if (!origin && process.env.NODE_ENV === "development") {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

/**
 * Standard preflight handler for OPTIONS routes
 */
export function handleCorsPreflight(req: Request | NextRequest, allowedMethods = "GET, POST, PUT, DELETE, OPTIONS"): NextResponse {
  const headers = getCorsHeaders(req, allowedMethods);
  return new NextResponse(null, {
    status: 204,
    headers,
  });
}

/**
 * Helper to wrap any JSON response with compliant CORS headers
 */
export function jsonWithCors<T>(
  req: Request | NextRequest,
  data: T,
  init?: ResponseInit,
  allowedMethods = "GET, POST, PUT, DELETE, OPTIONS"
): NextResponse {
  const corsHeaders = getCorsHeaders(req, allowedMethods);
  const responseHeaders = new Headers(init?.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    responseHeaders.set(key, value);
  }

  return NextResponse.json(data, {
    ...init,
    headers: responseHeaders,
  });
}
