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
  
  // Webpack optimizations
  webpack: (config) => {
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        pixi: {
          test: /[\\/]node_modules[\\/]pixi\.js[\\/]/,
          name: 'pixi',
          chunks: 'all',
          priority: 10,
        },
      },
    };
    
    return config;
  },
  
  // SWC minification is enabled by default in Next.js 13+
};

export default nextConfig;
