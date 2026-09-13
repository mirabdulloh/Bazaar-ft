import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd()
  },
  images: {
    // Serve AVIF/WebP at the size actually displayed. With this off, the hero
    // banners shipped as multi-MB originals (banner-66-hq.jpg alone is 5.09MB).
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.bazaarshop.me"
      },
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
