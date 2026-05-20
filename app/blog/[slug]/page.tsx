import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MarketingFooter, MarketingHeader } from '@/components/marketing/shell'
import { createClient } from '@/lib/supabase/server'
import {
  formatDate,
  renderMarkdown,
  type BlogPost,
} from '@/lib/blog'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { SITE_URL } from '@/lib/site'

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle()
  return (data as BlogPost | null) ?? null
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Not found — LocalPunch' }

  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt || undefined
  const canonical = `${SITE_URL}/blog/${post.slug}`

  const coverImage = post.cover_image_url
    ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: title }]
    : undefined

  return {
    title: `${title} — LocalPunch`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'LocalPunch',
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      authors: [post.author_name],
      ...(coverImage ? { images: coverImage } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(coverImage ? { images: coverImage.map((image) => image.url) } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const html = await renderMarkdown(post.content)

  // JSON-LD Article schema for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.seo_description || undefined,
    author: {
      '@type': 'Organization',
      name: post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LocalPunch',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon.svg`,
      },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    image: post.cover_image_url || undefined,
    keywords: post.tags.join(', '),
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingHeader />

      <article className="max-w-2xl mx-auto px-5 py-10 lg:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-[#6B7280] hover:text-[#1a1a1a] mb-8"
        >
          ← All posts
        </Link>

        <header className="mb-10">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-[#F4F4F0] text-[#6B7280] px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1
            className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-[#6B7280] mt-4 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm text-[#9CA3AF] mt-6">
            <span>{post.author_name}</span>
            <span>·</span>
            <span>{formatDate(post.published_at)}</span>
            {post.reading_time_minutes && (
              <>
                <span>·</span>
                <span>{post.reading_time_minutes} min read</span>
              </>
            )}
          </div>
        </header>

        {post.cover_image_url && (
          <div className="aspect-[2/1] rounded-xl overflow-hidden border-2 border-[#1a1a1a] mb-10 bg-[#F4F4F0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div
          className="prose-content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <hr className="my-12 border-[#E5E7EB]" />

        <div className="nb-card-flat p-6 lg:p-8 bg-[#FFE566] text-center">
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Turn visits into regulars.
          </h3>
          <p className="text-sm text-[#1a1a1a]/80 max-w-md mx-auto mb-5">
            LocalPunch is the simple, paper-free punch card for local shops.
            $60/month or $600/year, cancel anytime.
          </p>
          <Link
            href="/login?role=business"
            className="inline-block bg-[#1a1a1a] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-black transition"
          >
            Start my shop →
          </Link>
        </div>
      </article>

      <MarketingFooter />
    </div>
  )
}

