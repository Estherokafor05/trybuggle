import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lesson builder images are up to 1.5 MB, sent through a server action.
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  // Certificate PDFs embed the bundled Inter fonts (src/server/fonts).
  outputFileTracingIncludes: {
    "/api/me/certificates/**": ["src/server/fonts/**/*"],
  },
};

export default nextConfig;
