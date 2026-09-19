import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./knowledge_base/**/*"],
  },
};

export default nextConfig;
