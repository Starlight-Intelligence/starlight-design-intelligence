import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The package exports TypeScript source; Next compiles it like app code.
  transpilePackages: ['@starlight/materials'],
  reactStrictMode: true,
};

export default nextConfig;
