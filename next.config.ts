import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  // The preview fixture reads these files with fs from the blog post route.
  // They are not imported, so the file tracer needs an explicit include.
  outputFileTracingIncludes: {
    '/blog/[slug]': ['./content/blog-draft-fixtures/stop-punch-card-cheating/**/*'],
  },
}

export default nextConfig
