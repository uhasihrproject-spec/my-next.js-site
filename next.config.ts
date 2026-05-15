import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "**.cryptocompare.com" },
    ],
  },
  eslint: {
    // Don't fail the production build on lint warnings — lint is checked separately.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
