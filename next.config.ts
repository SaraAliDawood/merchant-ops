import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lean, self-contained server bundle for small container images.
  output: 'standalone',
};

export default nextConfig;
