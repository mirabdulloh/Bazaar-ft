import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd()
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-lib.com"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3007"
      },
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com"
      },
      {
        protocol: "https",
        hostname: "loremflickr.com"
      },
      {
        protocol: "https",
        hostname: "bazaarshop.me"
      },
      {
        protocol: "https",
        hostname: "www.bazaarshop.me"
      }
    ]
  }
};

export default nextConfig;
