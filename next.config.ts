import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Override the default i18n for react-i18next
  // We handle i18n via react-i18next on the client
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Compress with gzip
  compress: true,

  // Security headers + Content Security Policy
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' needed for: inline theme script, Tailwind JIT
              // 'unsafe-eval' needed for Next.js dev mode; can remove in production
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co"} https://api.asaas.com https://api-sandbox.asaas.com`,
              "img-src 'self' blob: data: https://*.supabase.co https://avatars.githubusercontent.com",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              // Monitor CSP violations
              "report-uri /api/csp-violation",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
