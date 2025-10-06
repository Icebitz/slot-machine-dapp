import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Bundle optimization
  experimental: {
    optimizePackageImports: ['pixi.js'],
  },
  
  // Use Next.js defaults for webpack to keep HMR stable
  webpack: (config) => config,
  
  // SWC minification is enabled by default in Next.js 13+
};

export default nextConfig;
