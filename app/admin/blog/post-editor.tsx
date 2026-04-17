'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { BlogPost, BlogStatus } from '@/lib/blog'

type EditorPost = Partial<BlogPost> & { content?: string }

export default function PostEditor({
  post,
  mode,
}: {
  post: EditorPost
  mode: 'new' | 'edit'
}) {
  const router = useRouter()
  const [isPending, start] = useTransition()

  const [title, setTitle] = useState(post.title ?? '')
  const [slug, setSlug] = useState(post.slug ?? '')
  const [excerpt, setExcerpt] = useState(post.excerpt ?? '')
  const [content, setContent] = useState(post.content ?? '')
  const [coverImage, setCoverImage] = useState(post.cover_image_url ?? '')
  const [tags, setTags] = useState((post.tags ?? []).join(', '))
  const [authorName, setAuthorName] = useState(post.author_name ?? 'LocalPunch Team')
  const [status, setStatus] = useState<BlogStatus>(post.status ?? 'draft')
  const [seoTitle, setSeoTitle] = useState(post.seo_title ?? '')
  const [seoDescription, setSeoDescription] = useState(post.seo_description ?? '')

  async function save(newStatus?: BlogStatus) {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!content.trim()) {
      toast.error('Content is required')
      return
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || null,
      content,
      cover_image_url: coverImage.trim() || null,
      tags: tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      author_name: authorName.trim() || 'LocalPunch Team',
      status: newStatus ?? status,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
    }

    start(async () => {
      const res = await fetch(
        mode === 'new'
          ? '/api/admin/blog'
          : `/api/admin/blog/${post.id}`,
        {
          method: mode === 'new' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Save failed')
        return
      }
      toast.success(
        newStatus === 'published'
          ? 'Published 🎉'
          : mode === 'new'
          ? 'Saved as draft'
          : 'Saved',
      )
      if (mode === 'new') {
        router.push(`/admin/blog/${data.post.id}`)
      } else {
        setStatus(data.post.status)
        router.refresh()
      }
    })
  }

  async function del() {
    if (mode !== 'edit' || !post.id) return
    if (!confirm('Delete this post? This cannot be undone.')) return
    start(async () => {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Delete failed')
        return
      }
      toast.success('Deleted')
      router.push('/admin/blog')
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/blog"
            className="text-sm text-[#6B7280] hover:text-[#1a1a1a]"
          >
            ← All posts
          </Link>
          <h1 className="page-header text-2xl mt-1">
            {mode === 'new' ? 'New post' : 'Edit post'}
          </h1>
          {mode === 'edit' && post.slug && (
            <p className="text-xs text-[#9CA3AF] font-mono mt-0.5">
              /blog/{post.slug} · {status}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {mode === 'edit' && (
            <button
              onClick={del}
              disabled={isPending}
              className="nb-btn-ghost text-xs px-4 py-2 text-red-600 border-red-200"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => save('draft')}
            disabled={isPending}
            className="nb-btn-ghost text-xs px-4 py-2"
          >
            {isPending ? 'Saving…' : 'Save draft'}
          </button>
          <button
            onClick={() => save('published')}
            disabled={isPending}
            className="bg-[#1a1a1a] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-black transition disabled:opacity-50"
          >
            {status === 'published' ? 'Update post' : 'Publish →'}
          </button>
        </div>
      </div>

      <Field label="Title">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="The best loyalty program for your coffee shop"
          className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Slug"
          hint="Auto-derived from title if left blank. URL: /blog/<slug>"
        >
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="best-loyalty-program-coffee-shop"
            className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
          />
        </Field>
        <Field label="Author name">
          <input
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
          />
        </Field>
      </div>

      <Field label="Excerpt" hint="Short summary used on the blog index and meta description fallback.">
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Practical, no-fluff tips for small shops running loyalty programs."
          className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
        />
      </Field>

      <Field label="Cover image URL">
        <input
          value={coverImage}
          onChange={e => setCoverImage(e.target.value)}
          placeholder="https://…/image.jpg"
          className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
        />
      </Field>

      <Field
        label="Tags"
        hint="Comma separated, e.g. coffee-shop, loyalty, guides"
      >
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="coffee-shop, loyalty, guides"
          className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
        />
      </Field>

      <Field
        label="Content (Markdown)"
        hint="Supports GFM: headings, lists, links, tables, code fences, blockquotes."
      >
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={24}
          placeholder="# Intro paragraph…&#10;&#10;## First section&#10;&#10;- Bullet&#10;- Bullet"
          className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-3 text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
        />
      </Field>

      <details className="nb-card-flat p-4">
        <summary className="cursor-pointer font-semibold text-sm">
          SEO overrides (optional)
        </summary>
        <div className="mt-4 space-y-4">
          <Field
            label="SEO title"
            hint="Overrides <title>. Falls back to post title."
          >
            <input
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
            />
          </Field>
          <Field
            label="SEO description"
            hint="Overrides meta description. Falls back to excerpt."
          >
            <textarea
              value={seoDescription}
              onChange={e => setSeoDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
            />
          </Field>
        </div>
      </details>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#9CA3AF] mt-1">{hint}</span>}
    </label>
  )
}
