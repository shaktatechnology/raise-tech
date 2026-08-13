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
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;