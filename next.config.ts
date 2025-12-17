import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
        port: "7015",
        pathname: "/api/files/image",
      },
    ],
    // Disable optimization for localhost to avoid SSL/certificate issues
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
