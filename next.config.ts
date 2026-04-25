import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow development from 127.0.0.1 for HMR and Studio
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
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
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos; connect-src 'self' https://api.telegram.org; frame-ancestors 'none';",
          },
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
