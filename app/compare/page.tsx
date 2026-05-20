import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MarketingCTA,
  MarketingFooter,
  MarketingHeader,
} from '@/components/marketing/shell'
import { COMPARISONS } from '@/lib/seo-content'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Compare Loyalty Apps · LocalPunch',
  description:
    'Honest comparisons of digital punch card and loyalty apps for small businesses. Pricing, features, and who each tool is actually for.',
  alternates: { canonical: `${SITE_URL}/compare` },
}

export default function CompareHubPage() {
  const pages = Object.values(COMPARISONS)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <MarketingHeader />
      <main className="max-w-4xl mx-auto px-5 py-16 lg:py-24">
        <p className="lp-eyebrow text-center">Compare</p>
        <h1
          className="mt-3 text-4xl sm:text-5xl font-bold text-center tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Honest comparisons — no fluff
        </h1>
        <p className="text-lg text-[#5A554C] text-center mt-4 max-w-2xl mx-auto">
          We built LocalPunch for a specific kind of shop. These pages explain
          when we&apos;re the right fit — and when something else might be better.
        </p>
        <ul className="mt-12 space-y-4">
          {pages.map(p => (
            <li key={p.slug}>
              <Link
                href={`/compare/${p.slug}`}
                className="lp-card block p-6 hover:shadow-md transition group"
              >
                <h2
                  className="text-xl font-bold group-hover:underline decoration-[#FFE566] decoration-4 underline-offset-4"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {p.h1}
                </h2>
                <p className="text-sm text-[#5A554C] mt-2">{p.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <MarketingCTA />
      <MarketingFooter />
    </div>
  )
}
