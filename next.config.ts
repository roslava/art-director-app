import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.21.120.88"],
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
