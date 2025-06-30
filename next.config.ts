import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your existing config options here
};

export const config = {
  matcher: ["/"], // apply middleware to homepage
};

export default nextConfig;
