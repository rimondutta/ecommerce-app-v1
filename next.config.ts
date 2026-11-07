import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling @react-pdf/renderer with webpack.
  // It relies on Node.js built-ins and must run as a server external.
  serverExternalPackages: ['@react-pdf/renderer'],

  // Remove the X-Powered-By header to reduce response payload size.
  // This suppresses the "X-Powered-By: Next.js" response header in production.
  poweredByHeader: false,

  // Enable gzip/brotli compression for all responses.
  compress: true,

  // React strict mode — enables additional runtime checks and helps detect
  // accidental side effects that would cause double renders.
  reactStrictMode: true,

  // Allow development from 127.0.0.1 for HMR and Studio
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  // SECURITY: Never emit source maps to the browser in production.
  // Prevents leaking application source code through browser devtools.
  productionBrowserSourceMaps: false,

  typescript: {
    // Type checking is strictly enforced: 0 errors verified via tsc.
    ignoreBuildErrors: false,
  },

  images: {
    // Serve AVIF first (smallest), fallback to WebP — ~30-40% smaller than JPEG/PNG.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 1 year at the CDN edge.
    minimumCacheTTL: 31536000,
    // SECURITY: Restrict remote image hosts to exactly the services in use.
    // No wildcard hostnames; dangerouslyAllowSVG is omitted (defaults false).
    // CVE class addressed: DNS-restriction bypass in Next.js image optimization —
    // mitigated both by upgrading to 16.3.8 AND tightening remotePatterns here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Restrict to your Cloudinary paths only. Uses specific cloud name "dciffpt3t".
        pathname: `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "dciffpt3t"}/**`,
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      // picsum and unsplash are placeholder/dev hosts used in seeded content.
      // Remove once all product images are fully migrated to Cloudinary.
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    // Tree-shake these large packages to only import what is actually used.
    // Fixes "Reduce unused JavaScript" and "Legacy JavaScript" PageSpeed issues.
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@tabler/icons-react',
      'swiper',
      'react-icons',
      '@heroicons/react',
      'gsap',
    ],
  },

  async headers() {
    // ─── CSP STRATEGY ─────────────────────────────────────────────────────────
    // The official Next.js nonce-based CSP approach forces every page that
    // renders a nonce into dynamic (SSR) mode. For this app the home page and
    // product pages use ISR (export const revalidate = N), so injecting a
    // per-request nonce would eliminate ISR — a significant performance regression.
    //
    // Decision (documented per workflow rule 2):
    //   • Enforced CSP (below): Tightened static policy.
    //       - 'unsafe-eval' REMOVED from production (was present erroneously).
    //       - 'object-src' added as 'none'.
    //       - 'upgrade-insecure-requests' added.
    //       - 'font-src' adds data: for inlined Google Font fallbacks.
    //       - 'unsafe-inline' kept in script-src because the Meta Pixel and the
    //         extension-attribute-cleaner are inline scripts rendered on Client
    //         Components that cannot receive a nonce without forcing SSR.
    //
    //   • Report-Only CSP: A strict nonce+strict-dynamic policy is injected by
    //     proxy.ts (middleware) as Content-Security-Policy-Report-Only so
    //     violations can be monitored in production without breaking ISR.
    //     Flip it to enforced after verifying the report is clean.
    //
    // In development, 'unsafe-eval' is re-added to support HMR / React DevTools.

    const isDev = process.env.NODE_ENV === "development";

    const enforcedCSP = [
      "default-src 'self'",
      // 'unsafe-eval' removed from production; retained in dev for HMR.
      // 'unsafe-inline' retained — removing it requires nonce/hash, which
      // breaks ISR on home/product pages (see strategy note above).
      isDev
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://connect.facebook.net"
        : "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://www.facebook.com https://lh3.googleusercontent.com https://i.pravatar.cc",
      "connect-src 'self' https://api.telegram.org https://www.facebook.com https://res.cloudinary.com https://api.cloudinary.com",
      // object-src 'none' blocks Flash/Java plugin injection attacks.
      "object-src 'none'",
      // frame-ancestors 'none' replaces X-Frame-Options for CSP2+ browsers.
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Force all mixed-content (http://) sub-resource requests to HTTPS.
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        // CORS for the mobile app REST API — no CSP applied to API routes.
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.MOBILE_ORIGIN || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        // Prevent search engine indexing of admin panel routes
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // Standard security headers applied across all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // CSP and X-Frame-Options applied strictly to HTML page routes only (excluding /api routes).
        // This ensures the Expo mobile app's REST API is never affected by browser CSP or frame rules.
        source: "/((?!api/).*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: enforcedCSP,
          },
        ],
      },
      // Static video/font/image assets — cached for 1 year by the browser and CDN.
      // Repeat visitors get these from disk cache instantly (0 network round trips).
      {
        source: "/video/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // /shop → /products (permanent SEO redirect)
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      // /shop?* → /products (preserve query string)
      {
        source: "/shop",
        has: [{ type: "query", key: "category" }],
        destination: "/products?category=:category",
        permanent: true,
      },
      // /product/:slug → /products/:slug
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
