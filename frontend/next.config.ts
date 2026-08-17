import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Required in dev because "localhost" resolves to a loopback IP,
    // which Next.js blocks by default as an SSRF safeguard.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
      },
    ],
  },
};

export default nextConfig;