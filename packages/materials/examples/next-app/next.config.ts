import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The package exports TypeScript source; Next compiles it like app code.
  transpilePackages: ['@starlight/materials'],
  // Two lockfiles sit above this app (the package's and this one's); name the root so
  // Turbopack does not guess it and the linked package stays inside it.
  turbopack: { root: fileURLToPath(new URL('../..', import.meta.url)) },
  reactStrictMode: true,
};

export default nextConfig;
