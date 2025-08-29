/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['res.cloudinary.com']
  },
  webpack: (config, { isServer }) => {
    // Handle optional dependencies for WebSocket
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      "utf-8-validate": false,
    };
    
    // Ignore critical dependency warnings from @supabase/realtime-js
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    
    return config;
  },
  // Exclude problematic packages from Edge Runtime
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
