import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.bonvoyagers.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
