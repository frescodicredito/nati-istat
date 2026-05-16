import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["../data/processed/**/*.json"],
    "/metodologia": ["../data/processed/**/*.json"],
    "/dati": ["../data/processed/**/*.json"],
  },
};

export default nextConfig;
