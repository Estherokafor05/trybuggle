import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Certificate PDFs embed the bundled Inter fonts (src/server/fonts).
  outputFileTracingIncludes: {
    "/api/me/certificates/**": ["src/server/fonts/**/*"],
  },
};

export default nextConfig;
