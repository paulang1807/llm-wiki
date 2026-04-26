import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local network IP for development
  allowedDevOrigins: ['192.168.4.21'],
};

export default nextConfig;
