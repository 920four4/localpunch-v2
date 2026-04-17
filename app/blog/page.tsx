import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate, type BlogPostSummary } from '@/lib/blog'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = 'https://localpunch-v2.vercel.app'

export const metadata: Metadata = {
  title: 'Blog — LocalPunch',
  description:
    'Practical tips on loyalty programs, repeat customers, and running a local business. No fluff, no jargon.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'LocalPunch Blog — tips for local business owners',
    description:
      'Practical tips on loyalty programs, repeat customers, and running a local business.',
    url: `${SITE_URL}/blog`,
    siteName: 'LocalPunch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalPunch Blog',
    description:
      'Practical tips on loyalty programs, repeat customers, and running a local business.',
  },
}

export default async function BlogIndexPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, excerpt, cover_image_url, tags, author_name, published_at, reading_time_minutes',
    )
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(50)

  const posts = (data ?? []) as BlogPostSummary[]

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />
      <main className="max-w-4xl mx-auto px-5 py-12 lg:py-20">
        <header className="mb-10 lg:mb-14">
          <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-2 font-semibold">
            The LocalPunch Blog
          </p>
          <h1
            className="text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Loyalty, repeat customers, and running a local shop.
          </h1>
          <p className="text-lg text-[#6B7280] mt-4 max-w-2xl">
            Practical guides written for owners, not VCs. No buzzwords.
          </p>
        </header>

        {posts.length === 0 ? (
          <ComingSoon />
        ) : (
          <ul className="space-y-8">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  )
}

function PostCard({ post }: { post: BlogPostSummary }) {
  return (
    <li className="border-b border-[#E5E7EB] pb-8 last:border-0">
      <Link href={`/blog/${post.slug}`} className="group block">
        {post.cover_image_url && (
          <div className="aspect-[2/1] rounded-xl overflow-hidden border-2 border-[#1a1a1a] mb-5 bg-[#F4F4F0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h2
          className="text-2xl lg:text-3xl font-bold tracking-tight group-hover:underline decoration-[#FFE566] decoration-4 underline-offset-4"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-[#6B7280] mt-3 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#9CA3AF] mt-4">
          <span>{formatDate(post.published_at)}</span>
          {post.reading_time_minutes && (
            <>
              <span>·</span>
              <span>{post.reading_time_minutes} min read</span>
            </>
          )}
          {post.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center bg-[#F4F4F0] text-[#6B7280] px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </li>
  )
}

function ComingSoon() {
  return (
    <div className="nb-card-flat p-10 lg:p-14 text-center bg-white">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#FFE566] border-2 border-[#1a1a1a] flex items-center justify-center text-3xl">
        ✏️
      </div>
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        Coming soon
      </h2>
      <p className="text-[#6B7280] mt-2 max-w-md mx-auto">
        We&rsquo;re cooking up honest, useful articles for local business
        owners. Loyalty guides, real numbers, and case studies from the
        field.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link
          href="/"
          className="bg-[#1a1a1a] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-black transition"
        >
          Back to home
        </Link>
        <Link
          href="/login?role=business"
          className="bg-white text-[#1a1a1a] rounded-full px-5 py-2.5 text-sm font-semibold border-2 border-[#1a1a1a] hover:bg-[#F4F4F0] transition"
        >
          Start your shop
        </Link>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="border-b border-[#1a1a1a]/10 bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#FFE566] rounded-md text-sm">
            🥊
          </span>
          LocalPunch
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/blog" className="font-semibold text-[#1a1a1a]">
            Blog
          </Link>
          <Link
            href="/#pricing"
            className="text-[#6B7280] hover:text-[#1a1a1a]"
          >
            Pricing
          </Link>
          <Link
            href="/login?role=business"
            className="bg-[#1a1a1a] text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-black transition"
          >
            Start my shop
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a]/10 py-10 mt-20">
      <div className="max-w-5xl mx-auto px-5 text-sm text-[#6B7280] flex flex-col sm:flex-row justify-between gap-3">
        <p>© {new Date().getFullYear()} LocalPunch. Made for local shops.</p>
        <div className="flex gap-5">
          <Link href="/blog" className="hover:text-[#1a1a1a]">
            Blog
          </Link>
          <Link href="/privacy-policy" className="hover:text-[#1a1a1a]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#1a1a1a]">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
