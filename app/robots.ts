import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

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
          '/login',
          '/wallet',
          '/history',
          '/card/',
          '/scan',
          '/onboard',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot'],
        allow: ['/', '/blog', '/for/', '/compare', '/pricing', '/features', '/how-it-works', '/llms.txt'],
        disallow: ['/api/', '/admin/', '/merchant/', '/auth/', '/login'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
