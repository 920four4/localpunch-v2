import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { INDUSTRIES } from '@/lib/seo-content'
import { COMPARISONS } from '@/lib/seo-content'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  const staticPaths = [
    '/',
    '/blog',
    '/pricing',
    '/features',
    '/how-it-works',
    '/compare',
    '/privacy-policy',
    '/terms',
    ...Object.keys(INDUSTRIES).map(s => `/for/${s}`),
    ...Object.keys(COMPARISONS).map(s => `/compare/${s}`),
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(path => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/for/') || path.startsWith('/compare/') ? 0.85 : 0.8,
  }))

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...postEntries]
}
