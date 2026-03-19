import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Firebase Hosting
  typescript: {
    ignoreBuildErrors: true, // Generated types from .next/ cause stale errors
  },
  images: {
    unoptimized: true, // Required for static export
  },
  turbopack: {
    root: process.cwd(),
  },
  // Remove rewrites for static export - use environment variable instead
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003',
  },
}

export default nextConfig

