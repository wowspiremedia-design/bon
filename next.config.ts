import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.bonvoyagers.co",
        pathname: "/**",
      },
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
};

export default nextConfig;
