import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeBlogAdmin } from '@/lib/blog-auth'
import { estimateReadingMinutes, slugify } from '@/lib/blog'

const updateSchema = z
  .object({
    slug: z.string().min(1).max(80),
    title: z.string().min(1).max(200),
    excerpt: z.string().max(500).nullable(),
    content: z.string().min(1),
    cover_image_url: z.string().url().nullable(),
    tags: z.array(z.string()).max(12),
    author_name: z.string().max(80),
    status: z.enum(['draft', 'published', 'archived']),
    published_at: z.string().datetime().nullable(),
    seo_title: z.string().max(200).nullable(),
    seo_description: z.string().max(500).nullable(),
  })
  .partial()

// GET /api/admin/blog/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeBlogAdmin(request)
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const { data, error } = await auth.supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post: data })
}

// PATCH /api/admin/blog/[id]
// Partial update. If status transitions to 'published' and published_at is null,
// server stamps NOW() automatically.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeBlogAdmin(request)
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const input = parsed.data

  const update: Record<string, unknown> = { ...input }
  if (input.slug) update.slug = slugify(input.slug)
  if (input.content) {
    update.reading_time_minutes = estimateReadingMinutes(input.content)
  }
  if (input.status === 'published') {
    const { data: existing } = await auth.supabase
      .from('blog_posts')
      .select('published_at')
      .eq('id', id)
      .maybeSingle()
    const currentPublishedAt = existing?.published_at as string | null
    if (!('published_at' in input) && !currentPublishedAt) {
      update.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await auth.supabase
    .from('blog_posts')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    const code = error.code === '23505' ? 409 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
  return NextResponse.json({ post: data })
}

// DELETE /api/admin/blog/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeBlogAdmin(request)
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const { error } = await auth.supabase.from('blog_posts').delete().eq('id', id)
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
