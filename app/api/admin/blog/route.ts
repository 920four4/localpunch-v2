import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeBlogAdmin } from '@/lib/blog-auth'
import { estimateReadingMinutes, slugify } from '@/lib/blog'

const createSchema = z.object({
  slug: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  cover_image_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).max(12).optional(),
  author_name: z.string().max(80).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  published_at: z.string().datetime().optional().nullable(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(500).optional().nullable(),
})

// GET /api/admin/blog?status=draft&limit=50
// Lists all posts for the admin (bypasses RLS published filter).
export async function GET(request: NextRequest) {
  const auth = await authorizeBlogAdmin(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200)

  let q = auth.supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

// POST /api/admin/blog — create a new post.
// Body matches createSchema. `slug` auto-derived from title if omitted.
// If status='published' and published_at omitted, uses NOW().
export async function POST(request: NextRequest) {
  const auth = await authorizeBlogAdmin(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const input = parsed.data

  const slug = slugify(input.slug ?? input.title)
  const status = input.status ?? 'draft'
  const published_at =
    status === 'published'
      ? input.published_at ?? new Date().toISOString()
      : input.published_at ?? null

  const row = {
    slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    content: input.content,
    cover_image_url: input.cover_image_url ?? null,
    tags: input.tags ?? [],
    author_name: input.author_name ?? 'LocalPunch Team',
    status,
    published_at,
    seo_title: input.seo_title ?? null,
    seo_description: input.seo_description ?? null,
    reading_time_minutes: estimateReadingMinutes(input.content),
  }

  const { data, error } = await auth.supabase
    .from('blog_posts')
    .insert(row)
    .select('*')
    .single()

  if (error) {
    const code = error.code === '23505' ? 409 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
  return NextResponse.json({ post: data }, { status: 201 })
}
