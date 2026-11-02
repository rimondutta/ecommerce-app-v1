import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://toyhourse.com';

  // SECURITY NOTE: robots.txt is advisory only — it cannot enforce access control.
  // Admin routes (/admin/*) and internal API routes (/api/*) are intentionally
  // NOT listed here: listing paths in robots.txt advertises them to attackers.
  //
  // Access control for /admin/* and /api/admin/* is enforced by:
  //   • next-auth middleware in src/proxy.ts (role-based JWT checks)
  //   • API route handlers (server-side session/token verification)
  //
  // noindex for /account, /checkout, /wishlist is set via X-Robots-Tag response
  // headers (or generateMetadata({ robots: 'noindex' })) at the route level —
  // keeping them out of robots.txt so their paths are not disclosed.

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow only paths with no SEO value that are safe to disclose.
        // Do NOT list /admin, /api, or other sensitive internal paths here.
        disallow: [
          '/checkout/',
          '/checkout/success',
          '/account',
          '/wishlist',
          '/invoice/',
          '/track-order',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
