import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Tailwind CSS v4 under Turbopack needs its loader registered explicitly.
  // Without this rule, `@import "tailwindcss"` is never compiled and every
  // utility class (flex, grid, p-4 ...) is missing -> the unstyled page.
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
