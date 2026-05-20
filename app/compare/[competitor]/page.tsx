import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MarketingCTA,
  MarketingFooter,
  MarketingHeader,
} from '@/components/marketing/shell'
import { COMPARISONS, type ComparisonPage } from '@/lib/seo-content'
import { SITE_URL } from '@/lib/site'

type Props = { params: Promise<{ competitor: string }> }

export function generateStaticParams() {
  return Object.keys(COMPARISONS).map(competitor => ({ competitor }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor } = await params
  const page = COMPARISONS[competitor]
  if (!page) return { title: 'Not found' }
  return {
    title: `${page.title} · LocalPunch`,
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/compare/${page.slug}` },
  }
}

export default async function ComparePage({ params }: Props) {
  const { competitor } = await params
  const page = COMPARISONS[competitor]
  if (!page) notFound()

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <MarketingHeader />
      <CompareContent page={page} />
      <MarketingCTA />
      <MarketingFooter />
    </div>
  )
}

function CompareContent({ page }: { page: ComparisonPage }) {
  return (
    <main className="max-w-4xl mx-auto px-5 py-16 lg:py-24">
      <Link href="/compare" className="text-sm text-[#6B7280] hover:text-[#1a1a1a]">
        ← All comparisons
      </Link>
      <h1
        className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {page.h1}
      </h1>
      <p className="text-lg text-[#5A554C] mt-4 leading-relaxed">{page.summary}</p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-sm border-2 border-[#1a1a1a] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#1a1a1a] text-white">
              <th className="text-left p-3 font-semibold"> </th>
              <th className="text-left p-3 font-semibold">LocalPunch</th>
              <th className="text-left p-3 font-semibold">{page.competitor}</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row, i) => (
              <tr key={row.label} className={i % 2 ? 'bg-[#F4F4F0]' : 'bg-white'}>
                <td className="p-3 font-semibold border-t border-[#E7E6DF]">{row.label}</td>
                <td className="p-3 border-t border-[#E7E6DF]">{row.localpunch}</td>
                <td className="p-3 border-t border-[#E7E6DF] text-[#5A554C]">{row.them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-12">
        <div className="lp-card p-6">
          <h2 className="font-bold text-[#1a1a1a]">Pick LocalPunch when</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#5A554C]">
            {page.whenPickUs.map(w => (
              <li key={w} className="flex gap-2">
                <span className="text-green-700 font-bold">✓</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="lp-card p-6 bg-[#F4F4F0]">
          <h2 className="font-bold text-[#1a1a1a]">Pick {page.competitor} when</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#5A554C]">
            {page.whenPickThem.map(w => (
              <li key={w} className="flex gap-2">
                <span>·</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-sm text-[#9CA3AF] mt-10">
        <Link href="/pricing" className="underline hover:text-[#1a1a1a]">
          See pricing
        </Link>
        {' · '}
        <Link href="/blog/localpunch-vs-stamp-me" className="underline hover:text-[#1a1a1a]">
          Read the full blog comparison
        </Link>
      </p>
    </main>
  )
}
