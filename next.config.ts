import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    qualities: [68, 75],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bonvoyagers.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "payload.bonvoyagers.co",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/package/andaman-tour-women-bon-suhani-safar',
        destination: '/package/andaman-tour-women-bon-her-journeys',
        permanent: true,
      },
      {
        source: '/package/goa-tour-package-women-suhani-safar',
        destination: '/package/goa-tour-package-women-her-journeys',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
};

export default nextConfig;
