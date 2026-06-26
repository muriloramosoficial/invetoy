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


};

export default nextConfig;
