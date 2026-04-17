import { marked } from 'marked'
import readingTime from 'reading-time'

export type BlogStatus = 'draft' | 'published' | 'archived'

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  tags: string[]
  author_name: string
  status: BlogStatus
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  reading_time_minutes: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type BlogPostSummary = Pick<
  BlogPost,
  | 'id'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'cover_image_url'
  | 'tags'
  | 'author_name'
  | 'published_at'
  | 'reading_time_minutes'
>

// Basic slugify: lowercase, spaces→hyphens, strip non-alphanumeric-hyphen.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function estimateReadingMinutes(markdown: string): number {
  const { minutes } = readingTime(markdown)
  return Math.max(1, Math.round(minutes))
}

// Configured once. GFM enabled for tables/autolinks. No `mangle` / `headerIds`
// args: those were removed in marked v12. We sanitize by trusting admin-only
// authorship (RLS enforced at DB).
marked.setOptions({ gfm: true, breaks: false })

export async function renderMarkdown(md: string): Promise<string> {
  return marked.parse(md) as string
}

export function postUrl(slug: string, base?: string): string {
  const root = base ?? 'https://localpunch-v2.vercel.app'
  return `${root}/blog/${slug}`
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
