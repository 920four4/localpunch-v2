import { marked } from 'marked'
import readingTime from 'reading-time'
import { z } from 'zod'
import {
  FAQ_MAX_ANSWER,
  FAQ_MAX_ITEMS,
  FAQ_MAX_QUESTION,
  type FaqPair,
} from '@/lib/blog-faq'

export type { FaqPair } from '@/lib/blog-faq'
export {
  coerceFaqPairs,
  faqPageJsonLd,
  parseTrailingFaq,
  resolvePostFaq,
  stripTrailingFaq,
} from '@/lib/blog-faq'

export type BlogStatus = 'draft' | 'published' | 'archived'

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  cover_image_alt: string | null
  faq: FaqPair[] | null
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
  | 'cover_image_alt'
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
  const root = base ?? 'https://www.localpunchcard.io'
  return `${root}/blog/${slug}`
}

/** Alt text for a cover. Uses the provided alt, then the post title. */
export function coverImageAlt(
  alt: string | null | undefined,
  fallback: string,
): string {
  const trimmed = alt?.trim()
  return trimmed ? trimmed : fallback
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const COVER_ALT_MAX = 300

function emptyToNull(value: unknown) {
  if (typeof value === 'string' && value.trim() === '') return null
  return value
}

function emptyFaqToNull(value: unknown) {
  if (value == null) return value
  if (!Array.isArray(value)) return value
  const kept = value.filter(item => {
    if (!item || typeof item !== 'object') return true
    const record = item as Record<string, unknown>
    const question =
      typeof record.question === 'string' ? record.question.trim() : ''
    const answer = typeof record.answer === 'string' ? record.answer.trim() : ''
    return question.length > 0 || answer.length > 0
  })
  return kept.length ? kept : null
}

export const faqPairSchema = z.object({
  question: z.string().trim().min(1).max(FAQ_MAX_QUESTION),
  answer: z.string().trim().min(1).max(FAQ_MAX_ANSWER),
})

/** Shared write fields for POST and PATCH. Omitted keys stay omitted. */
export const blogCoverAndFaqFields = {
  cover_image_url: z.preprocess(
    emptyToNull,
    z.string().trim().url().nullable().optional(),
  ),
  cover_image_alt: z.preprocess(
    emptyToNull,
    z.string().trim().max(COVER_ALT_MAX).nullable().optional(),
  ),
  faq: z.preprocess(
    emptyFaqToNull,
    z.array(faqPairSchema).max(FAQ_MAX_ITEMS).nullable().optional(),
  ),
}
