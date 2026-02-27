import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-lib.com"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3007"
      }
    ]
  }
};

export default nextConfig;
