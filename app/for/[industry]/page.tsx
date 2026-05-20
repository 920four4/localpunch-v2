import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MarketingCTA,
  MarketingFooter,
  MarketingHeader,
  JsonLd,
} from '@/components/marketing/shell'
import { INDUSTRIES, type IndustryPage } from '@/lib/seo-content'
import { SITE_URL } from '@/lib/site'

type Props = { params: Promise<{ industry: string }> }

export function generateStaticParams() {
  return Object.keys(INDUSTRIES).map(industry => ({ industry }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = await params
  const page = INDUSTRIES[industry]
  if (!page) return { title: 'Not found' }
  return {
    title: `${page.title} · LocalPunch`,
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/for/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `${SITE_URL}/for/${page.slug}`,
    },
  }
}

export default async function IndustryPage({ params }: Props) {
  const { industry } = await params
  const page = INDUSTRIES[industry]
  if (!page) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: `${SITE_URL}/for/${page.slug}`,
    about: {
      '@type': 'Service',
      name: 'Digital punch card loyalty program',
      provider: { '@type': 'Organization', name: 'LocalPunch' },
    },
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <JsonLd data={jsonLd} />
      <MarketingHeader />
      <IndustryContent page={page} />
      <MarketingCTA
        headline={`Launch your ${page.slug.replace(/-/g, ' ')} loyalty program`}
      />
      <MarketingFooter />
    </div>
  )
}

function IndustryContent({ page }: { page: IndustryPage }) {
  return (
    <main className="max-w-4xl mx-auto px-5 py-16 lg:py-24">
      <p className="lp-eyebrow">For {page.slug.replace(/-/g, ' ')}</p>
      <h1
        className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {page.h1}
      </h1>
      <p className="text-lg text-[#5A554C] mt-4 leading-relaxed">{page.subtitle}</p>

      <div className="mt-10 lp-card p-6 bg-[#FFE566]/30">
        <p className="text-sm font-semibold text-[#6B6457]">Example reward</p>
        <p className="text-xl font-bold mt-1">{page.exampleReward}</p>
      </div>

      <section className="mt-12">
        <h2
          className="text-xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Sound familiar?
        </h2>
        <ul className="space-y-3">
          {page.painPoints.map(p => (
            <li key={p} className="flex gap-3 text-[#5A554C] text-sm leading-relaxed">
              <span className="text-[#1a1a1a] font-bold shrink-0">→</span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 grid sm:grid-cols-3 gap-4">
        {page.benefits.map(b => (
          <div key={b.title} className="lp-card p-5">
            <h3 className="font-bold text-sm">{b.title}</h3>
            <p className="text-xs text-[#5A554C] mt-2 leading-relaxed">{b.body}</p>
          </div>
        ))}
      </section>

      {page.relatedBlogSlugs && page.relatedBlogSlugs.length > 0 && (
        <section className="mt-12 border-t border-[#E7E6DF] pt-10">
          <h2 className="text-lg font-bold mb-4">Related guides</h2>
          <ul className="space-y-2">
            {page.relatedBlogSlugs.map(slug => (
              <li key={slug}>
                <Link
                  href={`/blog/${slug}`}
                  className="text-[#1a1a1a] font-medium underline decoration-[#FFE566] decoration-2 underline-offset-4 hover:decoration-4"
                >
                  Read: {slug.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
