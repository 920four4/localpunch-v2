import type { MetadataRoute } from 'next'

const SITE_URL = 'https://localpunch-v2.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/merchant/',
          '/auth/',
          '/wallet',
          '/history',
          '/card/',
          '/scan',
          '/onboard',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
