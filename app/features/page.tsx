import type { Metadata } from 'next'
import {
  MarketingCTA,
  MarketingFooter,
  MarketingHeader,
} from '@/components/marketing/shell'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Digital Punch Card Features · LocalPunch',
  description:
    'Rotating QR fraud prevention, one-tap punching, manual punch by phone, analytics, and CSV export. No hardware or POS required.',
  alternates: { canonical: `${SITE_URL}/features` },
}

const features = [
  {
    title: 'Rotating counter QR',
    body: 'Your shop QR refreshes every few minutes. Screenshots stop working — customers have to be in the store to punch.',
  },
  {
    title: 'One-tap punch',
    body: 'Merchant screen is basically one button. Works on any phone or tablet browser.',
  },
  {
    title: 'Manual punch',
    body: 'Customer forgot their phone? Punch by phone number from the merchant dashboard.',
  },
  {
    title: 'No customer app',
    body: 'Scan QR → SMS verify → browser wallet. Most customers save to home screen.',
  },
  {
    title: 'Unlimited programs',
    body: 'Run a drink card, a food card, or seasonal rewards — no extra fees.',
  },
  {
    title: 'Analytics & export',
    body: 'See punches over time and export your customer list when you need it.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <MarketingHeader />
      <main className="max-w-4xl mx-auto px-5 py-16 lg:py-24">
        <p className="lp-eyebrow text-center">Features</p>
        <h1
          className="mt-3 text-4xl sm:text-5xl font-bold text-center tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Everything you need. Nothing you don&apos;t.
        </h1>
        <p className="text-lg text-[#5A554C] text-center mt-4 max-w-2xl mx-auto">
          LocalPunch is a punch card, not a marketing agency in a box. Built for
          owners who want repeat visits, not dashboards they&apos;ll never open.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 mt-14">
          {features.map(f => (
            <div key={f.title} className="lp-card p-6">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {f.title}
              </h2>
              <p className="text-sm text-[#5A554C] mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </main>
      <MarketingCTA />
      <MarketingFooter />
    </div>
  )
}
