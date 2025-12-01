import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "huggingface.co",
        pathname: "/datasets/**",
      },
      {
        protocol: "https",
        hostname: "cas-bridge.xethub.hf.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
