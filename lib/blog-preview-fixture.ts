import { readFileSync } from 'node:fs'
import path from 'node:path'
import { estimateReadingMinutes, type BlogPost } from '@/lib/blog'
import {
  isPreviewDraftFixtureEnabled,
  PREVIEW_DRAFT_FIXTURE_SLUG,
} from '@/lib/blog-preview-guard'

// Saved production draft this fixture previews. The row is not read or written
// here — Press updates its cover_image_url separately.
export const PREVIEW_DRAFT_ID = 'a519ba66-ff8c-4ad3-95ec-8dd029b5d6d2'

export const PREVIEW_COVER_PATH = '/images/blog/stop-punch-card-cheating/cover.png'
export const PREVIEW_SHARE_PATH = '/images/blog/stop-punch-card-cheating/share.png'
export const PREVIEW_COVER_WIDTH = 1600
export const PREVIEW_COVER_HEIGHT = 900
export const PREVIEW_SHARE_WIDTH = 1200
export const PREVIEW_SHARE_HEIGHT = 630

const FIXTURE_DIR = path.join(
  process.cwd(),
  'content/blog-draft-fixtures/stop-punch-card-cheating',
)

type FixtureMeta = {
  title_tag: string
  meta_description: string
  slug: string
  h1: string
  canonical: string
  go_live_date: string
  cover_alt: string
  share_alt: string
}

export type PreviewDraftFixture = {
  post: BlogPost
  titleTag: string
  metaDescription: string
  canonical: string
  coverAlt: string
  shareAlt: string
  coverPath: string
  sharePath: string
  jsonLd: unknown[]
}

let cached: PreviewDraftFixture | null = null

function readFixture(): PreviewDraftFixture {
  if (cached) return cached

  const meta = JSON.parse(readFileSync(path.join(FIXTURE_DIR, 'meta.json'), 'utf8')) as FixtureMeta
  const jsonLd = JSON.parse(readFileSync(path.join(FIXTURE_DIR, 'jsonld.json'), 'utf8')) as unknown[]
  const content = readFileSync(path.join(FIXTURE_DIR, 'post.md'), 'utf8')

  if (meta.slug !== PREVIEW_DRAFT_FIXTURE_SLUG) {
    throw new Error('Preview fixture slug does not match the packaged meta.json slug')
  }

  cached = {
    post: {
      id: PREVIEW_DRAFT_ID,
      slug: meta.slug,
      title: meta.h1,
      excerpt: null,
      content,
      cover_image_url: PREVIEW_COVER_PATH,
      tags: [],
      author_name: 'LocalPunch',
      status: 'draft',
      // Planned go-live, shown by the blog template. Not a published_at write.
      published_at: `${meta.go_live_date}T12:00:00.000Z`,
      seo_title: meta.title_tag,
      seo_description: meta.meta_description,
      reading_time_minutes: estimateReadingMinutes(content),
      created_by: null,
      created_at: '2026-11-09T00:00:00.000Z',
      updated_at: '2026-11-09T00:00:00.000Z',
    },
    titleTag: meta.title_tag,
    metaDescription: meta.meta_description,
    canonical: meta.canonical,
    coverAlt: meta.cover_alt,
    shareAlt: meta.share_alt,
    coverPath: PREVIEW_COVER_PATH,
    sharePath: PREVIEW_SHARE_PATH,
    jsonLd,
  }
  return cached
}

// Returns the local draft only on Vercel preview deployments.
// Production blog index, sitemap, and llms.txt never call this.
export function getPreviewDraftFixture(
  slug: string,
  env: string | undefined = process.env.VERCEL_ENV,
): PreviewDraftFixture | null {
  if (!isPreviewDraftFixtureEnabled(env)) return null
  if (slug !== PREVIEW_DRAFT_FIXTURE_SLUG) return null
  return readFixture()
}
